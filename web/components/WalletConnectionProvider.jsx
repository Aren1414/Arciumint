"use client";

import { useMemo, createContext, useContext } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";

import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
require("@solana/wallet-adapter-react-ui/styles.css");

const WalletContext = createContext(null);

export default function WalletConnectionProvider({ children }) {
  const endpoint = "https://api.devnet.solana.com";

  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContext.Provider value={useWallet()}>
            {children}
          </WalletContext.Provider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function useWalletContext() {
  return useContext(WalletContext);
}
