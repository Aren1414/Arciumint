import * as anchor from "@coral-xyz/anchor";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.DiscMpc as anchor.Program;

  const tx = await program.methods
    .initComputeDiscCompDef()
    .rpc({ commitment: "confirmed" });

  
  console.log(tx);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
