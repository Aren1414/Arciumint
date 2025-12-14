"use client";

import { useState, useEffect } from "react";
import { useConnect, usePhantom, useIsExtensionInstalled } from "@phantom/react-sdk";
import isMobileDevice from "@/utils/isMobileDevice"; 

export default function WalletComponent() {
  const { connect, isConnecting, error } = useConnect();
  const { isConnected, user } = usePhantom();
  const { isInstalled, isLoading: extensionLoading } = useIsExtensionInstalled();
  const [mobile, setMobile] = useState<boolean>(false);

  useEffect(() => {
    setMobile(isMobileDevice());
  }, []);

  const handleConnect = async () => {
    try {
      if (mobile) {
        
        await connect({ provider: "deeplink" });
      } else {
        
        if (isInstalled) {
          await connect({ provider: "injected" });
        } else {
          alert("Phantom extension not found. Please install it from https://phantom.app/download");
        }
      }
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  };

  if (isConnected) {
    return (
      <div className="px-4 py-2 bg-green-600 rounded-lg shadow-md">
        Connected: {user?.name || user?.publicKey?.toString().slice(0, 6) + "..."}
      </div>
    );
  }

  if (extensionLoading) return <div>Checking Phantom extension...</div>;

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
