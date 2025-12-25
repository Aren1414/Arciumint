import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  getMXEAccAddress,
  getCompDefAccAddress,
  getCompDefAccOffset,
  getArciumProgramId,
} from "@arcium-hq/client";

const DISC_MPC_PROGRAM_ID = new PublicKey(
  "PPyR7WKqttjq4ZwcVwrerPsHkUnEkcZ6Vq7zQ1CbSvM"
);

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  
  const mxeAccount = getMXEAccAddress(DISC_MPC_PROGRAM_ID);

  const compDefOffset = getCompDefAccOffset("compute_disc");
  const compDefAccount = getCompDefAccAddress(
    DISC_MPC_PROGRAM_ID,
    Buffer.from(compDefOffset).readUInt32LE()
  );

  console.log("PROGRAM ID:", DISC_MPC_PROGRAM_ID.toBase58());
  console.log("MXE:", mxeAccount.toBase58());
  console.log("COMP DEF:", compDefAccount.toBase58());

  
  const idl = await anchor.Program.fetchIdl(
    DISC_MPC_PROGRAM_ID,
    provider
  );
  if (!idl) {
    throw new Error("IDL not found on-chain for DiscMpc");
  }

  const program = new anchor.Program(
    idl as anchor.Idl,
    DISC_MPC_PROGRAM_ID,
    provider
  );

  const tx = await program.methods
    .initComputeDiscCompDef()
    .accounts({
      payer: provider.wallet.publicKey,
      mxeAccount,
      compDefAccount,
      arciumProgram: getArciumProgramId(),
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc({ commitment: "confirmed" });

  console.log("init_compute_disc_comp_def tx:", tx);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
