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
        className="
          px-3 py-2 sm:px-4 sm:py-2.5
          bg-blue-600 hover:bg-blue-700
          rounded-lg shadow-md
          text-xs sm:text-sm font-medium text-white
          transition
        "
      >
        Connect Wallet
      </button>
    );
  }

  if (user?.addresses?.length) {
    const address = user.addresses[0].address;
    const short = `${address.slice(0, 4)}…${address.slice(-4)}`;

    return (
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Address badge */}
        <div
          className="
            px-3 py-1.5 sm:px-4 sm:py-2
            bg-green-600
            rounded-full sm:rounded-lg
            text-xs sm:text-sm
            text-white font-medium
            shadow
          "
        >
          {short}
        </div>

        {/* Disconnect */}
        <button
          onClick={disconnect}
          title="Disconnect"
          className="
            px-2 py-1.5 sm:px-3 sm:py-2
            bg-red-600 hover:bg-red-700
            rounded-full sm:rounded-lg
            text-xs sm:text-sm text-white
            transition
          "
        >
          Disconnect
        </button>
      </div>
    );
  }

  return null;
}
