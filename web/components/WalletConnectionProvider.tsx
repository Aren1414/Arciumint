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
  // Devnet endpoint
  const endpoint = "https://api.devnet.solana.com";
  const network = WalletAdapterNetwork.Devnet;

  // فقط Phantom رجیستر می‌شود
  const wallets = useMemo(() => [new PhantomWalletAdapter({ network })], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      {/* autoConnect باعث می‌شود سشن موبایل بعد از callback به‌صورت خودکار برگردد */}
      <WalletProvider wallets={wallets} autoConnect={true}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
