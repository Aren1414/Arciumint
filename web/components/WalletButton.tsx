"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import type { ReactElement } from "react";
import bs58 from "bs58";
import nacl from "tweetnacl";


function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
}


function isPhantomInApp(): boolean {
  if (typeof window === "undefined") return false;
  return /Phantom/i.test(navigator.userAgent) || !!(window as any).phantom?.solana?.isPhantom;
}


function isPhantomExtensionInstalled(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return !!(w.solana?.isPhantom || w.phantom?.solana?.isPhantom);
}


function launchPhantomDeepLink(): void {
  if (typeof window === "undefined") return;

  const kp = nacl.box.keyPair();
  const dapp_pub = bs58.encode(Buffer.from(kp.publicKey));
  const dapp_secret = bs58.encode(Buffer.from(kp.secretKey));

  try {
    sessionStorage.setItem("phantom_dapp_secret", dapp_secret);
  } catch {}

  const origin = window.location.origin;
  const callback = `${origin}/api/phantom/callback`;

  const url =
    `https://phantom.app/ul/v1/connect` +
    `?app_url=${encodeURIComponent(origin)}` +
    `&redirect_link=${encodeURIComponent(callback)}` +
    `&dapp_encryption_public_key=${dapp_pub}` +
    `&cluster=devnet`;

  window.location.href = url;
}

export default function WalletButton(): ReactElement {
  const { connected, connect, disconnect, publicKey, connecting } = useWallet();

  const handleClick = async (): Promise<void> => {
    if (connected) {
      await disconnect();
      return;
    }

    
    if (!isMobile()) {
      if (isPhantomExtensionInstalled()) {
        try {
          await connect();
          return;
        } catch (err) {
          console.error("Phantom desktop connect failed:", err);
          return;
        }
      } else {
        alert("Phantom desktop extension not detected.");
        return;
      }
    }

    
    if (isPhantomInApp()) {
      try {
        await connect();
        return;
      } catch (err) {
        console.error("Phantom in-app mobile connect failed:", err);
        return;
      }
    }

    
    launchPhantomDeepLink();
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
