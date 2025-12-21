"use client";

import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  Connection,
} from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(
  "PPyR7WKqttjq4ZwcVwrerPsHkUnEkcZ6Vq7zQ1CbSvM"
);


const RPC_URL = "https://api.devnet.solana.com";

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
  if (!wallet?.publicKey || !wallet?.signTransaction) {
    throw new Error("Wallet not connected");
  }

  const connection = new Connection(RPC_URL, "confirmed");

  const data = Buffer.from(mapAnswers(answers));

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

  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;

  const signedTx = await wallet.signTransaction(tx);
  const signature = await connection.sendRawTransaction(
    signedTx.serialize(),
    { skipPreflight: false }
  );

  return { signature };
}
