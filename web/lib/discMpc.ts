"use client";

import { PublicKey } from "@solana/web3.js";

function mapAnswers(answers: Record<number, string>): number[] {
  const out: number[] = [];
  for (let i = 1; i <= 28; i++) {
    const v = answers[i];
    if (v === "a") out.push(0);
    else if (v === "b") out.push(1);
    else if (v === "c") out.push(2);
    else if (v === "d") out.push(3);
    else throw new Error("Invalid DISC option");
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
  const arcium: any = await import("@arcium-hq/client");

  const PROGRAM_ID = new PublicKey(
    "A4EDNsvT5oGXVXFNvvetgJDzZmYySaWY773C784VXUoM"
  );

  const mapped = mapAnswers(answers);

  if (mapped.length !== 28) {
    throw new Error("DISC requires exactly 28 answers");
  }

  const encryptedAnswers = arcium.encryptU8(mapped);

  const tx = await arcium.queueComputation({
    wallet,
    programId: PROGRAM_ID,
    computation: "compute_disc",
    args: {
      answers: encryptedAnswers,
    },
  });

  return tx;
}
