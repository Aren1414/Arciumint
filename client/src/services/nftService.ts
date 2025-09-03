export type NFT = {
  id: string;
  title: string;
  imageUrl: string;
  mintCount: number;
  creatorUsername: string;
};

export const getCreatedNFTs = async (userAddress: string): Promise<NFT[]> => {
  const response = await fetch(`/api/nfts/created?address=${userAddress}`);
  if (!response.ok) throw new Error('Failed to fetch created NFTs');
  return await response.json();
};

export const getCollectedNFTs = async (userAddress: string): Promise<NFT[]> => {
  const response = await fetch(`/api/nfts/collected?address=${userAddress}`);
  if (!response.ok) throw new Error('Failed to fetch collected NFTs');
  return await response.json();
};

export const getNFTById = async (id: string): Promise<NFT> => {
  const response = await fetch(`/api/nft/${id}`);
  if (!response.ok) throw new Error('Failed to fetch NFT');
  return await response.json();
};

export const handleUpload = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log('📤 Uploading file to Storj...');
    const response = await fetch('https://api.storj.dev/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_STORJ_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    console.log('✅ Upload successful:', data.url);
    return data.url;
  } catch (err) {
    console.error('❌ Upload error:', err);
    throw err;
  }
};
