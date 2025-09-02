import React, { useState } from 'react';
import { connectPhantom } from '../utils/wallet';

type Props = {
  onConnect: (address: string) => void;
};

const ConnectWallet: React.FC<Props> = ({ onConnect }) => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');

  const handleConnect = async () => {
    const userAddress = await connectPhantom();
    if (userAddress) {
      setConnected(true);
      setAddress(userAddress);
      onConnect(userAddress);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      {connected ? (
        <p>✅ Connected: {address.slice(0, 4)}...{address.slice(-4)}</p>
      ) : (
        <button onClick={handleConnect}>🔗 Connect Wallet</button>
      )}
    </div>
  );
};

export default ConnectWallet;
