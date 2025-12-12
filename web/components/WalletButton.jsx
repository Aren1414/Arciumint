"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import nacl from "tweetnacl";
import bs58 from "bs58";

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
}

export default function WalletButton() {
  const { connected, publicKey, connecting, disconnect } = useWallet();

  const handleMobileConnect = () => {
    const kp = nacl.box.keyPair();

    const dapp_pub = bs58.encode(Buffer.from(kp.publicKey));
    const dapp_secret = bs58.encode(Buffer.from(kp.secretKey));

    sessionStorage.setItem("phantom_dapp_secret", dapp_secret);

    const origin = window.location.origin;
    const callback = `${origin}/phantom-callback`;

    const url =
      "https://phantom.app/ul/v1/connect" +
      "?app_url=" +
      encodeURIComponent(origin) +
      "&redirect_link=" +
      encodeURIComponent(callback) +
      "&dapp_encryption_public_key=" +
      dapp_pub +
      "&cluster=devnet";

    window.location.href = url;
  };

  const handleClick = async () => {
    if (connected) {
      await disconnect();
      return;
    }

    // desktop extension
    if (typeof window !== "undefined" && window.phantom?.solana?.isPhantom) {
      try {
        await window.phantom.solana.connect();
        return;
      } catch (err) {
        console.error("Phantom desktop connect failed:", err);
      }
    }

    // mobile deeplink
    if (isMobile()) {
      handleMobileConnect();
      return;
    }

    // fallback
    window.open("https://phantom.app/", "_blank");
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
