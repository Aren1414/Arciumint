import * as anchor from "@coral-xyz/anchor";
import { getClusterAccAddress } from "@arcium-hq/client";
import { Connection } from "@solana/web3.js";

function countNonZero(buf: Buffer) {
  let n = 0;
  for (const b of buf) if (b !== 0) n++;
  return n;
}

async function inspect(offset: number) {
  const provider = anchor.AnchorProvider.env();
  const conn: Connection = provider.connection;

  const cluster = getClusterAccAddress(offset);
  const info = await conn.getAccountInfo(cluster, "confirmed");

  if (!info) {
    return {
      offset,
      exists: false,
      usable: false,
      reason: "cluster account does not exist",
    };
  }

  const nonZero = countNonZero(info.data);

  return {
    offset,
    exists: true,
    lamports: info.lamports,
    dataLen: info.data.length,
    nonZero,
    usable: nonZero >= 200, // threshold safely above empty layout
  };
}

(async () => {
  const OFFSETS = [456, 456, 789];
  const results = [];

  console.log("\n=== ARCIUM CLUSTER FINAL VERDICT ===\n");

  for (const o of OFFSETS) {
    const r = await inspect(o);
    results.push(r);

    console.log(`--- Cluster ${o} ---`);
    if (!r.exists) {
      console.log("❌ exists: false");
      continue;
    }
    console.log("exists: true");
    console.log("lamports:", r.lamports);
    console.log("data_len:", r.dataLen);
    console.log("non_zero_bytes:", r.nonZero);
    console.log("usable:", r.usable ? "YES" : "NO");
  }

  const usable = results.filter(r => r.usable);

  console.log("\n=== FINAL RESULT ===");

  if (usable.length === 0) {
    console.log("❌ NO USABLE CLUSTER FOUND");
    console.log("→ Any QueueComputation WILL fail with MxeKeysNotSet");
    process.exit(2);
  } else {
    console.log("✅ USABLE CLUSTERS:");
    for (const u of usable) {
      console.log(`→ cluster_offset = ${u.offset}`);
    }
    console.log("\n👉 Use ONE of the above offsets. Others are guaranteed to fail.");
    process.exit(0);
  }
})();
