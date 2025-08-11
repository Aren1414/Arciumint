import React, { useEffect, useState } from 'react'
import './profile.css'
import { getCreatedNFTs, getCollectedNFTs } from '../services/nftService'

const Profile = ({ userAddress }) => {
  const [createdNFTs, setCreatedNFTs] = useState([])
  const [collectedNFTs, setCollectedNFTs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const created = await getCreatedNFTs(userAddress)
        const collected = await getCollectedNFTs(userAddress)
        setCreatedNFTs(created)
        setCollectedNFTs(collected)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    if (userAddress) fetchData()
  }, [userAddress])

  if (loading) return <div className="profile-container">Loading...</div>

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
                <p>{nft.name}</p>
                <span>Minted: {nft.mintedCount}</span>
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
                <p>{nft.name}</p>
                <span>Creator: {nft.creator}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default Profile
