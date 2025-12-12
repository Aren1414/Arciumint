"use client";

import { useMemo } from "react";
import type { ReactElement } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

interface Props {
  children: React.ReactNode;
}

export default function WalletConnectionProvider({ children }: Props): ReactElement {
  const endpoint = "https://api.devnet.solana.com";
  const network = WalletAdapterNetwork.Devnet;

  // فقط Phantom. هیچ ولت دیگری رجیستر نمی‌شود.
  const wallets = useMemo(() => [new PhantomWalletAdapter({ network })], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      {/* autoConnect برای برگرداندن سشن (در صورت وجود) */}
      <WalletProvider wallets={wallets} autoConnect={true}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
