import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type NFT = {
  id: string;
  name: string;
  description: string;
  image: string;
  mintCount: number;
  mintedBy?: string[];
};

const Mint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [nft, setNft] = useState<NFT | null>(null);
  const [minted, setMinted] = useState(false);
  const userAddress = localStorage.getItem('userAddress') || '';

  useEffect(() => {
    const storedNFTs: NFT[] = JSON.parse(localStorage.getItem('nfts') || '[]');
    const selectedNFT = storedNFTs.find(item => item.id === id);
    setNft(selectedNFT || null);
  }, [id]);

  const handleMint = () => {
    if (!nft || !userAddress) return;

    const updatedNFTs = JSON.parse(localStorage.getItem('nfts') || '[]').map((item: NFT) => {
      if (item.id === id && !(item.mintedBy || []).includes(userAddress)) {
        return {
          ...item,
          mintCount: item.mintCount + 1,
          mintedBy: [...(item.mintedBy || []), userAddress],
        };
      }
      return item;
    });

    localStorage.setItem('nfts', JSON.stringify(updatedNFTs));
    setNft(prev =>
      prev
        ? {
            ...prev,
            mintCount: prev.mintCount + 1,
            mintedBy: [...(prev.mintedBy || []), userAddress],
          }
        : null
    );
    setMinted(true);
  };

  if (!nft) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#555' }}>Loading NFT data...</p>
      </div>
    );
  }

  const alreadyMinted = (nft.mintedBy || []).includes(userAddress);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>{nft.name}</h2>
      <img
        src={nft.image}
        alt={nft.name}
        style={{ width: '300px', borderRadius: '10px', marginBottom: '1rem' }}
      />
      <p style={{ fontSize: '16px', marginBottom: '0.5rem' }}>{nft.description}</p>
      <p style={{ fontWeight: 'bold' }}>Minted: {nft.mintCount}</p>
      {alreadyMinted ? (
        <p style={{ color: 'orange', fontWeight: 'bold', marginTop: '1rem' }}>
          You’ve already minted this NFT.
        </p>
      ) : !minted ? (
        <button
          onClick={handleMint}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '1rem',
          }}
        >
          Mint this NFT
        </button>
      ) : (
        <p style={{ color: 'green', fontWeight: 'bold', marginTop: '1rem' }}>
          Successfully minted!
        </p>
      )}
    </div>
  );
};

export default Mint;
