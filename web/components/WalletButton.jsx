"use client";

import { useWallet } from "@solana/wallet-adapter-react";

function isMobile() {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function WalletButton() {
  const {
    connected,
    publicKey,
    connecting,
    disconnect,
    select
  } = useWallet();

  const APP_URL = "https://arciumint.vercel.app";
  
  
  const mobileLink = `https://phantom.app/ul/v1/connect?app_url=${encodeURIComponent(APP_URL)}&redirect_link=${encodeURIComponent(APP_URL)}`;

  const handleConnect = async () => {
    if (connected) {
      await disconnect();
      return;
    }

    
    if (isMobile()) {
      window.location.href = mobileLink;
      return;
    }

    
    try {
      await select("Phantom");
    } catch (e) {
      console.error("Phantom select failed:", e);
    }
  };

  return (
    <button
      onClick={handleConnect}
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
