"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  // تشخیص موبایل قوی‌تر
  return /Android|iPhone|iPad|iPod|Mobi|CriOS/i.test(navigator.userAgent);
}

export default function WalletButton() {
  // اگر دسکتاپ است یا در محیطی هستیم که WalletMultiButton کار می‌کند.
  if (!isMobileBrowser()) {
    return <WalletMultiButton />;
  }

  // اگر موبایل است: Deep Link مستقیم برای باز شدن اپلیکیشن فانتوم.
  const connectMobile = () => {
    const params = new URLSearchParams({
      cluster: "devnet",
      app_url: window.location.origin,
      // نکته: بازگشت به صفحه اصلی ('/') حیاتی است تا آداپتور بتواند Session را بخواند.
      redirect_link: `${window.location.origin}/`, 
    });

    // Deep Link فانتوم
    window.location.assign(
      `https://phantom.app/ul/v1/connect?${params.toString()}`
    );
  };

  // نمایش دکمه سفارشی برای موبایل
  return (
    <button
      onClick={connectMobile}
      className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition shadow-md"
    >
      Connect Wallet
    </button>
  );
}
