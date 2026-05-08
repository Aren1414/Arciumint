import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getMXEAccAddress } from "@arcium-hq/client";

function u32le(buf: Buffer, off: number) {
  return buf.readUInt32LE(off);
}
function u64le(buf: Buffer, off: number) {
  // JS number safe تا 2^53؛ فقط برای مشاهده
  const lo = BigInt(buf.readUInt32LE(off));
  const hi = BigInt(buf.readUInt32LE(off + 4));
  return (hi << 32n) | lo;
}

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const programId = new PublicKey(process.env.PROGRAM_ID!);
  const mxe = getMXEAccAddress(programId);

  const info = await provider.connection.getAccountInfo(mxe, "confirmed");
  if (!info) throw new Error("MXE account not found");
  const data = Buffer.from(info.data);

  console.log("PROGRAM_ID:", programId.toBase58());
  console.log("MXE_ACCOUNT:", mxe.toBase58());
  console.log("OWNER:", info.owner.toBase58());
  console.log("DATA_LEN:", data.length);

  // 1) discriminator
  console.log("DISCRIMINATOR(8):", data.subarray(0, 8).toString("hex"));

  // 2) اسکن برای پیدا کردن 456/456/789 به صورت u32 LE در 0..128
  const targets = new Set([456, 456, 789]);
  console.log("\n-- scan u32le in [0..128) for {456,456,789} --");
  for (let off = 0; off <= 128 - 4; off++) {
    const v = u32le(data, off);
    if (targets.has(v)) {
      console.log("FOUND", v, "at offset", off, "hex:", data.subarray(off, off+4).toString("hex"));
    }
  }

  // 3) چاپ چند u32/u64 ابتدای ساختار برای دیدن layout
  console.log("\n-- head words (u32le) offsets 8..80 step4 --");
  for (let off = 8; off <= 80; off += 4) {
    console.log(off.toString().padStart(3), "u32:", u32le(data, off));
  }

  console.log("\n-- head words (u64le) offsets 8..80 step8 --");
  for (let off = 8; off <= 80; off += 8) {
    console.log(off.toString().padStart(3), "u64:", u64le(data, off).toString());
  }

  // 4) برای مقایسه: چند بایت اول/آخر
  console.log("\nDATA_HEX_PREFIX(96):", data.subarray(0, 96).toString("hex"));
  console.log("DATA_HEX_SUFFIX(96):", data.subarray(Math.max(0, data.length - 96)).toString("hex"));
}

main().catch((e) => {
  console.error("ERROR:", e?.message || e);
  process.exit(1);
});
