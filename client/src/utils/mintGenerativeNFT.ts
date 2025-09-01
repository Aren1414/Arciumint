import { ArciumClient } from '@arcium-hq/client';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import idl from '../../idl/arciumintnftgen.json'
import { uploadToStorj } from './uploadToStorj';

const programId = new PublicKey('22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn');
const connection = new Connection('https://api.devnet.solana.com');

type MintResult = { success: true; uri: string } | { success: false; error: string };

export async function mintGenerativeNFT(canvasId: string, userAddress: string): Promise<MintResult> {
  try {
    
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas not found');

    canvas.width = 1080;
    canvas.height = 1080;

    
    const stream = canvas.captureStream(30); 
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);

    recorder.start();
    await new Promise((resolve) => setTimeout(resolve, 4000)); 
    recorder.stop();

    await new Promise((resolve) => {
      recorder.onstop = resolve;
    });

    const videoBlob = new Blob(chunks, { type: 'video/webm' });
    const file = new File([videoBlob], 'nft.mp4', { type: 'video/mp4' });

    
    const uri = await uploadToStorj(file);
    if (!uri || !uri.startsWith('https://')) throw new Error('Failed to upload video to Storj');

    
    const arcium = new ArciumClient();
    await arcium.init();

    let mpcWallet = await arcium.getWallet();
    if (!mpcWallet) {
      mpcWallet = await arcium.createWallet();
    }

    
    const provider = new AnchorProvider(connection, mpcWallet, {
      preflightCommitment: 'processed',
    });
    const program = new Program(idl as any, programId, provider);

    
    const mintKeypair = Keypair.generate();
    const name = 'MPC World';
    const symbol = 'MPC';

    await program.methods
      .mintNft(name, symbol, uri)
      .accounts({
        mint: mintKeypair.publicKey,
        user: new PublicKey(userAddress),
        systemProgram: PublicKey.default,
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
