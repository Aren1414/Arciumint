import {
  ArciumClient,
  encryptU8,
  decryptU8,
} from "@arcium/client";
import { PublicKey } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(
  "A4EDNsvT5oGXVXFNvvetgJDzZmYySaWY773C784VXUoM"
);

/**
 * DISC option mapping
 * a -> 0 (D)
 * b -> 1 (I)
 * c -> 2 (S)
 * d -> 3 (C)
 */
export function mapDiscOption(option: string): number {
  switch (option) {
    case "a":
      return 0;
    case "b":
      return 1;
    case "c":
      return 2;
    case "d":
      return 3;
    default:
      throw new Error("Invalid DISC option");
  }
}

export async function submitDiscMpc({
  wallet,
  answers,
}: {
  wallet: any;
  answers: Record<number, string>;
}) {

  const ordered = Array.from({ length: 28 }).map((_, i) => {
    const v = answers[i + 1];
    if (!v) throw new Error("Incomplete answers");
    return mapDiscOption(v);
  });

  
  const arcium = await ArciumClient.fromWallet(wallet);

  
  const encryptedAnswers = await Promise.all(
    ordered.map((v) => encryptU8(arcium, v))
  );

  
  const tx = await arcium.invoke("compute_disc", {
    ciphertext_0: encryptedAnswers[0],
    ciphertext_1: encryptedAnswers[1],
    
  });

  return tx;
}
