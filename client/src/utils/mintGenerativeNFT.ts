import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from '@solana/web3.js';
import {
  AnchorProvider,
  Program,
} from '@coral-xyz/anchor';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import idl from '../../idl/arciumintnftgen.json';
import { uploadToStorj } from './uploadToStorj';
import { Buffer } from 'buffer'; 

const programId = new PublicKey('22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn');
const connection = new Connection('https://api.devnet.solana.com');

type MintResult = { success: true; uri: string } | { success: false; error: string };

export async function mintGenerativeNFT(canvasId: string, userAddress: string): Promise<MintResult> {
  try {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) throw new Error('❌ Canvas element not found');

    canvas.width = 1080;
    canvas.height = 1080;

    if (typeof MediaRecorder === 'undefined' || !canvas.captureStream) {
      throw new Error('❌ This browser does not support video recording. Please use Chrome or Phantom browser.');
    }

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.start();
    await new Promise((resolve) => setTimeout(resolve, 4000));
    recorder.stop();
    await new Promise((resolve) => { recorder.onstop = resolve });

    const videoBlob = new Blob(chunks, { type: 'video/webm' });
    const file = new File([videoBlob], 'nft.mp4', { type: 'video/mp4' });

    const uri = await uploadToStorj(file);
    if (!uri || !uri.startsWith('https://')) throw new Error('❌ Failed to upload video to Storj');

    const res = await fetch('https://arcium-sign-backend.aren-silver12.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userAddress })
    });

    const { ciphertext, publicKey, nonce } = await res.json();
    if (!ciphertext || !publicKey || !nonce) throw new Error('❌ Invalid response from signing backend');

    const payer = new PublicKey(userAddress);
    const dummyWallet = {
      publicKey: payer,
      signTransaction: async (tx: Transaction) => tx,
      signAllTransactions: async (txs: Transaction[]) => txs
    };

    const provider = new AnchorProvider(connection, dummyWallet, {
      preflightCommitment: 'processed',
    });
    const program = new Program(idl as any, programId, provider);

    const mintKeypair = Keypair.generate();
    const name = 'MPC World';
    const symbol = 'MPC';

    const [userRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from('user_record'), payer.toBuffer()],
      programId
    );

    const [mintAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from('mint_authority')],
      programId
    );

    const tokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      payer
    );

    const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

    const [metadata] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer()
      ],
      METADATA_PROGRAM_ID
    );

    await program.methods
      .mintNftWithMpc(name, symbol, uri, ciphertext, publicKey, nonce)
      .accounts({
        payer,
        userRecord,
        mint: mintKeypair.publicKey,
        tokenAccount,
        mintAuthority,
        metadata,
        tokenMetadataProgram: METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY, 
      })
      .signers([mintKeypair])
      .rpc();

    return { success: true, uri };
  } catch (err: any) {
    const logs = err.logs?.join('\n') || '';
    console.error('Mint error:', logs || err.message);
    return { success: false, error: logs || err.message };
  }
}
