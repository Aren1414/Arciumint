import React from 'react';
import './home.css';
import { mintGenerativeNFT } from '../utils/mintGenerativeNFT';
import GenerativeCanvas from '../components/GenerativeCanvas';

const Home: React.FC = () => {
  const userAddress = window.solana?.publicKey?.toBase58();

  const handleGenerateMint = async () => {
    if (!userAddress) {
      alert('Please connect your wallet first.');
      return;
    }

    const result = await mintGenerativeNFT('generativeCanvas', userAddress);
    if (result.success) {
      alert('✅ NFT minted successfully!');
    } else {
      alert(`❌ Mint failed: ${result.error}`);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>MPC World</h1>
        <p>
          MPC World is a generative NFT experience built on Solana, where each piece is uniquely crafted and securely minted using multi-party computation. No templates, no repetition—just pure algorithmic creativity.
        </p>
      </header>

      <section className="generative-preview">
        <GenerativeCanvas />
        <button className="mint-button" onClick={handleGenerateMint}>
          Generate & Mint
        </button>
      </section>

      <section className="top-nfts">
        <h2>🔥 Trending NFTs</h2>
        <div className="coming-soon">
          <p>Coming Soon...</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
