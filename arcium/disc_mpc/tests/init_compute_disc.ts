import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { DiscMpc } from "../target/types/disc_mpc";

describe("init compute_disc comp def", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.DiscMpc as Program<DiscMpc>;

  it("init compute_disc computation definition", async () => {
    try {
      await program.methods
        .initComputeDiscCompDef()
        .accounts({
          payer: provider.wallet.publicKey,
        })
        .rpc();

      console.log("✅ computation definition initialized");
    } catch (e: any) {
      if (e.toString().includes("already in use")) {
        console.log("ℹ️ already initialized (this is OK)");
      } else {
        throw e;
      }
    }
  });
});
