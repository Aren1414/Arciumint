import axios from 'axios';

const STORJ_API_URL = 'https://api.storj.dev/upload';
const STORJ_API_KEY = import.meta.env.VITE_STORJ_API_KEY;

export async function uploadToStorj(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log('📤 Uploading to Storj...');
    const response = await axios.post(STORJ_API_URL, formData, {
      headers: {
        Authorization: `Bearer ${STORJ_API_KEY}`,
      },
    });

    if (!response.data?.url) throw new Error('❌ No URL returned from Storj');
    console.log('✅ Upload successful:', response.data.url);
    return response.data.url;
  } catch (err) {
    console.error('❌ Upload to Storj failed:', err);
    throw err;
  }
}
