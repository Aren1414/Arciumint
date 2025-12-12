"use client";

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";

import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function WalletConnectionProvider({ children }) {
  const endpoint = "https://api.devnet.solana.com";

  // Mobile deep link MUST be provided
  const wallets = useMemo(() => {
    return [
      new PhantomWalletAdapter({
        // APP DEEP LINK FOR MOBILE
        appUrl: "https://arciumint.vercel.app",
        // Manual override to prevent redirect-to-download
        // Ensures mobile opens the app instead of website
        supportedTransactionVersions: ["legacy", 0],
      }),
    ];
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
