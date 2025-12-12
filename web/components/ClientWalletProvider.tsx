"use client";

import type { ReactElement } from "react";
import WalletConnectionProvider from "./WalletConnectionProvider";

export default function ClientWalletProvider({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  return <WalletConnectionProvider>{children}</WalletConnectionProvider>;
}
