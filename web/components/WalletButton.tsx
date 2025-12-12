"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import type { ReactElement } from "react";

export default function WalletButton(): ReactElement {
  const { connected, publicKey, connecting, connect, disconnect } = useWallet();

  const handleClick = async (): Promise<void> => {
    if (connected) {
      try {
        await disconnect();
      } catch (e) {
        console.error("Disconnect error:", e);
      }
      return;
    }

    try {
      
      await connect();
    } catch (err) {
      
      console.error("Connect error:", err);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={connecting}
      className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition"
    >
      {connecting
        ? "Connecting..."
        : connected
        ? `Connected: ${publicKey?.toBase58().slice(0, 4)}...`
        : "Connect Phantom Wallet"}
    </button>
  );
}
