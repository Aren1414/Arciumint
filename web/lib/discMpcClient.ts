"use client";

import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { randomBytes } from "crypto";
import {
  RescueCipher,
  deserializeLE,
  getArciumEnv,
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

// IMPORTANT: must match your deployed program id
export const DISC_PROGRAM_ID = new PublicKey(
  "PPyR7WKqttjq4ZwcVwrerPsHkUnEkcZ6Vq7zQ1CbSvM"
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

  // needed for decrypt on client
  nonceBytes: Uint8Array; // 16 bytes
  sharedSecret: Uint8Array; // from x25519 shared secret
};

function mapAnswers(answers: Record<number, string>): bigint[] {
  // a=0 b=1 c=2 d=3 (طبق UI شما)
  const out: bigint[] = [];
  for (let i = 1; i <= 28; i++) {
    const v = answers[i];
    if (v === "a") out.push(0n);
    else if (v === "b") out.push(1n);
    else if (v === "c") out.push(2n);
    else if (v === "d") out.push(3n);
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

/**
 * Ensure computation definition exists & is finalized.
 * This is "init_compute_disc_comp_def" for your program.
 */
async function ensureCompDefReady(
  provider: anchor.AnchorProvider,
  program: anchor.Program
) {
  const baseSeed = getArciumAccountBaseSeed("ComputationDefinitionAccount");
  const offset = getCompDefAccOffset("compute_disc");
  const compDefPda = PublicKey.findProgramAddressSync(
    [baseSeed, program.programId.toBuffer(), offset],
    getArciumProgramId()
  )[0];

  const info = await provider.connection.getAccountInfo(compDefPda, "confirmed");
  if (!info) {
    // init comp-def via your program
    await program.methods
      .initComputeDiscCompDef()
      .accounts({
        compDefAccount: compDefPda,
        payer: provider.wallet.publicKey,
        mxeAccount: getMXEAccAddress(program.programId),
      })
      .rpc({ commitment: "confirmed" });
  }

  // Try finalize (if already finalized this is usually harmless or fails with "already finalized")
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

    // @ts-ignore (anchor wallet adapter)
    await provider.wallet.signTransaction(finalizeTx);
    await provider.sendAndConfirm(finalizeTx, [], { commitment: "confirmed" });
  } catch {
    // If finalize is not needed or already done, ignore.
  }

  return compDefPda;
}

/**
 * Submit MPC computation (privacy-preserving) and return required decrypt material.
 */
export async function submitDiscMpc(
  provider: anchor.AnchorProvider,
  program: anchor.Program,
  answers: Record<number, string>
): Promise<DiscSubmission> {
  const plaintext = mapAnswers(answers); // 28 bigints 0..3
  const arciumEnv = getArciumEnv();

  // Ensure comp-def exists
  await ensureCompDefReady(provider, program);

  // Fetch MXE public key for x25519
  const mxePub = await getMXEPublicKey(provider, program.programId);

  // Ephemeral keypair for this computation
  const priv = x25519.utils.randomSecretKey();
  const pub = x25519.getPublicKey(priv);

  const sharedSecret = x25519.getSharedSecret(priv, mxePub);
  const cipher = new RescueCipher(sharedSecret);

  const nonceBytes = randomBytes(16);
  const ciphertexts = cipher.encrypt(plaintext, nonceBytes);

  if (!Array.isArray(ciphertexts) || ciphertexts.length !== 28) {
    throw new Error(`Unexpected ciphertext length: ${ciphertexts?.length}`);
  }

  const computationOffset = new anchor.BN(randomBytes(8), "hex");
  const clusterOffset = arciumEnv.arciumClusterOffset;

  const computationAccount = getComputationAccAddress(clusterOffset, computationOffset);

  const sig = await program.methods
    .computeDisc(
      computationOffset,
      ...ciphertexts.map((c: Uint8Array) => Array.from(c)),
      Array.from(pub),
      new anchor.BN(deserializeLE(nonceBytes).toString())
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

  // Optional: wait for finalization (means MPC done)
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

/**
 * Decrypt the 4 score ciphertexts from event with the sharedSecret + nonce.
 */
export function decryptDiscScores(params: {
  sharedSecret: Uint8Array;
  nonce: Uint8Array; // 16 bytes
  dCipher: Uint8Array;
  iCipher: Uint8Array;
  sCipher: Uint8Array;
  cCipher: Uint8Array;
}): DiscDecryptedResult {
  const cipher = new RescueCipher(params.sharedSecret);

  const [d, i, s, c] = cipher.decrypt(
    [params.dCipher, params.iCipher, params.sCipher, params.cCipher],
    params.nonce
  );

  const dn = Number(d);
  const in_ = Number(i);
  const sn = Number(s);
  const cn = Number(c);

  const total = 28;

  return {
    d: dn,
    i: in_,
    s: sn,
    c: cn,
    dPct: toPct(dn, total),
    iPct: toPct(in_, total),
    sPct: toPct(sn, total),
    cPct: toPct(cn, total),
    dominant: dominantFrom(dn, in_, sn, cn),
  };
  }
