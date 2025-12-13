"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

export default function PhantomCallback() {
  const router = useRouter();
  const wallet = useWallet();

  useEffect(() => {
    // Phantom بعد از deeplink کاربر رو با query params برمی‌گردونه
    const url = new URL(window.location.href);
    const errorCode = url.searchParams.get("errorCode");
    const errorMessage = url.searchParams.get("errorMessage");

    // اگر کاربر Reject کرده
    if (errorCode) {
      console.error("Phantom error:", errorCode, errorMessage);
      router.replace("/");
      return;
    }

    /**
     * در حالت Mobile Deeplink:
     * Phantom اپلیکیشن رو trusted می‌کنه
     * wallet-adapter بعد از reload خودش connect میشه
     * فقط باید برگردیم به صفحه اصلی
     */
    const timeout = setTimeout(() => {
      router.replace("/");
    }, 300);

    return () => clearTimeout(timeout);
  }, [router, wallet]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
      <div className="text-lg font-semibold">Connecting to Phantom…</div>
      <div className="text-white/60 text-sm">
        Please approve the connection in Phantom
      </div>
    </div>
  );
    }
