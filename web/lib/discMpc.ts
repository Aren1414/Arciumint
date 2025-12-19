"use client";

import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(
  "A4EDNsvT5oGXVXFNvvetgJDzZmYySaWY773C784VXUoM"
);

/**
 * DISC:
 * a=0, b=1, c=2, d=3
 */
function mapAnswers(answers: Record<number, string>): Uint8Array {
  const out = new Uint8Array(28);

  for (let i = 1; i <= 28; i++) {
    const v = answers[i];
    if (v === "a") out[i - 1] = 0;
    else if (v === "b") out[i - 1] = 1;
    else if (v === "c") out[i - 1] = 2;
    else if (v === "d") out[i - 1] = 3;
    else throw new Error(`Invalid answer at ${i}`);
  }

  return out;
}

export async function submitDiscMpc({
  wallet,
  answers,
}: {
  wallet: any;
  answers: Record<number, string>;
}) {
  if (!wallet?.publicKey) {
    throw new Error("Wallet not connected");
  }

  const data = mapAnswers(answers);

  const ix = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      {
        pubkey: wallet.publicKey,
        isSigner: true,
        isWritable: false,
      },
    ],
    data,
  });

  const tx = new Transaction().add(ix);
  tx.feePayer = wallet.publicKey;

  const { blockhash } =
    await wallet.connection.getLatestBlockhash();

  tx.recentBlockhash = blockhash;

  const signed = await wallet.signTransaction(tx);
  const sig = await wallet.connection.sendRawTransaction(
    signed.serialize()
  );

  return { signature: sig };
}
