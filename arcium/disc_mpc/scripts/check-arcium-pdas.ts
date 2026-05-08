import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  getArciumProgramId,
  getMXEAccAddress,
  getMempoolAccAddress,
  getExecutingPoolAccAddress,
  getClusterAccAddress,
  getFeePoolAccAddress,
  getClockAccAddress,
  getComputationAccAddress,
  getCompDefAccOffset,
  getCompDefAccAddress,
} from "@arcium-hq/client";
import * as fs from "fs";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const idl = JSON.parse(fs.readFileSync("target/idl/disc_mpc.json", "utf8"));
  const program = new anchor.Program(idl as anchor.Idl, provider);
  const programId = program.programId;

  const clusterOffsetNum = Number(process.env.CLUSTER_OFFSET ?? "456");
  const computationOffsetNum = Number(process.env.COMPUTATION_OFFSET ?? "456");
  const computationOffset = new anchor.BN(computationOffsetNum);

  const arciumProgram = getArciumProgramId();

  const mxe = getMXEAccAddress(programId);
  const mempool = getMempoolAccAddress(clusterOffsetNum);
  const execPool = getExecutingPoolAccAddress(clusterOffsetNum);
  const cluster = getClusterAccAddress(clusterOffsetNum);
  const feePool = getFeePoolAccAddress();
  const clock = getClockAccAddress();
  const compAcc = getComputationAccAddress(clusterOffsetNum, computationOffset);

  const compDefU32 = Buffer.from(getCompDefAccOffset("compute_disc")).readUInt32LE(0);
  const compDef = getCompDefAccAddress(programId, compDefU32);

  const list = [
    ["PROGRAM_ID", programId],
    ["ARCIUM_PROGRAM", arciumProgram],
    ["MXE", mxe],
    ["MEMPOOL", mempool],
    ["EXEC_POOL", execPool],
    ["CLUSTER", cluster],
    ["FEE_POOL", feePool],
    ["CLOCK", clock],
    ["COMP_DEF", compDef],
    ["COMPUTATION_ACC", compAcc],
  ] as const;

  const conn = provider.connection;

  for (const [name, pk] of list) {
    const info = await conn.getAccountInfo(pk, "confirmed");
    console.log(`${name}: ${pk.toBase58()} | exists=${!!info}${info ? ` | owner=${info.owner.toBase58()} | len=${info.data.length}` : ""}`);
  }
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
