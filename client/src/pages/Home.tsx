import React from 'react';
import './home.css';
import { mintGenerativeNFT } from '../utils/mintGenerativeNFT';

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
        <iframe
          src="/generative.html"
          title="Generative Canvas"
          width="100%"
          height="400"
          style={{ borderRadius: '12px', border: 'none', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
        />
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
