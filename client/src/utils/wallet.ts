export async function connectPhantom(): Promise<string | null> {
  if (typeof window === 'undefined' || !window.solana || !window.solana.isPhantom) {
    alert('❌ Phantom wallet not detected. Please install Phantom or open this site inside the Phantom app.');
    return null;
  }

  try {
    const response = await window.solana.connect();
    return response.publicKey.toBase58();
  } catch (err) {
    console.error('❌ Wallet connection failed:', err);
    return null;
  }
}
