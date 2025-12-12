"use client";

import { useWallet } from "@solana/wallet-adapter-react";

function isMobile() {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function WalletButton() {
  const { connected, publicKey, connecting, disconnect, select } = useWallet();

  
  const MOBILE_DEEPLINK = `https://phantom.app/ul/v1/connect?app_url=${encodeURIComponent(
    "https://arciumint.vercel.app"
  )}`;

  const handleClick = async () => {
    if (connected) {
      await disconnect();
      return;
    }

    // ***** MOBILE *****
    if (isMobile()) {
      window.location.href = MOBILE_DEEPLINK;
      return;
    }

    // ***** DESKTOP (Extension) *****
    await select("phantom");
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
