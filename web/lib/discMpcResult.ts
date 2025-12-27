"use client";

import { Connection, PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(
  "6pbFHZfhjVEvwcWAUGoKbVjLF7rYqkcjkiqvLPAf2KJP"
);

export async function waitForDiscResult({
  connection,
  computationAccount,
}: {
  connection: Connection;
  computationAccount: PublicKey;
}) {
  return new Promise<{
    d: number;
    i: number;
    s: number;
    c: number;
  }>((resolve, reject) => {
    const listener = connection.onLogs(
      PROGRAM_ID,
      async (logs) => {
        try {
          const log = logs.logs.find((l) =>
            l.includes("SumEvent")
          );

          if (!log) return;

          connection.removeOnLogsListener(listener);

          const parsed = JSON.parse(
            log.substring(log.indexOf("{"))
          );

          resolve({
            d: parsed.d_score,
            i: parsed.i_score,
            s: parsed.s_score,
            c: parsed.c_score,
          });
        } catch (e) {
          reject(e);
        }
      },
      "confirmed"
    );
  });
}
