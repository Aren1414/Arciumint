"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import type { ReactElement } from "react";
import bs58 from "bs58";

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS|Mobile/i.test(navigator.userAgent);
}

function isPhantomInApp(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Phantom/i.test(ua);
}

function isPhantomInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as any).phantom?.solana?.isPhantom);
}

function openPhantomDeepLink(): void {
  const origin = encodeURIComponent(window.location.href);
  const link = `https://phantom.app/ul/v1/connect?app_url=${origin}&redirect_link=${origin}&cluster=devnet`;
  window.location.href = link;
}

export default function WalletButton(): ReactElement {
  const { connected, publicKey, connecting, connect, disconnect } = useWallet();

  const handleClick = async (): Promise<void> => {
    if (connected) {
      await disconnect();
      return;
    }

    // Desktop
    if (!isMobile()) {
      if (isPhantomInstalled()) {
        try {
          await connect();
        } catch (e) {
          console.error("Desktop Phantom connect failed", e);
        }
        return;
      }

      // No extension installed
      window.open("https://phantom.app/", "_blank");
      return;
    }

    // Mobile in Phantom browser
    if (isPhantomInApp()) {
      try {
        await connect();
        return;
      } catch (e) {
        console.error("Phantom in-app mobile connect failed", e);
      }
    }

    // Mobile Chrome / Safari → deep-link
    openPhantomDeepLink();
  };

  return (
    <button
      onClick={handleClick}
      disabled={connecting}
      className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition font-semibold shadow-md"
    >
      {connecting
        ? "Connecting..."
        : connected
        ? `Connected: ${publicKey?.toBase58().slice(0, 4)}...`
        : "Connect Phantom Wallet"}
    </button>
  );
}
