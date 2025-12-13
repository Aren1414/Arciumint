"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

export default function WalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-32 rounded bg-gray-700 animate-pulse" />;
  }

  return (
    <div suppressHydrationWarning>
      <WalletMultiButton />
    </div>
  );
}
