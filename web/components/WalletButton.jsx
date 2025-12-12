"use client";

import { useWallet } from "@solana/wallet-adapter-react";

export default function WalletButton() {
  const { connected, publicKey, connecting, disconnect, select } = useWallet();

  const handleClick = async () => {
    if (connected) {
      await disconnect();
    } else {
      await select("phantom");
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
