import React from 'react';
import './createNFT.css';

const CreateNFT: React.FC = () => {
  return (
    <div className="upload-container">
      <h2>Create Your NFT</h2>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#888', marginBottom: '2rem' }}>
        🚧 This feature is under development. <br />
        <strong>Coming Soon...</strong>
      </p>

      <form className="upload-form" style={{ opacity: 0.5, pointerEvents: 'none' }}>
        <label>Upload Image (PNG, JPG, JPEG, WEBP - Max 5MB)</label>
        <input type="file" disabled />

        <label>NFT Name *</label>
        <input type="text" disabled />

        <label>Description</label>
        <textarea rows={3} disabled />

        <label>Mint Count *</label>
        <input type="number" min={1} disabled />

        <label>Price (in SOL) *</label>
        <input type="number" step="0.01" disabled />

        <button type="submit" disabled>
          Convert to NFT
        </button>
      </form>
    </div>
  );
};

export default CreateNFT;
