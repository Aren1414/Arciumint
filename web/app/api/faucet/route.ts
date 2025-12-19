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

export async function POST(req: Request) {
  try {
    const {
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      SOLANA_RPC_URL,
      FAUCET_PRIVATE_KEY,
    } = process.env;

    if (
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY ||
      !SOLANA_RPC_URL ||
      !FAUCET_PRIVATE_KEY
    ) {
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    const connection = new Connection(SOLANA_RPC_URL, "confirmed");

    const faucetKeypair = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(FAUCET_PRIVATE_KEY))
    );

    const body = await req.json();
    const address = body.address;

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const userPubkey = new PublicKey(address);

    const { data: existing } = await supabase
      .from("faucet_claims")
      .select("id")
      .eq("wallet_address", address)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You have already claimed faucet" },
        { status: 403 }
      );
    }

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

    await supabase.from("faucet_claims").insert({
      wallet_address: address,
      amount: 0.2,
    });

    return NextResponse.json({ success: true, signature });
  } catch {
    return NextResponse.json(
      { error: "Faucet failed" },
      { status: 500 }
    );
  }
}
