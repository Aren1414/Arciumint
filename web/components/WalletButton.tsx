"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import type { ReactElement } from "react";

export default function WalletButton(): ReactElement {
  
  return (
    <div style={{ minWidth: 140 }}>
      <WalletMultiButton />
    </div>
  );
}
