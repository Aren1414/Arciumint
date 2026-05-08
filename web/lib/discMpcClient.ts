"use client";

import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { randomBytes } from "crypto";
import {
  RescueCipher,
  deserializeLE,
  getMXEPublicKey,
  getMXEAccAddress,
  getMempoolAccAddress,
  getExecutingPoolAccAddress,
  getComputationAccAddress,
  getClusterAccAddress,
  getCompDefAccAddress,
  getCompDefAccOffset,
  awaitComputationFinalization,
  x25519,
  getArciumAccountBaseSeed,
  getArciumProgramId,
  buildFinalizeCompDefTx,
} from "@arcium-hq/client";

export const DISC_PROGRAM_ID = new PublicKey(
  "6pbFHZfhjVEvwcWAUGoKbVjLF7rYqkcjkiqvLPAf2KJP"
);

export type DiscDominant = "D" | "I" | "S" | "C";

export type DiscDecryptedResult = {
  d: number;
  i: number;
  s: number;
  c: number;
  dPct: number;
  iPct: number;
  sPct: number;
  cPct: number;
  dominant: DiscDominant;
};

export type DiscSubmission = {
  signature: string;
  computationOffset: anchor.BN;
  computationAccount: PublicKey;
  nonceBytes: Uint8Array;
  sharedSecret: Uint8Array;
};

type BytesLike = Uint8Array | number[];

function toHexBytes(x: BytesLike): number[] {
  return Array.isArray(x) ? x : Array.from(x);
}

function toU8(x: BytesLike): Uint8Array {
  return x instanceof Uint8Array ? x : new Uint8Array(x);
}

function getClusterOffset(): number {
  const raw = process.env.NEXT_PUBLIC_ARCIUM_CLUSTER_OFFSET ?? "456";
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error("Invalid NEXT_PUBLIC_ARCIUM_CLUSTER_OFFSET");
  return n;
}

function mapAnswers(answers: Record<number, string>): bigint[] {
  const out: bigint[] = [];
  for (let i = 1; i <= 28; i++) {
    const v = answers[i];
    if (v === "a") out.push(BigInt(0));
    else if (v === "b") out.push(BigInt(1));
    else if (v === "c") out.push(BigInt(2));
    else if (v === "d") out.push(BigInt(3));
    else throw new Error(`Invalid answer at ${i}`);
  }
  return out;
}

function toPct(x: number, total: number) {
  return Math.round((x / total) * 100);
}

function dominantFrom(d: number, i: number, s: number, c: number): DiscDominant {
  const pairs: Array<[DiscDominant, number]> = [
    ["D", d],
    ["I", i],
    ["S", s],
    ["C", c],
  ];
  pairs.sort((a, b) => b[1] - a[1]);
  return pairs[0][0];
}

async function ensureCompDefReady(provider: anchor.AnchorProvider, program: anchor.Program) {
  const baseSeed = getArciumAccountBaseSeed("ComputationDefinitionAccount");
  const offset = getCompDefAccOffset("compute_disc");

  const compDefPda = PublicKey.findProgramAddressSync(
    [baseSeed, program.programId.toBuffer(), offset],
    getArciumProgramId()
  )[0];

  const info = await provider.connection.getAccountInfo(compDefPda, "confirmed");

  if (!info) {
    await program.methods
      .initComputeDiscCompDef()
      .accounts({
        compDefAccount: compDefPda,
        payer: provider.wallet.publicKey,
        mxeAccount: getMXEAccAddress(program.programId),
      })
      .rpc({ commitment: "confirmed" });
  }

  try {
    const finalizeTx = await buildFinalizeCompDefTx(
      provider,
      Buffer.from(offset).readUInt32LE(),
      program.programId
    );

    const latest = await provider.connection.getLatestBlockhash("confirmed");
    finalizeTx.recentBlockhash = latest.blockhash;
    finalizeTx.lastValidBlockHeight = latest.lastValidBlockHeight;
    finalizeTx.feePayer = provider.wallet.publicKey;

    // @ts-ignore
    await provider.wallet.signTransaction(finalizeTx);
    await provider.sendAndConfirm(finalizeTx, [], { commitment: "confirmed" });
  } catch {}
}

export async function submitDiscMpc(
  provider: anchor.AnchorProvider,
  program: anchor.Program,
  answers: Record<number, string>
): Promise<DiscSubmission> {
  const plaintext = mapAnswers(answers);

  await ensureCompDefReady(provider, program);

  const mxePub = await getMXEPublicKey(provider, program.programId);
  if (!mxePub) throw new Error("MXE public key not available");

  const priv = x25519.utils.randomSecretKey();
  const pub = x25519.getPublicKey(priv);

  const sharedSecret = x25519.getSharedSecret(priv, mxePub as Uint8Array);
  const cipher = new RescueCipher(sharedSecret);

  const nonceBytes = randomBytes(16);
  const ciphertexts = cipher.encrypt(plaintext, nonceBytes);

  if (!Array.isArray(ciphertexts) || ciphertexts.length !== 28) {
    throw new Error(`Unexpected ciphertext length: ${ciphertexts?.length}`);
  }

  const computationOffset = new anchor.BN(randomBytes(8), "hex");
  const clusterOffset = getClusterOffset();

  const computationAccount = getComputationAccAddress(clusterOffset, computationOffset);

  
  const sig = await program.methods
    .computeDisc(
      computationOffset,
      Array.from(pub),
      new anchor.BN(deserializeLE(nonceBytes).toString()),
      ciphertexts.map((c) => Array.from(c)) // Vec<[u8;32]>
    )
    .accountsPartial({
      payer: provider.wallet.publicKey,
      computationAccount,
      clusterAccount: getClusterAccAddress(clusterOffset),
      mxeAccount: getMXEAccAddress(program.programId),
      mempoolAccount: getMempoolAccAddress(clusterOffset),
      executingPool: getExecutingPoolAccAddress(clusterOffset),
      compDefAccount: getCompDefAccAddress(
        program.programId,
        Buffer.from(getCompDefAccOffset("compute_disc")).readUInt32LE()
      ),
    })
    .rpc({ skipPreflight: true, commitment: "confirmed" });

  await awaitComputationFinalization(
    provider,
    computationOffset,
    program.programId,
    "confirmed"
  );

  return {
    signature: sig,
    computationOffset,
    computationAccount,
    nonceBytes: new Uint8Array(nonceBytes),
    sharedSecret: new Uint8Array(sharedSecret),
  };
}

export function decryptDiscScores(params: {
  sharedSecret: Uint8Array;
  nonce: BytesLike;
  dCipher: BytesLike;
  iCipher: BytesLike;
  sCipher: BytesLike;
  cCipher: BytesLike;
}): DiscDecryptedResult {
  const cipher = new RescueCipher(params.sharedSecret);

  const [d, i, s, c] = cipher.decrypt(
    [
      toHexBytes(params.dCipher),
      toHexBytes(params.iCipher),
      toHexBytes(params.sCipher),
      toHexBytes(params.cCipher),
    ],
    toU8(params.nonce)
  );

  const dn = Number(d);
  const in_ = Number(i);
  const sn = Number(s);
  const cn = Number(c);

  return {
    d: dn,
    i: in_,
    s: sn,
    c: cn,
    dPct: toPct(dn, 28),
    iPct: toPct(in_, 28),
    sPct: toPct(sn, 28),
    cPct: toPct(cn, 28),
    dominant: dominantFrom(dn, in_, sn, cn),
  };
  }
