"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import type { ReactElement } from "react";
import nacl from "tweetnacl";
import bs58 from "bs58";

/** موبایل بودن را تشخیص می‌دهد */
function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
}

/** داخل اپ Phantom بودن را تشخیص می‌دهد (in-app browser) */
function isPhantomInApp(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Phantom/i.test(ua) || !!(window as any).phantom?.solana?.isPhantom;
}

/** وجود اکستنشن Phantom روی دسکتاپ */
function isPhantomExtensionInstalled(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as any;
  // اکستنشن Phantom باید این‌ها را تزریق کند
  return !!(w.solana?.isPhantom || w.phantom?.solana?.isPhantom);
}

/** Deeplink استاندارد Phantom برای مرورگرهای موبایل خارجی، همان تب */
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

  window.location.assign(url); // همان تب، بدون باز کردن تب جدید
}

export default function WalletButton(): ReactElement {
  const { connected, publicKey, connecting, connect, disconnect } = useWallet();

  const handleClick = async (): Promise<void> => {
    // اگر وصل است، قطع اتصال
    if (connected) {
      await disconnect();
      return;
    }

    // دسکتاپ: فقط اگر اکستنشن Phantom واقعاً نصب است، تلاش برای اتصال
    if (!isMobile()) {
      if (isPhantomExtensionInstalled()) {
        try {
          await connect();
          return;
        } catch (err) {
          console.error("Phantom desktop connect failed:", err);
          // هیچ انتقالی به صفحه‌ی دانلود انجام نمی‌دهیم
          return;
        }
      } else {
        // اکستنشن نصب نیست → هیچ کاری نمی‌کنیم (یا UI خودت پیام بده)
        console.warn("Phantom extension not detected.");
        return;
      }
    }

    // موبایل: اگر داخل اپ Phantom هستیم، اتصال مستقیم با Adapter
    if (isPhantomInApp()) {
      try {
        await connect();
        return;
      } catch (err) {
        console.error("Phantom in-app mobile connect failed:", err);
        // اگر به هر دلیل شکست خورد، هیچ صفحه‌ی دانلودی باز نمی‌کنیم
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
