"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import type { ReactElement } from "react";
import nacl from "tweetnacl";
import bs58 from "bs58";

/** تشخیص موبایل */
function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
}

/** داخل اپ Phantom بودن (in-app browser) */
function isPhantomInApp(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Phantom/i.test(ua) || !!(window as any).phantom?.solana?.isPhantom;
}

/** وجود اکستنشن Phantom روی دسکتاپ */
function isPhantomExtensionInstalled(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return !!(w.solana?.isPhantom || w.phantom?.solana?.isPhantom);
}

/** Deeplink استاندارد Phantom برای موبایلِ مرورگر خارجی، با بازگشت در همان تب */
function launchPhantomDeepLink(): void {
  const kp = nacl.box.keyPair();
  const dapp_pub = bs58.encode(Buffer.from(kp.publicKey));
  const dapp_secret = bs58.encode(Buffer.from(kp.secretKey));

  // نگهداری دَپ‌سکرت برای رمزگشایی پاسخ
  try {
    sessionStorage.setItem("phantom_dapp_secret", dapp_secret);
  } catch {
    // در صورت بلاک بودن sessionStorage توسط مرورگر، خطا را نادیده می‌گیریم
  }

  const origin = window.location.origin;
  const callback = `${origin}/phantom-callback`;

  // طبق داکیومنت Phantom: connect URI با redirect_link و کلید رمزنگاری
  const url =
    "https://phantom.app/ul/v1/connect" +
    "?app_url=" + encodeURIComponent(origin) +
    "&redirect_link=" + encodeURIComponent(callback) +
    "&dapp_encryption_public_key=" + dapp_pub +
    "&cluster=devnet";

  // همان تب، نه تب جدید
  window.location.replace(url);
}

export default function WalletButton(): ReactElement {
  const { connected, publicKey, connecting, connect, disconnect } = useWallet();

  const handleClick = async (): Promise<void> => {
    // قطع اتصال در صورت اتصال
    if (connected) {
      await disconnect();
      return;
    }

    // دسکتاپ → فقط اگر اکستنشن واقعاً تزریق شده باشد
    if (!isMobile()) {
      if (isPhantomExtensionInstalled()) {
        try {
          await connect(); // Wallet Adapter UI اکستنشن را باز می‌کند
          return;
        } catch (err) {
          console.error("Phantom desktop connect failed:", err);
          // هیچ انتقالی به صفحه دانلود انجام نمی‌دهیم
          return;
        }
      } else {
        // اکستنشن نصب نیست → هیچ خروجی اجباری؛ می‌تونی پیام UI بدهی
        console.warn("Phantom extension not detected.");
        return;
      }
    }

    // موبایل داخل اپ Phantom → اتصال مستقیم
    if (isPhantomInApp()) {
      try {
        await connect();
        return;
      } catch (err) {
        console.error("Phantom in-app mobile connect failed:", err);
        return;
      }
    }

    // موبایلِ مرورگر خارجی → deeplink در همان تب
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
