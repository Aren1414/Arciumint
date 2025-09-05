import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import idl from '../../idl/arciumintnftgen.json';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { randomBytes } from 'crypto';

const programId = new PublicKey('22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn');
const connection = new Connection('https://api.devnet.solana.com');

type MintResult = { success: true; uri: string } | { success: false; error: string };

export async function mintGenerativeNFT(): Promise<MintResult> {
  try {
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('❌ Phantom wallet not found');
    }

    await window.solana.connect();
    const payer = window.solana.publicKey;

    const encoder = new TextEncoder();
    const addressBytes = encoder.encode(payer.toBase58());
    const numericMessage = [...addressBytes].reduce((acc, byte) => acc * 256n + BigInt(byte), 0n).toString();

    const response = await fetch('https://arcium-sign-backend.aren-silver12.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: numericMessage }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const { ciphertext, publicKey, nonce } = await response.json();
    if (!ciphertext || !publicKey || !nonce) {
      throw new Error('❌ Invalid response from signing backend');
    }

    const provider = new AnchorProvider(connection, window.solana, { preflightCommitment: 'processed' });
    const program = new Program(idl as any, programId, provider);

    const mintKeypair = Keypair.generate();
    const name = 'MPC World';
    const symbol = 'MPC';
    const uri = 'https://arweave.net/KTpZdjb68t3d-TIIvyBR05_cHzmfFjvqcVHUDk6uKDA';

    const encoder2 = new TextEncoder();

    const [userRecord] = PublicKey.findProgramAddressSync(
      [encoder2.encode('user_record'), payer.toBuffer()],
      programId
    );

    const [mintAuthority] = PublicKey.findProgramAddressSync(
      [encoder2.encode('mint_authority')],
      programId
    );

    const tokenAccount = await getAssociatedTokenAddress(mintKeypair.publicKey, payer);

    const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

    const [metadata] = PublicKey.findProgramAddressSync(
      [encoder2.encode('metadata'), METADATA_PROGRAM_ID.toBuffer(), mintKeypair.publicKey.toBuffer()],
      METADATA_PROGRAM_ID
    );

    
    const computationOffset = new BN(randomBytes(8), 'le');

    await program.methods
      .mintNftWithMpc(name, symbol, uri, ciphertext, publicKey, nonce, computationOffset)
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

    
    await program.methods.awaitComputationFinalization(computationOffset).rpc();

    return { success: true, uri };
  } catch (err: any) {
    console.error('Mint error:', err.message || err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}
