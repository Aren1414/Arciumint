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

      // Select Phantom wallet
      await select("Phantom");

      // DESKTOP EXTENSION — SAFE CHECK (بدون TypeScript)
      const hasPhantom =
        typeof window !== "undefined" &&
        window.phantom &&
        window.phantom.solana &&
        window.phantom.solana.isPhantom;

      if (hasPhantom) {
        await connect(); // show extension popup
        return;
      }

      // MOBILE — deep link fallback
      if (isMobile()) {
        const origin =
          typeof window !== "undefined"
            ? window.location.origin
            : "https://arciumint.vercel.app";

        const redirect =
          typeof window !== "undefined"
            ? window.location.href
            : origin;

        const url =
          "https://phantom.app/ul/v1/connect" +
          "?app_url=" +
          encodeURIComponent(origin) +
          "&redirect_link=" +
          encodeURIComponent(redirect) +
          "&cluster=devnet";

        window.location.href = url;
        return;
      }

      // desktop fallback
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
