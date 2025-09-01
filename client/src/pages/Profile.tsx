import React, { useEffect, useState } from 'react';
import './profile.css';

type NFT = {
  id: string;
  name: string;
  imagePreview: string;
  mintCount: number;
  price: number;
  creator: string;
};

type ProfileProps = {
  userAddress: string;
};

const Profile: React.FC<ProfileProps> = ({ userAddress }) => {
  const [createdNFTs, setCreatedNFTs] = useState<NFT[]>([]);
  const [collectedNFTs, setCollectedNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      const allNFTs: NFT[] = JSON.parse(localStorage.getItem('nfts') || '[]');
      const created = allNFTs.filter(nft => nft.creator === userAddress);
      const collected: NFT[] = []; // Placeholder for future logic

      setCreatedNFTs(created);
      setCollectedNFTs(collected);
      setLoading(false);
    };

    if (userAddress) fetchData();
  }, [userAddress]);

  if (loading) return <div className="profile-container">Loading...</div>;

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>

      <section>
        <h3>Created NFTs</h3>
        <div className="nft-grid">
          {createdNFTs.length === 0 ? (
            <p>No NFTs created.</p>
          ) : (
            createdNFTs.map(nft => (
              <div key={nft.id} className="nft-card">
                <img src={nft.imagePreview} alt={nft.name} />
                <p>{nft.name}</p>
                <span>Minted: {nft.mintCount}</span>
                <span>Price: {nft.price} SOL</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h3>Collected NFTs</h3>
        <div className="nft-grid">
          {collectedNFTs.length === 0 ? (
            <p>No NFTs collected.</p>
          ) : (
            collectedNFTs.map(nft => (
              <div key={nft.id} className="nft-card">
                <img src={nft.imagePreview} alt={nft.name} />
                <p>{nft.name}</p>
                <span>Creator: {nft.creator}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Profile;
