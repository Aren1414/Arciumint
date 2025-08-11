import React, { useState } from 'react'
import './upload.css'

const Upload = () => {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mintCount, setMintCount] = useState(1)
  const [price, setPrice] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!file) return
    if (!allowedTypes.includes(file.type)) {
      alert('Only PNG, JPG, JPEG, and WEBP formats are allowed.')
      return
    }
    if (file.size > maxSize) {
      alert('File size must be under 5MB.')
      return
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!image || !name || !mintCount || !price) {
      alert('Please fill in all required fields.')
      return
    }

    // connect Arcium 
    console.log({
      image,
      name,
      description,
      mintCount,
      price
    })
  }

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
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" />

        <label>Mint Count *</label>
        <input type="number" min="1" value={mintCount} onChange={(e) => setMintCount(e.target.value)} required />

        <label>Price (in SOL) *</label>
        <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />

        <button type="submit">Convert to NFT</button>
      </form>
    </div>
  )
}

export default Upload
