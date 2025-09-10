use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::token::{mint_to, Mint, MintTo, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3};
use mpl_token_metadata::types::{Creator, DataV2, CollectionDetails};

declare_id!("22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn");

#[account]
pub struct UserRecord {
    pub has_minted: bool,
}
impl UserRecord {
    pub const SIZE: usize = 1;
}

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
    /// CHECK: PDA signer
    pub mint_authority: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: created by Metaplex CPI
    pub metadata: AccountInfo<'info>,
    /// CHECK: Metaplex program
    pub token_metadata_program: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintNFTWithMPC<'info> {
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
        mint::authority = mpc_authority
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub token_account: Account<'info, TokenAccount>,
    #[account(seeds = [b"mpc_authority"], bump)]
    /// CHECK: PDA signer
    pub mpc_authority: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: created by Metaplex CPI
    pub metadata: AccountInfo<'info>,
    /// CHECK: Metaplex program
    pub token_metadata_program: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
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
        require!(!ctx.accounts.user_record.has_minted, ErrorCode::AlreadyMinted);
        let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority", &[ctx.bumps.mint_authority]]];
        mint_token_to_user(&ctx, signer_seeds)?;
        create_metadata_for_token(&ctx, name, symbol, uri, signer_seeds)?;
        ctx.accounts.user_record.has_minted = true;
        Ok(())
    }

    pub fn mint_nft_with_mpc(
        ctx: Context<MintNFTWithMPC>,
        name: String,
        symbol: String,
        uri: String,
        encrypted_bytes: Vec<u8>,
    ) -> Result<()> {
        require!(encrypted_bytes.len() > 0, ErrorCode::InvalidMPCData);
        require!(!ctx.accounts.user_record.has_minted, ErrorCode::AlreadyMinted);
        let signer_seeds: &[&[&[u8]]] = &[&[b"mpc_authority", &[ctx.bumps.mpc_authority]]];
        mint_token_to_user_mpc(&ctx, signer_seeds)?;
        create_metadata_for_token_mpc(&ctx, name, symbol, uri, signer_seeds)?;
        ctx.accounts.user_record.has_minted = true;
        Ok(())
    }
}

fn mint_token_to_user<'info>(
    ctx: &Context<MintNFT>,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.clone(),
        },
        signer_seeds,
    );
    mint_to(cpi_ctx, 1)?;
    Ok(())
}

fn mint_token_to_user_mpc<'info>(
    ctx: &Context<MintNFTWithMPC>,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.mpc_authority.clone(),
        },
        signer_seeds,
    );
    mint_to(cpi_ctx, 1)?;
    Ok(())
}

fn create_metadata_for_token<'info>(
    ctx: &Context<MintNFT>,
    name: String,
    symbol: String,
    uri: String,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
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
    let accounts = CreateMetadataAccountsV3 {
        metadata: ctx.accounts.metadata.clone(),
        mint: ctx.accounts.mint.to_account_info(),
        mint_authority: ctx.accounts.mint_authority.clone(),
        payer: ctx.accounts.payer.to_account_info(),
        update_authority: ctx.accounts.payer.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };
    let program = ctx.accounts.token_metadata_program.clone();
    let cpi_ctx = CpiContext::new_with_signer(program, accounts, signer_seeds);
    create_metadata_accounts_v3(cpi_ctx, data, true, true, Option::<CollectionDetails>::None)?;
    Ok(())
}

fn create_metadata_for_token_mpc<'info>(
    ctx: &Context<MintNFTWithMPC>,
    name: String,
    symbol: String,
    uri: String,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let creator = Creator {
        address: ctx.accounts.mpc_authority.key(),
        verified: true,
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
    let accounts = CreateMetadataAccountsV3 {
        metadata: ctx.accounts.metadata.clone(),
        mint: ctx.accounts.mint.to_account_info(),
        mint_authority: ctx.accounts.mpc_authority.clone(),
        payer: ctx.accounts.payer.to_account_info(),
        update_authority: ctx.accounts.mpc_authority.clone(),
        system_program: ctx.accounts.system_program.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };
    let program = ctx.accounts.token_metadata_program.clone();
    let cpi_ctx = CpiContext::new_with_signer(program, accounts, signer_seeds);
    create_metadata_accounts_v3(cpi_ctx, data, true, true, Option::<CollectionDetails>::None)?;
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
