"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import type { ReactElement } from "react";
import nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * مرورگر داخلی Phantom را تشخیص می‌دهد.
 * در این حالت Wallet Adapter مستقیماً کار می‌کند و نیاز به deeplink نیست.
 */
function isPhantomInApp(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Phantom/i.test(ua) || (window as any).phantom?.solana?.isPhantom === true;
}

/** تشخیص موبایل */
function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
}

/**
 * Deeplink استاندارد Phantom برای مرورگرهای موبایل خارج از اپ Phantom.
 * در همان تب اجرا می‌شود و به /phantom-callback برمی‌گردد.
 */
function launchPhantomDeepLink(): void {
  const kp = nacl.box.keyPair();
  const dapp_pub = bs58.encode(Buffer.from(kp.publicKey));
  const dapp_secret = bs58.encode(Buffer.from(kp.secretKey));

  // نگهداری دَپ‌سکرت برای رمزگشایی پاسخ
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

  // همان تب، بدون باز کردن تب جدید
  window.location.assign(url);
}

export default function WalletButton(): ReactElement {
  const { connected, publicKey, connecting, connect, disconnect } = useWallet();

  const handleClick = async (): Promise<void> => {
    // اگر وصل است، قطع اتصال
    if (connected) {
      await disconnect();
      return;
    }

    // اگر داخل اپ Phantom هستیم (موبایل)، یا دسکتاپ با Extension،
    // Wallet Adapter خودش UI مناسب را باز می‌کند.
    if (!isMobile() || isPhantomInApp()) {
      try {
        await connect(); // دسکتاپ: Extension UI / موبایل داخل اپ: in-app connect
        return;
      } catch (err) {
        console.error("Wallet adapter connect failed:", err);
        // اگر شکست خورد، در موبایل خارجی می‌رویم سراغ deeplink
        if (isMobile() && !isPhantomInApp()) {
          launchPhantomDeepLink();
          return;
        }
      }
    }

    // موبایل خارج از اپ Phantom → deeplink
    if (isMobile() && !isPhantomInApp()) {
      launchPhantomDeepLink();
      return;
    }

    //Fallback نهایی دسکتاپ: باز کردن سایت Phantom
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
