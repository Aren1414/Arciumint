import { RescueCipher, getMXEPublicKey, x25519 } from '@arcium-hq/client';
import { randomBytes } from 'crypto';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

export default {
  async fetch(request: Request): Promise<Response> {
    // ✅ Handle preflight CORS request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    try {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
          headers: corsHeaders,
          status: 405
        });
      }

      const { message } = await request.json();

      if (typeof message !== 'string' || !/^\d+$/.test(message)) {
        return new Response(JSON.stringify({ error: 'Invalid message format: must be a numeric string' }), {
          headers: corsHeaders,
          status: 400
        });
      }

      const connection = new Connection('https://api.devnet.solana.com');
      const dummyWallet = {
        publicKey: PublicKey.default,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs
      };
      const provider = new AnchorProvider(connection, dummyWallet, {});
      const programId = new PublicKey('22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn');

      const mxePublicKey = await getMXEPublicKey(provider, programId);

      const privateKey = x25519.utils.randomPrivateKey();
      const publicKey = x25519.getPublicKey(privateKey);

      const nonce = randomBytes(16);
      const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);
      const cipher = new RescueCipher(sharedSecret);

      const value = BigInt(message);
      const ciphertext = cipher.encrypt([value], nonce);

      return new Response(JSON.stringify({
        ciphertext,
        publicKey: Buffer.from(publicKey).toString('hex'),
        nonce: Buffer.from(nonce).toString('hex')
      }), {
        headers: corsHeaders,
        status: 200
      });
    } catch (err: any) {
      return new Response(JSON.stringify({
        error: err.message || 'Unexpected error'
      }), {
        headers: corsHeaders,
        status: 500
      });
    }
  }
};
