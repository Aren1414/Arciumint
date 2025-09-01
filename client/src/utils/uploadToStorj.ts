import axios from 'axios';

const STORJ_API_URL = 'https://api.storj.dev/upload';
const STORJ_API_KEY = import.meta.env.VITE_STORJ_API_KEY;

export async function uploadToStorj(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(STORJ_API_URL, formData, {
    headers: {
      Authorization: `Bearer ${STORJ_API_KEY}`,
    },
  });

  return response.data.url;
}
