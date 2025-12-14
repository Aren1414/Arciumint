"use client";

import { usePhantom, useModal } from "@phantom/react-sdk";

export default function WalletComponent() {
  const { open } = useModal();
  const { isConnected, user } = usePhantom();

  if (isConnected) {
    return (
      <div className="px-4 py-2 bg-green-600 rounded-lg text-white">
        Connected: {user?.address}
      </div>
    );
  }

  return (
    <button
      onClick={open}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
    >
      Connect Wallet
    </button>
  );
}
