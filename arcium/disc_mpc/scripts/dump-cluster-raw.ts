import * as anchor from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { getClusterAccAddress } from "@arcium-hq/client";

function countNonZero(buf: Buffer) {
  let nz = 0;
  for (const b of buf) if (b !== 0) nz++;
  return nz;
}

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const clusterOffset = Number(process.env.CLUSTER_OFFSET ?? "456");
  const conn: Connection = provider.connection;

  const cluster = getClusterAccAddress(clusterOffset);
  const info = await conn.getAccountInfo(cluster, "confirmed");
  if (!info) throw new Error("Cluster account not found");

  const data = Buffer.from(info.data);
  console.log("CLUSTER_OFFSET:", clusterOffset);
  console.log("CLUSTER_ACCOUNT:", cluster.toBase58());
  console.log("OWNER:", info.owner.toBase58());
  console.log("DATA_LEN:", data.length);
  console.log("NON_ZERO_BYTES:", countNonZero(data));
  console.log("LAMPORTS:", info.lamports);
  console.log("DATA_HEX:", data.toString("hex"));
}

main().catch((e) => {
  console.error("ERROR:", e.message || e);
  process.exit(1);
});
