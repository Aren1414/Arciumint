"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function openPhantomDeeplink() {
  const params = new URLSearchParams({
    cluster: "devnet",
    app_url: window.location.origin,
    redirect_link: window.location.href,
  });

  const url = `https://phantom.app/ul/v1/connect?${params.toString()}`;
  window.location.href = url;
}

export default function WalletButton() {
  const { connected } = useWallet();

  // Desktop OR Phantom In-App Browser
  if (!isMobileBrowser()) {
    return <WalletMultiButton />;
  }

  // Mobile browser (Chrome / Safari)
  return (
    <button
      onClick={openPhantomDeeplink}
      className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition shadow-md"
    >
      {connected ? "Wallet Connected" : "Connect Wallet"}
    </button>
  );
}
