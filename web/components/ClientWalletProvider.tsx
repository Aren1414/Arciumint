"use client";

import WalletConnectionProvider from "./WalletConnectionProvider";

export default function ClientWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WalletConnectionProvider>{children}</WalletConnectionProvider>;
}
