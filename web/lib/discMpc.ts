"use client";

import * as anchor from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import {
  DISC_PROGRAM_ID,
  submitDiscMpc,
  decryptDiscScores,
} from "./discMpcClient";
import { waitForDiscScoresEvent } from "./discMpcEvents";
import { setDiscResult } from "./discStore";
import idl from "./idl/disc_mpc.json";

const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC ??
  "https://api.devnet.solana.com";

export async function runDiscMpcFlow(params: {
  wallet: any;
  answers: Record<number, string>;
}) {
  const { wallet } = params;

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

  const program = new anchor.Program(
    idl as anchor.Idl,
    DISC_PROGRAM_ID,
    provider
  );

  const submission = await submitDiscMpc(
    wallet,
    program,
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
