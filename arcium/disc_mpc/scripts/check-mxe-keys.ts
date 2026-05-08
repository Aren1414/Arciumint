import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getMXEAccAddress } from "@arcium-hq/client";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const programId = new PublicKey(process.env.PROGRAM_ID!);
  console.log("PROGRAM_ID:", programId.toBase58());

  const mxe = getMXEAccAddress(programId);
  console.log("MXE_ACCOUNT:", mxe.toBase58());

  const retries = 30;
  const delayMs = 2000;

  for (let i = 1; i <= retries; i++) {
    const info = await provider.connection.getAccountInfo(mxe, "confirmed");

    if (info) {
      console.log("MXE_ACCOUNT_EXISTS: true");
      console.log("OWNER:", info.owner.toBase58());
      console.log("DATA_LEN:", info.data.length);
      console.log("LAMPORTS:", info.lamports);
      console.log("STATUS: MXE keys are SET and readable");
      return;
    }

    console.log(`Retry ${i}/${retries} - MXE not ready yet`);
    await sleep(delayMs);
  }

  throw new Error(
    "MXE keys NOT set after retries. Cluster has NOT agreed on MXE keys yet."
  );
}

main().catch((e) => {
  console.error("ERROR:", e.message || e);
  process.exit(1);
});
