import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getMXEAccAddress } from "@arcium-hq/client";

function countNonZero(buf: Buffer) {
  let nz = 0;
  for (const b of buf) if (b !== 0) nz++;
  return nz;
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
  console.log("NON_ZERO_BYTES:", countNonZero(data));
  console.log("DATA_HEX:", data.toString("hex"));
}

main().catch((e) => {
  console.error("ERROR:", e.message || e);
  process.exit(1);
});
