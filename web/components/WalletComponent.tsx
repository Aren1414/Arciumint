"use client";

import { usePhantom, useModal, useDisconnect } from "@phantom/react-sdk";

export default function WalletComponent() {
  const { open } = useModal();
  const { disconnect } = useDisconnect();
  const { isConnected, user } = usePhantom();

  
  if (!isConnected) {
    return (
      <button
        onClick={open}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg shadow-md text-white text-sm sm:text-base"
      >
        Connect Wallet
      </button>
    );
  }

  
  if (user?.addresses?.length) {
    const address = user.addresses[0].address;
    const short = `${address.slice(0, 4)}…${address.slice(-4)}`;

    return (
      <div className="flex items-center gap-2">
        {/* Address badge */}
        <div className="px-3 py-1.5 bg-green-600/90 rounded-full text-xs sm:text-sm text-white shadow">
          {short}
        </div>

        {/* Disconnect (small icon-like button) */}
        <button
          onClick={disconnect}
          title="Disconnect"
          className="px-2 py-1.5 bg-red-600/80 hover:bg-red-700 rounded-full text-xs text-white transition"
        >
          ✕
        </button>
      </div>
    );
  }

  return null;
}
