import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Solana
const connection = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");

// Faucet wallet
const faucetKeypair = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(process.env.FAUCET_PRIVATE_KEY!))
);

export async function POST(req: Request) {
  try {
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const userPubkey = new PublicKey(walletAddress);

    // 1️⃣ check if already claimed
    const { data: existing } = await supabase
      .from("faucet_claims")
      .select("id")
      .eq("wallet_address", walletAddress)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You have already claimed faucet" },
        { status: 403 }
      );
    }

    // 2️⃣ send 0.2 SOL
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: faucetKeypair.publicKey,
        toPubkey: userPubkey,
        lamports: 0.2 * LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendAndConfirmTransaction(connection, tx, [
      faucetKeypair,
    ]);

    // 3️⃣ store in DB
    await supabase.from("faucet_claims").insert({
      wallet_address: walletAddress,
      amount: 0.2,
    });

    return NextResponse.json({
      success: true,
      signature,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Faucet failed" },
      { status: 500 }
    );
  }
}
