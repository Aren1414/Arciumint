import { RescueCipher, getMXEPublicKeyWithRetry, x25519 } from '@arcium-hq/client'
import { randomBytes } from 'crypto'
import { Connection, PublicKey } from '@solana/web3.js'

export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const { message } = await request.json()

      
      if (typeof message !== 'string' || !/^\d+$/.test(message)) {
        throw new Error('Invalid message format: must be a numeric string')
      }

      
      const provider = new Connection('https://api.devnet.solana.com')

      
      const programId = new PublicKey('22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn')

      
      const mxePublicKey = await getMXEPublicKeyWithRetry(provider, programId)

      
      const privateKey = x25519.utils.randomPrivateKey()
      const publicKey = x25519.getPublicKey(privateKey)

      
      const nonce = randomBytes(16)
      const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey)
      const cipher = new RescueCipher(sharedSecret)

      const value = BigInt(message)
      const ciphertext = cipher.encrypt([value], nonce)

      
      const encodedPublicKey = Buffer.from(publicKey).toString('hex')

      return new Response(JSON.stringify({
        ciphertext,
        publicKey: encodedPublicKey,
        nonce: Buffer.from(nonce).toString('hex') 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    } catch (err: any) {
      return new Response(JSON.stringify({
        error: err.message || 'Unexpected error'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      })
    }
  }
}
