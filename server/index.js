const express = require('express');
const cors = require('cors');
const nftRoutes = require('./routes/nftRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/nfts', nftRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
