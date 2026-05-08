import * as anchor from "@coral-xyz/anchor";
import { AddressLookupTableProgram, PublicKey } from "@solana/web3.js";
import * as fs from "fs";

import {
  getArciumProgramId,
  getMXEAccAddress,
  getCompDefAccOffset,
  getCompDefAccAddress,
  getMempoolAccAddress,
  getExecutingPoolAccAddress,
  getClusterAccAddress,
  getFeePoolAccAddress,
  getClockAccAddress,
  getComputationAccAddress,
} from "@arcium-hq/client";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const idl = JSON.parse(fs.readFileSync("target/idl/disc_mpc.json", "utf8"));
  const program = new anchor.Program(idl as anchor.Idl, provider);
  const programId = program.programId;

  const expectedProgramId = new PublicKey(process.env.PROGRAM_ID!);
  if (!programId.equals(expectedProgramId)) {
    throw new Error(
      `PROGRAM_ID mismatch. IDL=${programId.toBase58()} ENV=${expectedProgramId.toBase58()}`
    );
  }

  const clusterOffsetNum = Number(process.env.CLUSTER_OFFSET!);
  const computationOffsetNum = Number(process.env.COMPUTATION_OFFSET!);
  if (!Number.isFinite(clusterOffsetNum)) throw new Error("CLUSTER_OFFSET invalid");
  if (!Number.isFinite(computationOffsetNum)) throw new Error("COMPUTATION_OFFSET invalid");

  const arciumProgram = getArciumProgramId();
  const mxeAccount = getMXEAccAddress(programId);

  const compDefU32 = Buffer.from(getCompDefAccOffset("compute_disc")).readUInt32LE(0);
  const compDefAccount = getCompDefAccAddress(programId, compDefU32);

  // این‌ها طبق grep/d.ts تو: number می‌گیرند
  const mempoolAccount = getMempoolAccAddress(clusterOffsetNum);
  const executingPool = getExecutingPoolAccAddress(clusterOffsetNum);
  const clusterAccount = getClusterAccAddress(clusterOffsetNum);
  const poolAccount = getFeePoolAccAddress();
  const clockAccount = getClockAccAddress();

  // نکته مهم: ترتیب پارامترها در نسخه تو این است:
  // getComputationAccAddress(clusterOffset: number, computationOffset: BN)
  const computationAccount = getComputationAccAddress(
    clusterOffsetNum,
    new anchor.BN(computationOffsetNum)
  );

  const [signPdaAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("SignerAccount")],
    programId
  );

  const payer = provider.wallet.publicKey;
  const connection = provider.connection;

  const recentSlot = await connection.getSlot("confirmed");
  const [createIx, lookupTableAddress] = AddressLookupTableProgram.createLookupTable({
    authority: payer,
    payer,
    recentSlot,
  });

  const addresses = [
    payer,
    signPdaAccount,
    mxeAccount,
    mempoolAccount,
    executingPool,
    computationAccount,
    compDefAccount,
    clusterAccount,
    poolAccount,
    clockAccount,
    anchor.web3.SystemProgram.programId,
    arciumProgram,
    programId,
  ];

  const extendIx = AddressLookupTableProgram.extendLookupTable({
    payer,
    authority: payer,
    lookupTable: lookupTableAddress,
    addresses,
  });

  const tx = new anchor.web3.Transaction().add(createIx, extendIx);
  tx.feePayer = payer;
  tx.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;

  const sig = await provider.sendAndConfirm(tx, [], { commitment: "confirmed" });

  console.log("ALT_ADDRESS:", lookupTableAddress.toBase58());
  console.log("ALT_TX:", sig);
  console.log("\nAdd this to .env.local:");
  console.log(`ALT_ADDRESS="${lookupTableAddress.toBase58()}"`);
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
