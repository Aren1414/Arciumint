import { RescueCipher, getMXEPublicKey, x25519, getArciumEnv } from '@arcium-hq/client';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

function randomNonce(length = 16) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { headers: corsHeaders, status: 405 });
      }

      const body = await request.json();
      const { message } = body;

      if (typeof message !== 'string' || !/^\d+$/.test(message)) {
        return new Response(JSON.stringify({ error: 'Invalid message format' }), { headers: corsHeaders, status: 400 });
      }

      const value = BigInt(message);
      const connection = new Connection(getArciumEnv().rpcUrl);

      const dummyWallet = {
        publicKey: PublicKey.default,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs,
      };

      const provider = new AnchorProvider(connection, dummyWallet, {});
      const programId = new PublicKey('22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn');

      
      const mxePublicKey = await getMXEPublicKey(provider, programId);
      if (!mxePublicKey) {
        throw new Error('MXE public key not set');
      }

      const privateKey = x25519.utils.randomPrivateKey();
      const publicKey = x25519.getPublicKey(privateKey);

      const nonce = randomNonce();
      const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);
      const cipher = new RescueCipher(sharedSecret);

      const ciphertext = cipher.encrypt([value], nonce);

      return new Response(JSON.stringify({
        ciphertext,
        publicKey: Buffer.from(publicKey).toString('hex'),
        nonce: Buffer.from(nonce).toString('hex'),
      }), { headers: corsHeaders, status: 200 });
    } catch (err: any) {
      console.error('Worker error:', err.message || err);
      return new Response(JSON.stringify({ error: err.message || 'Unexpected error' }), { headers: corsHeaders, status: 500 });
    }
  }
};
