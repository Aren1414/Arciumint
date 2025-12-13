"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function WalletButton() {
  // Desktop یا Phantom In-App Browser
  if (!isMobileBrowser()) {
    return <WalletMultiButton />;
  }

  const connectMobile = () => {
    const params = new URLSearchParams({
      cluster: "devnet",
      app_url: window.location.origin,
      redirect_link: `${window.location.origin}/phantom-callback`,
    });

    // مهم: same tab
    window.location.assign(
      `https://phantom.app/ul/v1/connect?${params.toString()}`
    );
  };

  return (
    <button
      onClick={connectMobile}
      className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition shadow-md"
    >
      Connect Wallet
    </button>
  );
}
