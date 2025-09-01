import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getNFTById } from '../services/nftService';

type NFT = {
  id: string;
  title: string;
  imageUrl: string;
  mintCount: number;
  creatorUsername: string;
};

const NFTDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [nft, setNft] = useState<NFT | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchNFT() {
      const data = await getNFTById(id);
      setNft(data);
    }
    fetchNFT();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!nft) return <p>Loading...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{nft.title}</h2>
      <img src={nft.imageUrl} alt={nft.title} style={{ maxWidth: '400px' }} />
      <p>Minted: {nft.mintCount}</p>
      <p>Creator: {nft.creatorUsername}</p>
      <button onClick={handleCopyLink}>
        {copied ? 'Link copied!' : 'Copy NFT link'}
      </button>
    </div>
  );
};

export default NFTDetail;
