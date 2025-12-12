"use client";

import { useWallet } from "@/components/WalletConnectionProvider";

export default function WalletButton() {
  const { wallet, connecting, connected, disconnect, select } = useWallet();

  const handleClick = async () => {
    if (connected) {
      disconnect();
    } else {
      await select("phantom");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition"
      disabled={connecting}
    >
      {connecting
        ? "Connecting..."
        : connected
        ? `Connected: ${wallet?.publicKey?.toBase58().slice(0, 4)}...`
        : "Connect Phantom Wallet"}
    </button>
  );
}
