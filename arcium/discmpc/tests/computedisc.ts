import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import { PublicKey } from "@solana/web3.js";
import { DiscMpc } from "../target/types/disc_mpc";
import { randomBytes } from "crypto";
import {
  awaitComputationFinalization,
  getArciumEnv,
  getCompDefAccOffset,
  getArciumAccountBaseSeed,
  getArciumProgramId,
  getArciumProgram,
  uploadCircuit,
  RescueCipher,
  deserializeLE,
  getMXEPublicKey,
  getMXEAccAddress,
  getMempoolAccAddress,
  getCompDefAccAddress,
  getExecutingPoolAccAddress,
  getComputationAccAddress,
  getClusterAccAddress,
  getLookupTableAddress,
  x25519,
} from "@arcium-hq/client";
import * as fs from "fs";
import * as os from "os";
import { expect } from "chai";

describe("DiscMpc", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.DiscMpc as Program<DiscMpc>;
  const provider = anchor.getProvider();
  const arciumProgram = getArciumProgram(provider as anchor.AnchorProvider);

  const arciumEnv = getArciumEnv();
  const clusterAccount = getClusterAccAddress(arciumEnv.arciumClusterOffset);

  it("compute_disc end-to-end", async () => {
    const owner = readKpJson(`${os.homedir()}/.config/solana/id.json`);

    console.log("Initializing compute_disc computation definition");
    const initSig = await initComputeDiscCompDef(program, owner);
    console.log(
      "compute_disc computation definition initialized with signature",
      initSig,
    );

    const mxePublicKey = await getMXEPublicKeyWithRetry(
      provider as anchor.AnchorProvider,
      program.programId,
    );

    console.log("MXE x25519 pubkey is", mxePublicKey);

    const privateKey = x25519.utils.randomSecretKey();
    const publicKey = x25519.getPublicKey(privateKey);

    const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);
    const cipher = new RescueCipher(sharedSecret);

    
    const answers: number[] = Array.from({ length: 28 }, (_, i) => i % 4);

    
    const expectedD = answers.filter((v) => v === 0).length;
    const expectedI = answers.filter((v) => v === 1).length;
    const expectedS = answers.filter((v) => v === 2).length;
    const expectedC = answers.filter((v) => v === 3).length;

    
    const nonceBytes = randomBytes(16);
    const plaintext = answers.map((v) => BigInt(v));
    const ciphertexts = cipher.encrypt(plaintext, nonceBytes); 

    if (ciphertexts.length !== 28) {
      throw new Error(
        `Expected 28 ciphertexts, got ${ciphertexts.length}`,
      );
    }

    const computationOffset = new anchor.BN(randomBytes(8), "hex");

    const queueSig = await program.methods
      .computeDisc(
        computationOffset,
        Array.from(publicKey),
        new anchor.BN(deserializeLE(nonceBytes).toString()),
        ciphertexts.map((ct) => Array.from(ct) as number[]),
      )
      .accountsPartial({
        computationAccount: getComputationAccAddress(
          arciumEnv.arciumClusterOffset,
          computationOffset,
        ),
        clusterAccount,
        mxeAccount: getMXEAccAddress(program.programId),
        mempoolAccount: getMempoolAccAddress(arciumEnv.arciumClusterOffset),
        executingPool: getExecutingPoolAccAddress(
          arciumEnv.arciumClusterOffset,
        ),
        compDefAccount: getCompDefAccAddress(
          program.programId,
          Buffer.from(getCompDefAccOffset("compute_disc")).readUInt32LE(),
        ),
      })
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("Queue sig is ", queueSig);

    const finalizeSig = await awaitComputationFinalization(
      provider as anchor.AnchorProvider,
      computationOffset,
      program.programId,
      "confirmed",
    );
    console.log("Finalize sig is ", finalizeSig);

    
    
    
    expect(finalizeSig).to.be.a("string");
  });
});

async function initComputeDiscCompDef(
  program: Program<DiscMpc>,
  owner: anchor.web3.Keypair,
): Promise<string> {
  const baseSeedCompDefAcc = getArciumAccountBaseSeed(
    "ComputationDefinitionAccount",
  );
  const offset = getCompDefAccOffset("compute_disc");

  const compDefPDA = PublicKey.findProgramAddressSync(
    [baseSeedCompDefAcc, program.programId.toBuffer(), offset],
    getArciumProgramId(),
  )[0];

  console.log("Comp def pda is ", compDefPDA);

  const mxeAccount = getMXEAccAddress(program.programId);
  const mxeAcc = await arciumProgram.account.mxeAccount.fetch(mxeAccount);
  const lutAddress = getLookupTableAddress(
    program.programId,
    mxeAcc.lutOffsetSlot,
  );

  const sig = await program.methods
    .initComputeDiscCompDef()
    .accounts({
      compDefAccount: compDefPDA,
      payer: owner.publicKey,
      mxeAccount,
      addressLookupTable: lutAddress,
    })
    .signers([owner])
    .rpc({
      commitment: "confirmed",
    });
  console.log("Init compute_disc computation definition transaction", sig);

  const rawCircuit = fs.readFileSync("build/compute_disc.arcis");
  await uploadCircuit(
    provider as anchor.AnchorProvider,
    "compute_disc",
    program.programId,
    rawCircuit,
    true,
    500,
    {
      skipPreflight: true,
      preflightCommitment: "confirmed",
      commitment: "confirmed",
    },
  );

  return sig;
}

async function getMXEPublicKeyWithRetry(
  provider: anchor.AnchorProvider,
  programId: PublicKey,
  maxRetries: number = 20,
  retryDelayMs: number = 500,
): Promise<Uint8Array> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const mxePublicKey = await getMXEPublicKey(provider, programId);
      if (mxePublicKey) {
        return mxePublicKey;
      }
    } catch (error) {
      console.log(`Attempt ${attempt} failed to fetch MXE public key:`, error);
    }

    if (attempt < maxRetries) {
      console.log(
        `Retrying in ${retryDelayMs}ms... (attempt ${attempt}/${maxRetries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  throw new Error(
    `Failed to fetch MXE public key after ${maxRetries} attempts`,
  );
}

function readKpJson(path: string): anchor.web3.Keypair {
  const file = fs.readFileSync(path);
  return anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(file.toString())),
  );
      }
