"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

// تابع ساده برای تشخیص موبایل
function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent);
}

export default function WalletButton() {
  const { connected, connect, connecting } = useWallet();
  const isMobile = isMobileBrowser();

  // اگر کاربر متصل است، یا در حالت دسکتاپ است، از دکمه استاندارد WalletMultiButton استفاده کنید.
  // این دکمه هم وضعیت اتصال را نشان می‌دهد و هم در دسکتاپ مودال (Modal) کیف پول‌ها را باز می‌کند.
  if (connected || !isMobile) {
    return <WalletMultiButton />;
  }

  // منطق موبایل: استفاده از یک دکمه سفارشی برای فراخوانی connect()
  // که آداپتور را وادار به ایجاد Deep Link می‌کند.
  const handleConnectMobile = () => {
    connect().catch((error) => {
      // این خطا ممکن است نشان‌دهنده نصب نبودن فانتوم یا لغو اتصال باشد.
      console.error("Connection failed in mobile:", error);
      // می‌توانید اینجا لینک مستقیم به صفحه دانلود فانتوم قرار دهید.
    });
  };

  return (
    <button
      onClick={handleConnectMobile}
      disabled={connecting}
      className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition shadow-md disabled:opacity-50"
    >
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
