"use client";

import { usePhantom, useModal } from "@phantom/react-sdk";

export default function WalletComponent() {
  const { open } = useModal();
  const { isConnected, user } = usePhantom();

  if (isConnected && user?.addresses?.length) {
    const address = user.addresses[0].address;
    const short = address.slice(0, 6) + "...";

    return (
      <div className="px-4 py-2 bg-green-600 rounded-lg shadow-md text-white">
        Connected: {short}
      </div>
    );
  }

  return (
    <button
      onClick={open}
      className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-md text-white"
    >
      Connect Wallet
    </button>
  );
}
