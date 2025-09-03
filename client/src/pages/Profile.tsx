import React, { useEffect, useState } from 'react';
import './profile.css';
import { Connection, PublicKey } from '@solana/web3.js';

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
        const owner = new PublicKey(userAddress);

        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
        });

        const nftMints = tokenAccounts.value
          .filter(({ account }) => {
            const amount = account.data.parsed.info.tokenAmount;
            return amount.amount === '1' && amount.decimals === 0;
          })
          .map(({ account }) => account.data.parsed.info.mint);

        const detailedNFTs: NFTDisplay[] = await Promise.all(
          nftMints.map(async (mintAddress) => {
            try {
              const metadataUri = await resolveMetadataUri(mintAddress);
              const metadata = await fetch(metadataUri).then(res => res.json());

              return {
                id: mintAddress,
                name: metadata.name || 'Untitled',
                imagePreview: metadata.animation_url || metadata.image || '',
                creator: userAddress,
                price: metadata.price || 0,
                mintCount: 1,
              };
            } catch (err) {
              console.warn(`❌ Failed to fetch metadata for ${mintAddress}:`, err);
              return null;
            }
          })
        );

        setCreatedNFTs(detailedNFTs.filter(Boolean) as NFTDisplay[]);
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


async function resolveMetadataUri(mintAddress: string): Promise<string> {
  const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      new TextEncoder().encode('metadata'),
      METADATA_PROGRAM_ID.toBuffer(),
      new PublicKey(mintAddress).toBuffer()
    ],
    METADATA_PROGRAM_ID
  );

  
  return `https://arweave.net/${metadataPDA.toBase58()}`;
}
