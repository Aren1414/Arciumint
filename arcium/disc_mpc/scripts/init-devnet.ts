
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";

import {
  getCompDefAccOffset,
    getCompDefAccAddress,
      getMXEAccAddress,
      } from "@arcium-hq/client";

      import { DiscMpc } from "../target/types/disc_mpc";

      function readKeypair(path: string): Keypair {
        const raw = fs.readFileSync(path, "utf8");
          return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
          }

          function pickRpcUrl(): string {
            // اولویت با Anchor/Arcium setup شما
              const rpc =
                  process.env.ANCHOR_PROVIDER_URL ||
                      process.env.RPC_URL ||
                          process.env.ANCHOR_RPC_URL || // اگر جایی ست کرده باشید
                              "https://api.devnet.solana.com";

                                return rpc;
                                }

                                async function main() {
                                  const walletPath = `${os.homedir()}/.config/solana/id.json`;
                                    const owner = readKeypair(walletPath);

                                      const rpcUrl = pickRpcUrl();
                                        const connection = new anchor.web3.Connection(rpcUrl, "confirmed");
                                          const wallet = new anchor.Wallet(owner);

                                            const provider = new anchor.AnchorProvider(connection, wallet, {
                                                commitment: "confirmed",
                                                  });
                                                    anchor.setProvider(provider);

                                                      // Program از IDL (مطابق چیزی که خودت نوشتی)
                                                        const idlPath = "target/idl/disc_mpc.json";
                                                          const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));
                                                            const program = new Program(idl, provider) as Program<DiscMpc>;

                                                              // MXE PDA از programId
                                                                const programId: PublicKey = program.programId;
                                                                  const mxeAccount = getMXEAccAddress(programId);

                                                                    // CompDef PDA (طبق helper رسمی)
                                                                      const offsetBytes = getCompDefAccOffset("compute_disc");
                                                                        const compDefU32 = Buffer.from(offsetBytes).readUInt32LE(0);

                                                                          const compDefAccount = getCompDefAccAddress(programId, compDefU32);

                                                                            console.log("RPC:", rpcUrl);
                                                                              console.log("ProgramID:", programId.toBase58());
                                                                                console.log("MXE PDA:", mxeAccount.toBase58());
                                                                                  console.log("CompDef name:", "compute_disc");
                                                                                    console.log("CompDef offset(u32):", compDefU32);
                                                                                      console.log("CompDef PDA:", compDefAccount.toBase58());

                                                                                        // ✅ Guard: اگر CompDef قبلاً ساخته شده باشد، دوباره init نکن
                                                                                          const compDefInfo = await connection.getAccountInfo(compDefAccount, "confirmed");
                                                                                            if (compDefInfo) {
                                                                                                console.log("OK: ComputationDefinition already initialized. Nothing to do.");
                                                                                                    return;
                                                                                                      }

                                                                                                        // اگر CompDef هنوز وجود ندارد، init کن
                                                                                                          console.log("CompDef not found on-chain. Initializing...");

                                                                                                            const sig = await program.methods
                                                                                                                .initComputeDiscCompDef()
                                                                                                                    .accounts({
                                                                                                                          payer: owner.publicKey,
                                                                                                                                mxeAccount,
                                                                                                                                      compDefAccount,
                                                                                                                                          })
                                                                                                                                              .signers([owner])
                                                                                                                                                  .rpc({ commitment: "confirmed" });

                                                                                                                                                    console.log("init_compute_disc_comp_def tx:", sig);

                                                                                                                                                      // پس از init، دوباره چک کن
                                                                                                                                                        const compDefInfoAfter = await connection.getAccountInfo(compDefAccount, "confirmed");
                                                                                                                                                          if (!compDefInfoAfter) {
                                                                                                                                                              throw new Error("Init was sent but CompDef account still not found. Check explorer/logs.");
                                                                                                                                                                }

                                                                                                                                                                  console.log("SUCCESS: ComputationDefinition initialized on-chain.");
                                                                                                                                                                  }

                                                                                                                                                                  main().catch((e) => {
                                                                                                                                                                    console.error("ERROR:", e);
                                                                                                                                                                      process.exit(1);
                                                                                                                                                                      });