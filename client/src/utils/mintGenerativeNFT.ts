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

const programId = new PublicKey('22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn');
const connection = new Connection('https://api.devnet.solana.com');

type MintResult = { success: true; uri: string } | { success: false; error: string };

export async function mintGenerativeNFT(userAddress: string): Promise<MintResult> {
  try {
    const uri = "https://arweave.net/KTpZdjb68t3d-TIIvyBR05_cHzmfFjvqcVHUDk6uKDA";

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

    const encoder = new TextEncoder();

    const [userRecord] = PublicKey.findProgramAddressSync(
      [encoder.encode('user_record'), payer.toBuffer()],
      programId
    );

    const [mintAuthority] = PublicKey.findProgramAddressSync(
      [encoder.encode('mint_authority')],
      programId
    );

    const tokenAccount = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      payer
    );

    const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

    const [metadata] = PublicKey.findProgramAddressSync(
      [
        encoder.encode('metadata'),
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
