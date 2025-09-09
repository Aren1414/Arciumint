use anchor_lang::prelude::*;
use anchor_spl::{
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
    associated_token::AssociatedToken,
    metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3},
};
use mpl_token_metadata::types::{Creator, DataV2, CollectionDetails};
use mpl_token_metadata::ID as TOKEN_METADATA_ID;

declare_id!("22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn");

#[program]
pub mod arciumintnftgen {
    use super::*;

    /// Mint normal: payer is creator & update authority
    pub fn mint_nft(
        ctx: Context<MintNFT>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        // Validate token metadata program if you want
        require_keys_eq!(
            ctx.accounts.token_metadata_program.key(),
            TOKEN_METADATA_ID,
            ErrorCode::InvalidTokenProgram
        );

        // Prevent double-mint for this payer
        require!(!ctx.accounts.user_record.has_minted, ErrorCode::AlreadyMinted);

        // Build PDA signer seeds correctly
        let bump = ctx.bumps.mint_authority;
        let authority_seeds: &[&[u8]] = &[&b"mint_authority"[..], &[bump]];
        let signer_seeds: &[&[&[u8]]] = &[authority_seeds];

        // 1) Mint 1 token to associated token account (CPI to token program)
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        // amount = 1 (for NFT with decimals = 0)
        mint_to(cpi_ctx, 1)?;

        // 2) Create metadata (CPI to token-metadata via anchor-spl wrapper)
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

        let meta_program = ctx.accounts.token_metadata_program.to_account_info();
        let meta_ctx = CpiContext::new_with_signer(meta_program, accounts, signer_seeds);

        create_metadata_accounts_v3(
            meta_ctx,
            data,
            true,
            true,
            Option::<CollectionDetails>::None,
        )?;

        // mark minted
        ctx.accounts.user_record.has_minted = true;

        Ok(())
    }

    /// Mint via MPC PDA authority (MPC PDA is creator & update authority)
    pub fn mint_nft_with_mpc(
        ctx: Context<MintNFTWithMPC>,
        name: String,
        symbol: String,
        uri: String,
        encrypted_bytes: Vec<u8>,
    ) -> Result<()> {
        require!(
            !ctx.accounts.user_record.has_minted,
            ErrorCode::AlreadyMinted
        );
        require!(!encrypted_bytes.is_empty(), ErrorCode::InvalidMPCData);

        // Validate token metadata program
        require_keys_eq!(
            ctx.accounts.token_metadata_program.key(),
            TOKEN_METADATA_ID,
            ErrorCode::InvalidTokenProgram
        );

        let bump = ctx.bumps.mpc_authority;
        let authority_seeds: &[&[u8]] = &[&b"mpc_authority"[..], &[bump]];
        let signer_seeds: &[&[&[u8]]] = &[authority_seeds];

        // Mint using mpc_authority PDA
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.mpc_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        mint_to(cpi_ctx, 1)?;

        // Create metadata with MPC PDA verified creator
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
            metadata: ctx.accounts.metadata.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            mint_authority: ctx.accounts.mpc_authority.to_account_info(),
            payer: ctx.accounts.payer.to_account_info(),
            update_authority: ctx.accounts.mpc_authority.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };

        let meta_program = ctx.accounts.token_metadata_program.to_account_info();
        let meta_ctx = CpiContext::new_with_signer(meta_program, accounts, signer_seeds);

        create_metadata_accounts_v3(
            meta_ctx,
            data,
            true,
            true,
            Option::<CollectionDetails>::None,
        )?;

        ctx.accounts.user_record.has_minted = true;

        Ok(())
    }
}

// ----------------- ACCOUNTS & STATE -----------------

#[account]
pub struct UserRecord {
    pub has_minted: bool,
}
impl UserRecord {
    pub const SIZE: usize = 1;
}

/// Normal mint accounts
#[derive(Accounts)]
pub struct MintNFT<'info> {
    /// payer / signer (must be declared before any `payer = payer` usages)
    #[account(mut)]
    pub payer: Signer<'info>,

    /// user record to prevent double mint; uses payer.key() seed
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + UserRecord::SIZE,
        seeds = [b"user_record", payer.key().as_ref()],
        bump
    )]
    pub user_record: Account<'info, UserRecord>,

    /// Mint account (new)
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = mint_authority
    )]
    pub mint: Account<'info, Mint>,

    /// Associated token account for payer
    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// PDA authority for mint (seed = b"mint_authority")
    #[account(seeds = [b"mint_authority"], bump)]
    /// CHECK: PDA signer only
    pub mint_authority: UncheckedAccount<'info>,

    /// Metaplex metadata account (will be created via CPI)
    #[account(mut)]
    /// CHECK: validated by CPI
    pub metadata: UncheckedAccount<'info>,

    /// Metaplex program (pass token metadata program id)
    /// CHECK: validated at runtime
    pub token_metadata_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

/// MPC flow accounts (separate PDA authority)
#[derive(Accounts)]
pub struct MintNFTWithMPC<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// user record shared with normal flow
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
    /// CHECK: PDA signer only
    pub mpc_authority: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: validated by CPI
    pub metadata: UncheckedAccount<'info>,

    pub token_metadata_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// ----------------- ERRORS -----------------
#[error_code]
pub enum ErrorCode {
    #[msg("This wallet has already minted an NFT.")]
    AlreadyMinted,
    #[msg("Invalid token program.")]
    InvalidTokenProgram,
    #[msg("Invalid MPC input data.")]
    InvalidMPCData,
        }
