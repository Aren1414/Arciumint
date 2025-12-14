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
        className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md text-white"
      >
        Connect Wallet
      </button>
    );
  }

  
  if (user?.addresses?.length) {
    const address = user.addresses[0].address;
    const short = address.slice(0, 6) + "…" + address.slice(-4);

    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-green-600 rounded-lg shadow-md text-white">
          {short}
        </div>

        <button
          onClick={disconnect}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return null;
}
