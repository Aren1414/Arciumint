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
  if (!Number.isFinite(clusterOffset)) throw new Error("CLUSTER_OFFSET invalid");

  const conn: Connection = provider.connection;

  const clusterPk = getClusterAccAddress(clusterOffset);
  const info = await conn.getAccountInfo(clusterPk, "confirmed");

  console.log("CLUSTER_OFFSET:", clusterOffset);
  console.log("CLUSTER_ACCOUNT:", clusterPk.toBase58());
  console.log("exists:", !!info);

  if (!info) process.exit(2);

  const data = Buffer.from(info.data);
  console.log("owner:", info.owner.toBase58());
  console.log("data_len:", data.length);
  console.log("lamports:", info.lamports);
  console.log("non_zero_bytes:", countNonZero(data));
  console.log("data_hex_prefix:", data.slice(0, 128).toString("hex")); // فقط prefix برای مقایسه

  // نکته: ما اینجا decode دقیق IDL نمی‌کنیم چون IDL Arcium داخل این npm پکیج نیست.
  // هدف: تایید اینکه cluster state واقعاً هست و قابل خواندن است (که هست) و برای بررسی تغییرات.
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
