"use client";

import { useWallet } from "@solana/wallet-adapter-react";

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function WalletButton() {
  const { connect, connected, connecting, publicKey } = useWallet();

  const handleConnect = async () => {
    
    if (!isMobile()) {
      await connect();
      return;
    }

    
    const url =
      "https://phantom.app/ul/v1/connect" +
      "?app_url=" + encodeURIComponent(window.location.origin) +
      "&redirect_link=" + encodeURIComponent(window.location.origin) +
      "&cluster=devnet";

    window.location.href = url;
  };

  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="px-4 py-2 rounded bg-purple-600 text-white"
    >
      {connected
        ? `Connected: ${publicKey?.toBase58().slice(0, 4)}...`
        : "Connect Phantom"}
    </button>
  );
}
