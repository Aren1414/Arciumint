"use client";

import { PublicKey } from "@solana/web3.js";

/**
 * DISC answers mapping:
 * a -> 0 (D)
 * b -> 1 (I)
 * c -> 2 (S)
 * d -> 3 (C)
 */
function mapAnswers(
  answers: Record<number, string>
): number[] {
  return Object.keys(answers)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => {
      const v = answers[Number(k)];
      if (v === "a") return 0;
      if (v === "b") return 1;
      if (v === "c") return 2;
      if (v === "d") return 3;
      throw new Error("Invalid DISC option");
    });
}

export async function submitDiscMpc({
  wallet,
  answers,
}: {
  wallet: any;
  answers: Record<number, string>;
}) {
  // ⬇️ dynamic import (CRITICAL)
  const {
    ArciumClient,
    encryptU8,
  } = await import("@arcium-hq/client");

  const PROGRAM_ID = new PublicKey(
    "A4EDNsvT5oGXVXFNvvetgJDzZmYySaWY773C784VXUoM"
  );

  const client = new ArciumClient({
    wallet,
    programId: PROGRAM_ID,
  });

  // map answers -> [u8;28]
  const mapped = mapAnswers(answers);

  if (mapped.length !== 28) {
    throw new Error("DISC requires exactly 28 answers");
  }

  // encrypt answers (u8[])
  const encryptedAnswers = await Promise.all(
    mapped.map((v) => encryptU8(v))
  );

  // queue MPC computation
  const tx = await client.queueComputation({
    instruction: "compute_disc",
    inputs: {
      answers: encryptedAnswers,
    },
  });

  return tx;
}
