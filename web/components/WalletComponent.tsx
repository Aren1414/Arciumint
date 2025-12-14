"use client";

import { useState, useEffect } from "react";
import { useConnect, useIsExtensionInstalled } from "@phantom/react-sdk";
import isMobileDevice from "@/utils/isMobileDevice";

export default function WalletComponent() {
  const { connect, isConnecting } = useConnect();
  const { isInstalled, isLoading: extensionLoading } = useIsExtensionInstalled();
  const [mobile, setMobile] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

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
          alert(
            "Phantom extension not found. Please install it from https://phantom.app/download"
          );
          return;
        }
      }

      
      if (result && Array.isArray(result.addresses) && result.addresses.length > 0) {
        setWalletAddress(result.addresses[0].address);
      }
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  };

  if (extensionLoading) return <div>Checking Phantom extension...</div>;

  if (walletAddress) {
    const shortKey = walletAddress.slice(0, 6) + "...";
    return (
      <div className="px-4 py-2 bg-green-600 rounded-lg shadow-md text-white">
        Connected: {shortKey}
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md text-white"
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
