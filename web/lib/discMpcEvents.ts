"use client";

import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import { DISC_PROGRAM_ID } from "./discMpcClient";

export type DiscScoresEventDecoded = {
  computationAccount: PublicKey;
  d_score_cipher: Uint8Array;
  i_score_cipher: Uint8Array;
  s_score_cipher: Uint8Array;
  c_score_cipher: Uint8Array;
  nonce: Uint8Array; // 16
};

export async function waitForDiscScoresEvent(params: {
  connection: Connection;
  program: anchor.Program;
  computationAccount: PublicKey;
  timeoutMs?: number;
}): Promise<DiscScoresEventDecoded> {
  const { connection, program, computationAccount, timeoutMs = 120_000 } = params;

  return new Promise((resolve, reject) => {
    const parser = new anchor.EventParser(DISC_PROGRAM_ID, program.coder);
    let subId: number | null = null;

    const timer = setTimeout(async () => {
      try {
        if (subId !== null) await connection.removeOnLogsListener(subId);
      } catch {}
      reject(new Error("Timed out waiting for DISC result"));
    }, timeoutMs);

    subId = connection.onLogs(
      DISC_PROGRAM_ID,
      async (logInfo) => {
        try {
          for (const evt of parser.parseLogs(logInfo.logs)) {
            if (evt.name !== "DiscScoresEvent") continue;

            const e: any = evt.data;
            const compPk = new PublicKey(e.computationAccount);

            if (!compPk.equals(computationAccount)) continue;

            clearTimeout(timer);
            if (subId !== null) await connection.removeOnLogsListener(subId);

            resolve({
              computationAccount: compPk,
              d_score_cipher: new Uint8Array(e.dScoreCipher ?? e.d_score_cipher),
              i_score_cipher: new Uint8Array(e.iScoreCipher ?? e.i_score_cipher),
              s_score_cipher: new Uint8Array(e.sScoreCipher ?? e.s_score_cipher),
              c_score_cipher: new Uint8Array(e.cScoreCipher ?? e.c_score_cipher),
              nonce: new Uint8Array(e.nonce),
            });
          }
        } catch (err) {
          clearTimeout(timer);
          try {
            if (subId !== null) await connection.removeOnLogsListener(subId);
          } catch {}
          reject(err);
        }
      },
      "confirmed"
    );
  });
}
