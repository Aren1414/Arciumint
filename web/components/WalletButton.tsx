"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import type { ReactElement } from "react";

export default function WalletButton(): ReactElement {
  const { connected, connect, disconnect } = useWallet();

  const isMobile = () => {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
  };

  const handleClick = async () => {
    if (connected) {
      await disconnect();
      return;
    }

    
    if (isMobile()) {
      const origin = window.location.origin;
      const callback = `${origin}/api/phantom/callback`;
      const url = `https://phantom.app/ul/v1/connect?app_url=${encodeURIComponent(
        origin
      )}&redirect_link=${encodeURIComponent(callback)}&cluster=devnet`;

      window.location.replace(url);
      return;
    }

    
    try {
      await connect();
    } catch (err) {
      console.error("Phantom desktop connect failed:", err);
    }
  };

  return <button onClick={handleClick}><WalletMultiButton /></button>;
}
