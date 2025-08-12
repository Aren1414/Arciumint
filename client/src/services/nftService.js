export const getCreatedNFTs = async (userAddress) => {
  const response = await fetch(`/api/nfts/created?address=${userAddress}`)
  if (!response.ok) throw new Error('Failed to fetch created NFTs')
  return await response.json()
}

export const getCollectedNFTs = async (userAddress) => {
  const response = await fetch(`/api/nfts/collected?address=${userAddress}`)
  if (!response.ok) throw new Error('Failed to fetch collected NFTs')
  return await response.json()
}

export const getNFTById = async (id) => {
  const response = await fetch(`/api/nft/${id}`)
  if (!response.ok) throw new Error('Failed to fetch NFT')
  return await response.json()
}
