import React from 'react'
import './home.css'

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Arciumint</h1>
        <p>Create, mint, and share generative NFTs securely.</p>
      </header>

      <section className="generative-preview">
        <div className="preview-box">
          <p>Generative Art Preview</p>
          {/* generative code..*/}
        </div>
        <button className="mint-button">Generate & Mint</button>
      </section>

      <section className="top-nfts">
        <h2>Top 20 NFTs</h2>
        <div className="nft-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="nft-card">
              <p>NFT #{i + 1}</p>
              <span>Minted: 0</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
