import React, { useEffect, useState } from 'react';
import './home.css';

type NFT = {
  id: string;
  name: string;
  imagePreview: string;
  mintCount: number;
};

const Home: React.FC = () => {
  const [topNFTs, setTopNFTs] = useState<NFT[]>([]);

  useEffect(() => {
    const allNFTs: NFT[] = JSON.parse(localStorage.getItem('nfts') || '[]');
    const sorted = allNFTs
      .filter(nft => nft.mintCount && nft.imagePreview)
      .sort((a, b) => b.mintCount - a.mintCount)
      .slice(0, 20);

    setTopNFTs(sorted);
  }, []);

  const handleGenerateMint = () => {
    alert('Generative art will be minted here.');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Arciumint</h1>
        <p>Create, mint, and share generative NFTs securely.</p>
      </header>

      <section className="generative-preview">
        <div className="preview-box">
          <canvas id="generativeCanvas" width={300} height={300}></canvas>
        </div>
        <button className="mint-button" onClick={handleGenerateMint}>
          Generate & Mint
        </button>
      </section>

      <section className="top-nfts">
        <h2>Top 20 NFTs</h2>
        <div className="nft-grid">
          {topNFTs.length === 0 ? (
            <p>No NFTs available.</p>
          ) : (
            topNFTs.map(nft => (
              <div key={nft.id} className="nft-card">
                <img src={nft.imagePreview} alt={nft.name} />
                <p>{nft.name}</p>
                <span>Minted: {nft.mintCount}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
