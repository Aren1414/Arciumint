import React, { useEffect, useState } from 'react';
import './profile.css';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

type NFTDisplay = {
  id: string;
  name: string;
  imagePreview: string;
  mintCount?: number;
  price?: number;
  creator: string;
};

type ProfileProps = {
  userAddress: string;
};

const Profile: React.FC<ProfileProps> = ({ userAddress }) => {
  const [createdNFTs, setCreatedNFTs] = useState<NFTDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNFTsFromBlockchain = async () => {
      try {
        const connection = new Connection('https://api.devnet.solana.com');
        const metaplex = new Metaplex(connection);
        const owner = new PublicKey(userAddress);

        const allNFTs = await metaplex.nfts().findAllByOwner({ owner });

        const siteNFTs = allNFTs.filter(nft =>
          nft.programId.toBase58() === '22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn'
        );

        const detailedNFTs: NFTDisplay[] = await Promise.all(
          siteNFTs.map(async (nft) => {
            const metadata = await fetch(nft.uri).then(res => res.json());
            return {
              id: nft.mint.toBase58(),
              name: metadata.name || 'Untitled',
              imagePreview: metadata.animation_url || metadata.image || '',
              creator: userAddress,
              price: metadata.price || 0,
              mintCount: 1,
            };
          })
        );

        setCreatedNFTs(detailedNFTs);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userAddress) fetchNFTsFromBlockchain();
  }, [userAddress]);

  if (loading) return <div className="profile-container">Loading your NFTs...</div>;

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>

      <section>
        <h3>Created NFTs</h3>
        <div className="nft-grid">
          {createdNFTs.length === 0 ? (
            <p>No NFTs created on this site.</p>
          ) : (
            createdNFTs.map(nft => (
              <div key={nft.id} className="nft-card">
                <video
                  src={nft.imagePreview}
                  controls
                  width="100%"
                  style={{ borderRadius: '8px' }}
                />
                <p>{nft.name}</p>
                <span>Minted: {nft.mintCount}</span>
                {nft.price !== undefined && (
                  <span>Price: {nft.price} SOL</span>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Profile;
