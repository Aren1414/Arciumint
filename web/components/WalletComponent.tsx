"use client";

import { useState, useEffect } from "react";
import { useConnect, useIsExtensionInstalled } from "@phantom/react-sdk";
import isMobileDevice from "@/utils/isMobileDevice";

export default function WalletComponent() {
  const { connect, isConnecting } = useConnect();
  const { isInstalled, isLoading: extensionLoading } = useIsExtensionInstalled();
  const [mobile, setMobile] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    setMobile(isMobileDevice());
  }, []);

  const handleConnect = async () => {
    try {
      let result;
      if (mobile) {
        result = await connect({ provider: "deeplink" });
      } else {
        if (isInstalled) {
          result = await connect({ provider: "injected" });
        } else {
          alert("Phantom extension not found. Please install it from https://phantom.app/download");
          return;
        }
      }

      
      if (result && result.publicKey) {
        setPublicKey(result.publicKey.toString());
      }
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  };

  if (extensionLoading) return <div>Checking Phantom extension...</div>;

  if (publicKey) {
    const shortKey = publicKey.slice(0, 6) + "...";
    return (
      <div className="px-4 py-2 bg-green-600 rounded-lg shadow-md">
        Connected: {shortKey}
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
