export const getCreatedNFTs = async (userAddress) => {
  const response = await fetch(`/api/nfts/created?address=${userAddress}`);
  if (!response.ok) throw new Error('Failed to fetch created NFTs');
  return await response.json();
};


export const getCollectedNFTs = async (userAddress) => {
  const response = await fetch(`/api/nfts/collected?address=${userAddress}`);
  if (!response.ok) throw new Error('Failed to fetch collected NFTs');
  return await response.json();
};


export const getNFTById = async (id) => {
  const response = await fetch(`/api/nft/${id}`);
  if (!response.ok) throw new Error('Failed to fetch NFT');
  return await response.json();
};


export const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:3001/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Upload failed');
  const data = await response.json();
  return data.url;
};
