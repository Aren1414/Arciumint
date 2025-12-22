import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  getMXEAccAddress,
  getCompDefAccAddress,
  getCompDefAccOffset,
  getArciumProgramId,
} from "@arcium-hq/client";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.DiscMpc as anchor.Program;

  // ----------- REQUIRED PDAs -----------

  // MXE account (MANDATORY)
  const mxeAccount = getMXEAccAddress(program.programId);

  // Computation definition PDA
  const compDefOffset = getCompDefAccOffset("compute_disc");
  const compDefAccount = getCompDefAccAddress(
    program.programId,
    Buffer.from(compDefOffset).readUInt32LE()
  );

  // ----------- CALL INIT -----------

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
