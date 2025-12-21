"use client";

import * as anchor from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { DISC_PROGRAM_ID, submitDiscMpc, decryptDiscScores } from "./discMpcClient";
import { waitForDiscScoresEvent } from "./discMpcEvents";
import { setDiscResult } from "./discStore";

// IMPORTANT: set env in NEXT_PUBLIC_SOLANA_RPC
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.devnet.solana.com";

/**
 * Full flow:
 * 1) queue MPC compute_disc with encrypted answers
 * 2) wait event DiscScoresEvent
 * 3) decrypt locally
 * 4) store result for UI
 */
export async function runDiscMpcFlow(params: {
  wallet: any; // Phantom provider
  answers: Record<number, string>;
}) {
  const { wallet, answers } = params;

  if (!wallet?.publicKey || !wallet?.signTransaction) {
    throw new Error("Wallet not connected");
  }

  const connection = new Connection(RPC_URL, "confirmed");

  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { commitment: "confirmed" }
  );
  anchor.setProvider(provider);

  // Load IDL dynamically from Anchor generated artifact OR from your app bundle.
  // Practical approach: import the IDL json from /target/idl if you ship it to web.
  // You must create: web/lib/idl/disc_mpc.json (copy from arcium/disc_mpc/target/idl/disc_mpc.json after build)
  const idl = (await import("./idl/disc_mpc.json")).default as anchor.Idl;

  const program = new anchor.Program(idl, DISC_PROGRAM_ID, provider);

  // 1) submit computation
  const submission = await submitDiscMpc(provider, program, answers);

  // 2) wait scores event
  const evt = await waitForDiscScoresEvent({
    connection,
    program,
    computationAccount: submission.computationAccount,
    timeoutMs: 120_000,
  });

  // 3) decrypt locally
  const decrypted = decryptDiscScores({
    sharedSecret: submission.sharedSecret,
    nonce: evt.nonce,
    dCipher: evt.d_score_cipher,
    iCipher: evt.i_score_cipher,
    sCipher: evt.s_score_cipher,
    cCipher: evt.c_score_cipher,
  });

  // 4) store
  setDiscResult({ ...decrypted, raw: { submission, evt } });

  return {
    signature: submission.signature,
    computationAccount: submission.computationAccount.toBase58(),
    result: decrypted,
  };
}
