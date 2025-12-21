"use client";

import * as anchor from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import {
  submitDiscMpc,
  decryptDiscScores,
  DISC_PROGRAM_ID,
} from "./discMpcClient";
import { waitForDiscScoresEvent } from "./discMpcEvents";
import { setDiscResult } from "./discStore";

const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC ??
  "https://api.devnet.solana.com";

let _cachedProgram: anchor.Program | null = null;

async function getDiscProgram(
  wallet: any,
  connection: Connection
): Promise<anchor.Program> {
  if (_cachedProgram) return _cachedProgram;

  const provider = new anchor.AnchorProvider(
    connection,
    wallet,
    { commitment: "confirmed" }
  );

  anchor.setProvider(provider);

  _cachedProgram = await anchor.Program.at(
    DISC_PROGRAM_ID,
    provider
  );

  return _cachedProgram;
}

export async function runDiscMpcFlow(params: {
  wallet: any;
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

  const program = await getDiscProgram(wallet, connection);

  const submission = await submitDiscMpc(
    provider,
    program,
    answers
  );

  const evt = await waitForDiscScoresEvent({
    connection,
    program,
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
