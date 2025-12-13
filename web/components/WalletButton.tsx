"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function openPhantomDeeplink() {
  const redirect = `${window.location.origin}/phantom-callback`;

  const params = new URLSearchParams({
    cluster: "devnet",
    app_url: window.location.origin,
    redirect_link: redirect,
  });

  window.location.href = `https://phantom.app/ul/v1/connect?${params.toString()}`;
}

export default function WalletButton() {
  // Desktop OR Phantom In-App Browser
  if (!isMobileBrowser()) {
    return <WalletMultiButton />;
  }

  // Mobile browser (Safari / Chrome)
  return (
    <button
      onClick={openPhantomDeeplink}
      className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition shadow-md"
    >
      Connect Wallet
    </button>
  );
}
