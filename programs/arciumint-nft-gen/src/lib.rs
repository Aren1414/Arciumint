use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;
use mpl_token_metadata::types::{Creator, DataV2, CollectionDetails};
use anchor_spl::metadata::CreateMetadataAccountsV3;
use mpl_token_metadata::ID as TOKEN_METADATA_ID;
use anchor_lang::solana_program::{program::invoke_signed, instruction::AccountMeta, instruction::Instruction};

declare_id!("22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn");

#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + UserRecord::SIZE,
        seeds = [b"user_record", payer.key().as_ref()],
        bump
    )]
    pub user_record: Account<'info, UserRecord>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = mint_authority
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(seeds = [b"mint_authority"], bump)]
    /// CHECK: PDA used as mint authority signer.
    pub mint_authority: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: Metaplex metadata account (checked by CPI)
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex Token Metadata program (verified in code)
    pub token_metadata_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
pub struct UserRecord {
    pub has_minted: bool,
}

impl UserRecord {
    pub const SIZE: usize = 1;
}

#[program]
pub mod arciumintnftgen {
    use super::*;

    pub fn mint_nft(
        ctx: Context<MintNFT>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        // Ensure the provided program is the Metaplex Token Metadata program
        require_keys_eq!(
            ctx.accounts.token_metadata_program.key(),
            TOKEN_METADATA_ID,
            ErrorCode::InvalidTokenProgram
        );

        // Prepare signer seeds for the PDA authority
        let bump = ctx.bumps.mint_authority;
        let authority_seed: &[u8] = b"mint_authority";
        let bump_seed: &[u8] = &[bump];
        let signer_seeds: &[&[u8]] = &[authority_seed, bump_seed];
        let signer: &[&[&[u8]]] = &[signer_seeds];

        // Mint token and create metadata
        mint_token_to_user(&ctx, signer)?;
        create_metadata_for_token(&ctx, name, symbol, uri, signer)?;

        // Mark user as minted
        let user_record = &mut ctx.accounts.user_record;
        require!(!user_record.has_minted, ErrorCode::AlreadyMinted);
        user_record.has_minted = true;

        Ok(())
    }

    pub fn mint_nft_with_mpc(
        ctx: Context<MintNFT>,
        name: String,
        symbol: String,
        uri: String,
        encrypted_bytes: Vec<u8>,
    ) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.token_metadata_program.key(),
            TOKEN_METADATA_ID,
            ErrorCode::InvalidTokenProgram
        );

        require!(encrypted_bytes.len() > 0, ErrorCode::InvalidMPCData);

        let bump = ctx.bumps.mint_authority;
        let authority_seed: &[u8] = b"mint_authority";
        let bump_seed: &[u8] = &[bump];
        let signer_seeds: &[&[u8]] = &[authority_seed, bump_seed];
        let signer: &[&[&[u8]]] = &[signer_seeds];

        mint_token_to_user(&ctx, signer)?;
        create_metadata_for_token(&ctx, name, symbol, uri, signer)?;

        let user_record = &mut ctx.accounts.user_record;
        require!(!user_record.has_minted, ErrorCode::AlreadyMinted);
        user_record.has_minted = true;

        Ok(())
    }
}

fn mint_token_to_user<'info>(ctx: &Context<MintNFT<'info>>, signer: &[&[&[u8]]]) -> Result<()> {
    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.mint_authority.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::mint_to(cpi_ctx, 1)?;
    Ok(())
}

fn create_metadata_for_token<'info>(
    ctx: &Context<MintNFT<'info>>,
    name: String,
    symbol: String,
    uri: String,
    signer: &[&[&[u8]]],
) -> Result<()> {
    // Build DataV2
    let creator = Creator {
        address: ctx.accounts.payer.key(),
        verified: false,
        share: 100,
    };

    let data = DataV2 {
        name,
        symbol,
        uri,
        seller_fee_basis_points: 500,
        creators: Some(vec![creator]),
        collection: None,
        uses: None,
    };

    // Use the anchor_spl CreateMetadataAccountsV3 struct to prepare accounts
    let accounts = CreateMetadataAccountsV3 {
        metadata: ctx.accounts.metadata.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        mint_authority: ctx.accounts.mint_authority.to_account_info(),
        payer: ctx.accounts.payer.to_account_info(),
        update_authority: ctx.accounts.payer.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };

    // Build instruction manually (use mpl_token_metadata instruction arguments)
    // We construct the instruction via the CPI wrapper's expected accounts and then invoke_signed.
    // First build the AccountMetas in the correct order for the token metadata program.
    let metadata_key = ctx.accounts.metadata.key();
    let mint_key = ctx.accounts.mint.key();
    let mint_authority_key = ctx.accounts.mint_authority.key();
    let payer_key = ctx.accounts.payer.key();
    let update_authority_key = ctx.accounts.payer.key();
    let system_program_key = ctx.accounts.system_program.key();
    let rent_key = ctx.accounts.rent.key();
    let token_metadata_program_key = ctx.accounts.token_metadata_program.key();

    let accounts_meta = vec![
        AccountMeta::new(metadata_key, false),
        AccountMeta::new_readonly(mint_key, false),
        AccountMeta::new_readonly(mint_authority_key, true),
        AccountMeta::new_readonly(payer_key, true),
        AccountMeta::new_readonly(update_authority_key, false),
        AccountMeta::new_readonly(system_program_key, false),
        AccountMeta::new_readonly(rent_key, false),
    ];

    // Create the instruction using mpl_token_metadata's create_metadata_accounts_v3
    let ix = mpl_token_metadata::instruction::create_metadata_accounts_v3(
        token_metadata_program_key,
        metadata_key,
        mint_key,
        mint_authority_key,
        payer_key,
        update_authority_key,
        data,
        true, // is_mutable
        true, // update_authority_is_signer
        Some(CollectionDetails::V1 { size: 0 }), // Use None if you don't want collection details; using Some with size 0 is safe placeholder
    );

    // Invoke signed so PDA can sign
    invoke_signed(
        &ix,
        &[
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
        ],
        signer,
    )?;

    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("This wallet has already minted an NFT.")]
    AlreadyMinted,
    #[msg("Invalid token program.")]
    InvalidTokenProgram,
    #[msg("Invalid MPC input data.")]
    InvalidMPCData,
    }
