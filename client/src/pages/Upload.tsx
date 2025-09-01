import React, { useState, ChangeEvent, FormEvent } from 'react';
import './upload.css';

type UploadProps = {
  userAddress: string;
};

const Upload: React.FC<UploadProps> = ({ userAddress }) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mintCount, setMintCount] = useState<number>(1);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [mintLink, setMintLink] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      alert('Only PNG, JPG, JPEG, and WEBP formats are allowed.');
      return;
    }
    if (file.size > maxSize) {
      alert('File size must be under 5MB.');
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!image || !name || !mintCount || !price) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    const newNFT = {
      id: Date.now().toString(),
      name,
      description,
      mintCount: parseInt(mintCount.toString()),
      price: parseFloat(price),
      imagePreview: preview,
      creator: userAddress,
    };

    const existingNFTs = JSON.parse(localStorage.getItem('nfts') || '[]');
    localStorage.setItem('nfts', JSON.stringify([...existingNFTs, newNFT]));

    const link = `${window.location.origin}/mint/${newNFT.id}`;
    setMintLink(link);

    setImage(null);
    setPreview(null);
    setName('');
    setDescription('');
    setMintCount(1);
    setPrice('');
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mintLink);
    alert('Mint link copied to clipboard!');
  };

  return (
    <div className="upload-container">
      <h2>Create Your NFT</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <label>Upload Image (PNG, JPG, JPEG, WEBP - Max 5MB)</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        {preview && <img src={preview} alt="Preview" className="preview-image" />}

        <label>NFT Name *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />

        <label>Mint Count *</label>
        <input
          type="number"
          min={1}
          value={mintCount}
          onChange={(e) => setMintCount(Number(e.target.value))}
          required
        />

        <label>Price (in SOL) *</label>
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Convert to NFT'}
        </button>
      </form>

      {mintLink && (
        <div className="mint-link-box">
          <p>Your mint link:</p>
          <input type="text" value={mintLink} readOnly />
          <button onClick={handleCopy}>Copy Link</button>
        </div>
      )}
    </div>
  );
};

export default Upload;
