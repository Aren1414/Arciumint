"use client";

import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { ReactElement } from "react";

/**
 * WalletButton: ترکیبی از دو رویکرد
 * - دسکتاپ: از wallet adapter (extension) استفاده می‌کند
 * - موبایل: مستقیم deep-link به phantom.app/ul/v1/connect می‌زند تا اپ را باز کند
 *
 * این پیاده‌سازی از تجربه‌های واقعی و مستندات Phantom استفاده می‌کند.
 */

function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function isPhantomInjected(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as any;
  // Phantom extension sets window.phantom?.solana or window.solana
  return Boolean(w?.phantom?.solana?.isPhantom || w?.solana?.isPhantom);
}

/**
 * سازندهٔ deep link رسمی Phantom
 * docs: https://docs.phantom.app/ (use /ul/v1/connect)
 */
function buildPhantomDeepLink(): string {
  const origin = window.location.origin;
  // redirect back to current page after connect
  const redirect = window.location.href;
  const cluster = "devnet";
  // Use origin & redirect_link encoded per Phantom examples
  const url =
    "https://phantom.app/ul/v1/connect" +
    "?app_url=" +
    encodeURIComponent(origin) +
    "&redirect_link=" +
    encodeURIComponent(redirect) +
    "&cluster=" +
    encodeURIComponent(cluster);
  return url;
}

export default function WalletButton(): ReactElement {
  const { connected, publicKey, connecting, connect, disconnect } = useWallet();

  const handleClick = useCallback(async (): Promise<void> => {
    // if already connected -> disconnect
    if (connected) {
      try {
        await disconnect();
      } catch (e) {
        console.error("Disconnect failed", e);
      }
      return;
    }

    // DESKTOP: if extension injected -> use adapter connect (popup)
    if (!isMobile()) {
      if (isPhantomInjected()) {
        try {
          await connect();
        } catch (e) {
          console.error("Desktop connect failed", e);
        }
        return;
      }

      // No extension -> open phantom landing in new tab (user can install)
      window.open("https://phantom.app/", "_blank");
      return;
    }

    // MOBILE:
    // Try to open the Phantom app via its universal link.
    // If the app is installed the OS will open it; otherwise the link will
    // show Phantom landing (or App Store/Play Store).
    try {
      const deep = buildPhantomDeepLink();
      // Use location.assign to trigger same-tab navigation to the universal link.
      // This attempts to open the app. Do NOT immediately redirect to phantom.com here.
      window.location.assign(deep);
    } catch (e) {
      console.error("Deep link failed, opening phantom landing", e);
      window.location.href = "https://phantom.app/";
    }
  }, [connected, connect, disconnect]);

  return (
    <button
      onClick={handleClick}
      disabled={connecting}
      className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 transition font-semibold shadow-md"
      aria-label="Connect Phantom Wallet"
    >
      {connecting
        ? "Connecting..."
        : connected
        ? `Connected: ${publicKey?.toBase58().slice(0, 4)}...`
        : "Connect Phantom Wallet"}
    </button>
  );
}
