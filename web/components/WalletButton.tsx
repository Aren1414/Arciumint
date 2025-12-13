"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

// تابع ساده برای تشخیص موبایل
function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobi|CriOS/i.test(navigator.userAgent);
}

export default function WalletButton() {
  const { connected, connect, connecting, wallet } = useWallet();
  const isMobile = isMobileBrowser();

  // در حالت اتصال یا دسکتاپ، از دکمه استاندارد استفاده کنید.
  // نکته: در موبایل، اگر WalletAdapter نصب باشد، این دکمه خودکار Deep Link را هندل می‌کند.
  // اما برای اطمینان از تجربه بهتر، همچنان از دکمه سفارشی زیر استفاده می‌کنیم.
  if (connected || !isMobile) {
    return <WalletMultiButton />;
  }

  // منطق موبایل: فراخوانی مستقیم connect از آداپتور
  const handleConnectMobile = async () => {
    if (!wallet) {
      // اگر کیف پولی در آداپتور پیدا نشد، کاربر را به صفحه انتخاب کیف پول هدایت کنید.
      // (این باید به صورت خودکار توسط WalletMultiButton هندل شود، اما برای اطمینان)
      return; 
    }
    
    try {
      await connect();
    } catch (error) {
      console.error("Connection attempt failed:", error);
      // در اینجا اگر اتصال ناموفق بود (مثلا Phantom نصب نیست)، می‌توانید
      // کاربر را به صفحه دانلود فانتوم هدایت کنید: window.open('https://phantom.app/', '_blank');
    }
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
