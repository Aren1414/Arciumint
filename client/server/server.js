import express from 'express';
import multer from 'multer';
import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const STORJ_API_URL = 'https://api.storj.dev/upload';
const STORJ_API_KEY = process.env.STORJ_API_KEY;

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    const response = await axios.post(STORJ_API_URL, formData, {
      headers: {
        Authorization: `Bearer ${STORJ_API_KEY}`,
        ...formData.getHeaders(),
      },
    });

    res.json({ url: response.data.url });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
