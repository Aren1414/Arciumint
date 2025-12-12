"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import type { ReactElement } from "react";
import nacl from "tweetnacl";
import bs58 from "bs58";

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
}

function launchPhantomDeepLink(): void {
  const kp = nacl.box.keyPair();
  const dapp_pub = bs58.encode(Buffer.from(kp.publicKey));
  const dapp_secret = bs58.encode(Buffer.from(kp.secretKey));
  sessionStorage.setItem("phantom_dapp_secret", dapp_secret);

  const origin = window.location.origin;
  const callback = `${origin}/phantom-callback`;

  const url =
    "https://phantom.app/ul/v1/connect" +
    "?app_url=" + encodeURIComponent(origin) +
    "&redirect_link=" + encodeURIComponent(callback) +
    "&dapp_encryption_public_key=" + dapp_pub +
    "&cluster=devnet";

  // همان تب، بدون باز کردن تب جدید
  window.location.assign(url);
}

export default function WalletButton(): ReactElement {
  const { connected, publicKey, connecting, connect, disconnect } = useWallet();

  const handleClick = async (): Promise<void> => {
    if (connected) {
      await disconnect();
      return;
    }

    try {
      // دسکتاپ (Extension) و موبایل داخل اپ Phantom
      await connect();
      return;
    } catch (err) {
      console.error("Wallet connect failed:", err);
      // مرورگر خارجی موبایل → deeplink
      if (isMobile()) {
        launchPhantomDeepLink();
        return;
      }
      // fallback نهایی دسکتاپ
      window.open("https://phantom.app/", "_blank");
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
