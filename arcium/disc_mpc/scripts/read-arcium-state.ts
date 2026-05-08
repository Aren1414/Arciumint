import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  getArciumProgramId,
  getMXEAccAddress,
  getClusterAccAddress,
  getMempoolAccAddress,
  getExecutingPoolAccAddress,
  getCompDefAccOffset,
  getCompDefAccAddress,
  getMempoolAccInfo,
  getExecutingPoolAccInfo,
} from "@arcium-hq/client";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const programId = new PublicKey(process.env.PROGRAM_ID!);
  const clusterOffset = Number(process.env.CLUSTER_OFFSET ?? "456");
  if (!Number.isFinite(clusterOffset)) throw new Error("CLUSTER_OFFSET invalid");

  const conn = provider.connection;

  const mxe = getMXEAccAddress(programId);
  const cluster = getClusterAccAddress(clusterOffset);
  const mempool = getMempoolAccAddress(clusterOffset);
  const execPool = getExecutingPoolAccAddress(clusterOffset);

  const compDefU32 = Buffer.from(
    getCompDefAccOffset("compute_disc")
  ).readUInt32LE(0);
  const compDef = getCompDefAccAddress(programId, compDefU32);

  console.log("PROGRAM_ID:", programId.toBase58());
  console.log("ARCIUM_PROGRAM:", getArciumProgramId().toBase58());
  console.log("CLUSTER_OFFSET:", clusterOffset);
  console.log("MXE:", mxe.toBase58());
  console.log("CLUSTER:", cluster.toBase58());
  console.log("MEMPOOL:", mempool.toBase58());
  console.log("EXEC_POOL:", execPool.toBase58());
  console.log("COMP_DEF:", compDef.toBase58());
  console.log("---- RAW ACCOUNT INFOS ----");

  const mxeInfo = await conn.getAccountInfo(mxe);
  const clusterInfo = await conn.getAccountInfo(cluster);
  const mempoolInfo = await conn.getAccountInfo(mempool);
  const execPoolInfo = await conn.getAccountInfo(execPool);

  console.log("MXE exists:", !!mxeInfo, "len:", mxeInfo?.data.length);
  console.log("CLUSTER exists:", !!clusterInfo, "len:", clusterInfo?.data.length);
  console.log("MEMPOOL exists:", !!mempoolInfo, "len:", mempoolInfo?.data.length);
  console.log("EXEC_POOL exists:", !!execPoolInfo, "len:", execPoolInfo?.data.length);

  console.log("---- PARSED INFOS (SUPPORTED ONLY) ----");
  console.log(
    "MEMPOOL_INFO:",
    await getMempoolAccInfo(provider, mempool)
  );
  console.log(
    "EXEC_POOL_INFO:",
    await getExecutingPoolAccInfo(provider, execPool)
  );
}

main().catch((e) => {
  console.error("ERROR:", e?.message ?? e);
  process.exit(1);
});
