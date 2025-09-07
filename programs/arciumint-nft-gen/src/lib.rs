use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3};
use mpl_token_metadata::types::{Creator, DataV2, CollectionDetails};
use mpl_token_metadata::ID as TOKEN_METADATA_ID;

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
        mint::authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer,
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(seeds = [b"mint_authority"], bump)]
    pub mint_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    pub token_metadata_program: UncheckedAccount<'info>,

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
        require_keys_eq!(
            ctx.accounts.token_metadata_program.key(),
            TOKEN_METADATA_ID,
            ErrorCode::InvalidTokenProgram
        );

        let bump = ctx.bumps.mint_authority;
        let authority_seeds: &[&[u8]] = &[b"mint_authority", &[bump]];
        let signer_seeds: &[&[&[u8]]] = &[authority_seeds];

        mint_token_to_user(&ctx, signer_seeds)?;
        create_metadata_for_token(&ctx, name, symbol, uri, signer_seeds)?;

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

        require!(!encrypted_bytes.is_empty(), ErrorCode::InvalidMPCData);

        let bump = ctx.bumps.mint_authority;
        let authority_seeds: &[&[u8]] = &[b"mint_authority", &[bump]];
        let signer_seeds: &[&[&[u8]]] = &[authority_seeds];

        mint_token_to_user(&ctx, signer_seeds)?;
        create_metadata_for_token(&ctx, name, symbol, uri, signer_seeds)?;

        let user_record = &mut ctx.accounts.user_record;
        require!(!user_record.has_minted, ErrorCode::AlreadyMinted);
        user_record.has_minted = true;

        Ok(())
    }
}

fn mint_token_to_user<'info>(
    ctx: &Context<MintNFT<'info>>,
    signer: &[&[&[u8]]],
) -> Result<()> {
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
        metadata: ctx.accounts.metadata.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        mint_authority: ctx.accounts.mint_authority.to_account_info(),
        payer: ctx.accounts.payer.to_account_info(),
        update_authority: ctx.accounts.payer.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };

    let program = ctx.accounts.token_metadata_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(program, accounts, signer);

    create_metadata_accounts_v3(
        cpi_ctx,
        data,
        true,
        true,
        Option::<CollectionDetails>::None,
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
