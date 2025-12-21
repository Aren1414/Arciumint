"use client";

import { Connection } from "@solana/web3.js";
import {
  submitDiscMpc,
  decryptDiscScores,
} from "./discMpcClient";
import { waitForDiscScoresEvent } from "./discMpcEvents";
import { setDiscResult } from "./discStore";
import { DISC_PROGRAM_ID } from "./discMpcClient";

const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC ??
  "https://api.devnet.solana.com";

export async function runDiscMpcFlow(params: {
  wallet: any;
  answers: Record<number, string>;
}) {
  const { wallet, answers } = params;

  if (!wallet?.publicKey || !wallet?.signTransaction) {
    throw new Error("Wallet not connected");
  }

  const connection = new Connection(RPC_URL, "confirmed");

  
  const submission = await submitDiscMpc(
    wallet,
    answers,
    connection
  );

  const evt = await waitForDiscScoresEvent({
    connection,
    programId: DISC_PROGRAM_ID,
    computationAccount: submission.computationAccount,
    timeoutMs: 120_000,
  });

  const decrypted = decryptDiscScores({
    sharedSecret: submission.sharedSecret,
    nonce: evt.nonce,
    dCipher: evt.d_score_cipher,
    iCipher: evt.i_score_cipher,
    sCipher: evt.s_score_cipher,
    cCipher: evt.c_score_cipher,
  });

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
