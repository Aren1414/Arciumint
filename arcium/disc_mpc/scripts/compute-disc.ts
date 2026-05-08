import * as anchor from "@coral-xyz/anchor";
import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  SendTransactionError,
} from "@solana/web3.js";
import * as fs from "fs";

import { DiscMpc } from "../target/types/disc_mpc";

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

async function loadAlt(connection: Connection, altAddress: PublicKey) {
  const res = await connection.getAddressLookupTable(altAddress, { commitment: "confirmed" });
  const alt = res.value;
  if (!alt) throw new Error(`ALT not found on-chain: ${altAddress.toBase58()}`);
  return alt as AddressLookupTableAccount;
}

async function assertAccount(connection: Connection, name: string, pk: PublicKey) {
  const info = await connection.getAccountInfo(pk, "confirmed");
  console.log(`${name}: ${pk.toBase58()} exists=${!!info} ${info ? `len=${info.data.length} owner=${info.owner.toBase58()}` : ""}`);
  if (!info) throw new Error(`${name} missing: ${pk.toBase58()}`);
  return info;
}

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const idl = JSON.parse(fs.readFileSync("target/idl/disc_mpc.json", "utf8"));
  const program = new anchor.Program(idl as anchor.Idl, provider) as anchor.Program<DiscMpc>;
  const programId = program.programId;

  const expectedProgramId = new PublicKey(process.env.PROGRAM_ID!);
  if (!programId.equals(expectedProgramId)) {
    throw new Error(`PROGRAM_ID mismatch. IDL=${programId.toBase58()} ENV=${expectedProgramId.toBase58()}`);
  }

  const clusterOffsetNum = Number(process.env.CLUSTER_OFFSET!);
  const computationOffsetNum = Number(process.env.COMPUTATION_OFFSET!);
  if (!Number.isFinite(clusterOffsetNum)) throw new Error("CLUSTER_OFFSET invalid");
  if (!Number.isFinite(computationOffsetNum)) throw new Error("COMPUTATION_OFFSET invalid");

  const altStr = process.env.ALT_ADDRESS!;
  if (!altStr) throw new Error("ALT_ADDRESS is missing in .env.local");
  const altAddress = new PublicKey(altStr);

  const connection = provider.connection;

  // ---- Arcium addresses ----
  const arciumProgram = getArciumProgramId();
  const mxeAccount = getMXEAccAddress(programId);

  const compDefU32 = Buffer.from(getCompDefAccOffset("compute_disc")).readUInt32LE(0);
  const compDefAccount = getCompDefAccAddress(programId, compDefU32);

  const mempoolAccount = getMempoolAccAddress(clusterOffsetNum);
  const executingPool = getExecutingPoolAccAddress(clusterOffsetNum);
  const clusterAccount = getClusterAccAddress(clusterOffsetNum);

  const poolAccount = getFeePoolAccAddress();
  const clockAccount = getClockAccAddress();

  const computationAccount = getComputationAccAddress(
    clusterOffsetNum,
    new anchor.BN(computationOffsetNum)
  );

  const [signPdaAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("SignerAccount")],
    programId
  );

  console.log("PROGRAM_ID:", programId.toBase58());
  console.log("ARCIUM_PROGRAM:", arciumProgram.toBase58());
  console.log("CLUSTER_OFFSET:", clusterOffsetNum);
  console.log("COMPUTATION_OFFSET:", computationOffsetNum);

  // ---- Precheck (hard fail if something is missing) ----
  await assertAccount(connection, "MXE", mxeAccount);
  await assertAccount(connection, "CLUSTER", clusterAccount);
  await assertAccount(connection, "MEMPOOL", mempoolAccount);
  await assertAccount(connection, "EXEC_POOL", executingPool);
  await assertAccount(connection, "COMP_DEF", compDefAccount);
  // computationAccount ممکنه قبل از queue وجود نداشته باشه؛ صرفاً لاگ می‌کنیم
  const compInfo = await connection.getAccountInfo(computationAccount, "confirmed");
  console.log(`COMPUTATION_ACC: ${computationAccount.toBase58()} exists=${!!compInfo}`);

  // ---- inputs ----
  const computationOffset = new anchor.BN(computationOffsetNum);
  const pubkey = Array(32).fill(1);
  const nonce = new anchor.BN(1);
  const ciphertexts = Array(28).fill(Array(32).fill(2));

  const accounts: any = {
    payer: provider.wallet.publicKey,

    signPdaAccount,
    sign_pda_account: signPdaAccount,

    mxeAccount,
    mxe_account: mxeAccount,

    mempoolAccount,
    mempool_account: mempoolAccount,

    executingPool,
    executing_pool: executingPool,

    computationAccount,
    computation_account: computationAccount,

    compDefAccount,
    comp_def_account: compDefAccount,

    clusterAccount,
    cluster_account: clusterAccount,

    poolAccount,
    pool_account: poolAccount,

    clockAccount,
    clock_account: clockAccount,

    systemProgram: anchor.web3.SystemProgram.programId,
    system_program: anchor.web3.SystemProgram.programId,

    arciumProgram,
    arcium_program: arciumProgram,
  };

  // 1) instruction
  const ix = await program.methods
    .computeDisc(computationOffset, pubkey as any, nonce, ciphertexts as any)
    .accounts(accounts)
    .instruction();

  // 2) ALT load
  const alt = await loadAlt(connection, altAddress);

  // 3) v0 tx with ALT
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  const msg = new TransactionMessage({
    payerKey: provider.wallet.publicKey,
    recentBlockhash: blockhash,
    instructions: [ix],
  }).compileToV0Message([alt]);

  const tx = new VersionedTransaction(msg);

  try {
    const signed = await provider.wallet.signTransaction(tx as any);
    const sig = await connection.sendRawTransaction((signed as any).serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });
    await connection.confirmTransaction(sig, "confirmed");
    console.log("TX:", sig);
  } catch (e: any) {
    // show logs if available
    if (e instanceof SendTransactionError) {
      console.error("SendTransactionError:", e.message);
      const logs = e.logs;
      if (logs?.length) console.error("Logs:\n" + logs.join("\n"));
    } else {
      console.error("ERROR:", e?.message || e);
      if (e?.logs) console.error("Logs:\n" + e.logs.join("\n"));
    }

    // deterministic guidance for the exact failure you hit
    const msg = String(e?.message || "");
    if (msg.includes("MxeKeysNotSet") || msg.includes("6002") || msg.includes("0x1772")) {
      console.error("\nNEXT STEP (not guess):");
      console.error("- MXE keys are not agreed by the cluster nodes yet.");
      console.error("- If this persists (you already tried many retries), switch to another official devnet cluster offset (456/789) by re-initializing MXE via arcium deploy, or run your own cluster.");
    }
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("FATAL:", e?.message || e);
  process.exit(1);
});
