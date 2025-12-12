"use client";

import { useWallet } from "@solana/wallet-adapter-react";

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
}

export default function WalletButton() {
  const { connected, publicKey, connecting, connect, disconnect, select } = useWallet();

  const handleClick = async () => {
    try {
      if (connected) {
        await disconnect();
        return;
      }

      // Try to select Phantom via wallet-adapter
      await select("Phantom");

      // If Phantom extension/provider is available in window, call connect() to prompt immediately
      if (typeof window !== "undefined" && (window as any)?.phantom?.solana?.isPhantom) {
        await connect();
        return;
      }

      // If mobile, open Phantom universal link as fallback (Phantom app will handle connect)
      if (isMobile()) {
        const origin = typeof window !== "undefined" ? window.location.origin : "https://arciumint.vercel.app";
        const redirect = typeof window !== "undefined" ? window.location.href : origin;
        const url = `https://phantom.app/ul/v1/connect?app_url=${encodeURIComponent(origin)}&redirect_link=${encodeURIComponent(redirect)}&cluster=devnet`;
        // open universal link
        window.location.href = url;
        return;
      }

      // Otherwise try connect (desktop extension) — select() may have set adapter
      await connect();
    } catch (err) {
      console.error("Wallet connect error:", err);
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
