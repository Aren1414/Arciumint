"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

export default function SolanaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const endpoint = useMemo(() => "https://api.devnet.solana.com", []);
  // PhantomWalletAdapter را نگه می‌داریم تا Deep Link بازگشتی بتواند سشن را مدیریت کند.
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={false}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
