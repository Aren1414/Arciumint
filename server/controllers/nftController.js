const getAllNFTs = (req, res) => {
  const sampleNFTs = [
    { id: 1, name: 'CryptoCat', price: 2.5 },
    { id: 2, name: 'PixelDragon', price: 4.2 },
  ];
  res.json(sampleNFTs);
};

const createNFT = (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const newNFT = { id: Date.now(), name, price };
  res.status(201).json(newNFT);
};

module.exports = { getAllNFTs, createNFT };
