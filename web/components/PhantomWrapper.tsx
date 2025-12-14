"use client";

import { PhantomProvider, darkTheme } from "@phantom/react-sdk";
import { ReactNode } from "react";
import { AddressType } from "@phantom/browser-sdk";

export default function PhantomWrapper({ children }: { children: ReactNode }) {
  return (
    <PhantomProvider
      config={{
        providers: ["injected"],
        appId: "e26969a5-9c5d-4e09-bf78-aa4a525a5d7f",
        addressTypes: [AddressType.solana],
        authOptions: {
          redirectUrl: "https://www.arciumint.xyz/phantom-callback",
        },
      }}
      theme={darkTheme}
      appIcon="https://phantom-portal20240925173430423400000001.s3.ca-central-1.amazonaws.com/icons/eefe3956-73d8-4000-ad3d-c0829043f32e.png"
      appName="Arciumint"
    >
      {children}
    </PhantomProvider>
  );
}
