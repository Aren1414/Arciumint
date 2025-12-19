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

function pickOutput(raw: any) {
  const candidates = [
    raw?.output,
    raw?.outputs,
    raw?.result,
    raw?.data,
    raw,
  ];
  for (const c of candidates) {
    if (!c) continue;
    if (
      typeof c?.d_score !== "undefined" ||
      typeof c?.i_score !== "undefined" ||
      typeof c?.s_score !== "undefined" ||
      typeof c?.c_score !== "undefined"
    ) {
      return c;
    }
    if (
      typeof c?.d !== "undefined" ||
      typeof c?.i !== "undefined" ||
      typeof c?.s !== "undefined" ||
      typeof c?.c !== "undefined"
    ) {
      return c;
    }
    if (c?.field_0) return c.field_0;
  }
  return null;
}

async function toU8(arcium: any, v: any): Promise<number> {
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (v == null) throw new Error("Missing output field");
  if (typeof arcium.decryptU8 === "function") {
    const r = await arcium.decryptU8(v);
    if (typeof r === "number") return r;
    if (Array.isArray(r) && typeof r[0] === "number") return r[0];
  }
  throw new Error("Unable to decode MPC output");
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

  const encryptedAnswers = await Promise.all(
    mapped.map((v) => arcium.encryptU8(v))
  );

  const raw = await arcium.queueComputation({
    wallet,
    programId: PROGRAM_ID,
    computation: "compute_disc",
    args: {
      answers: encryptedAnswers,
    },
  });

  const out = pickOutput(raw);
  if (!out) {
    throw new Error("MPC output missing");
  }

  const d = await toU8(arcium, out.d_score ?? out.d);
  const i = await toU8(arcium, out.i_score ?? out.i);
  const s = await toU8(arcium, out.s_score ?? out.s);
  const c = await toU8(arcium, out.c_score ?? out.c);

  return { d, i, s, c, raw };
    }
