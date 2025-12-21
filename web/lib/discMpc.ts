"use client";

import { Connection, PublicKey } from "@solana/web3.js";
import {
  DISC_PROGRAM_ID,
  submitDiscMpc,
  decryptDiscScores,
} from "./discMpcClient";
import { waitForDiscScoresEvent } from "./discMpcEvents";
import { setDiscResult } from "./discStore";

const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC ??
  "https://api.devnet.solana.com";

/**
 * Full flow:
 * 1) submit encrypted DISC answers (MPC)
 * 2) wait DiscScoresEvent
 * 3) decrypt locally
 * 4) store for UI
 */
export async function runDiscMpcFlow(params: {
  wallet: any;
  answers: Record<number, string>;
}) {
  const { wallet, answers } = params;

  if (!wallet?.publicKey || !wallet?.signTransaction) {
    throw new Error("Wallet not connected");
  }

  const connection = new Connection(RPC_URL, "confirmed");

  // 1) submit MPC computation
  const submission = await submitDiscMpc({
    wallet,
    connection,
    programId: DISC_PROGRAM_ID,
    answers,
  });

  // 2) wait for DiscScoresEvent
  const evt = await waitForDiscScoresEvent({
    connection,
    programId: DISC_PROGRAM_ID,
    computationAccount: submission.computationAccount,
    timeoutMs: 120_000,
  });

  // 3) decrypt locally (only user can decrypt)
  const decrypted = decryptDiscScores({
    sharedSecret: submission.sharedSecret,
    nonce: evt.nonce,
    dCipher: evt.d_score_cipher,
    iCipher: evt.i_score_cipher,
    sCipher: evt.s_score_cipher,
    cCipher: evt.c_score_cipher,
  });

  // 4) store result for result page
  setDiscResult({
    ...decrypted,
    raw: { submission, evt },
  });

  return {
    signature: submission.signature,
    computationAccount: submission.computationAccount.toBase58(),
    result: decrypted,
  };
}
