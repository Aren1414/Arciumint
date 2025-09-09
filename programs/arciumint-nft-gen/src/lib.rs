use anchor_lang::prelude::*;
use anchor_spl::{
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
    associated_token::AssociatedToken,
    metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3},
};
use mpl_token_metadata::types::{Creator, DataV2};

declare_id!("22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn");

#[program]
pub mod arciumintnftgen {
    use super::*;

    /// Mint normally (payer as creator/update_authority)
    pub fn mint_nft(
        ctx: Context<MintNFT>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        // prevent double-mint for this payer
        require!(
            !ctx.accounts.user_record.has_minted,
            ErrorCode::AlreadyMinted
        );

        // signer seeds for PDA authority
        let bump = ctx.bumps.mint_authority;
        let seeds = &[b"mint_authority", &[bump]];
        let signer = &[&seeds[..]];

        // 1) mint one token to associated token account
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        mint_to(cpi_ctx, 1)?;

        // 2) create metadata via Anchor SPL CPI
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

        let meta_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            accounts,
            signer,
        );

        create_metadata_accounts_v3(meta_ctx, data, true, true, Option::<()>::None)?;

        // 3) mark user_record after successful CPIs
        ctx.accounts.user_record.has_minted = true;

        Ok(())
    }

    /// Mint with MPC authority (uses a different PDA as authority/creator/update_authority)
    pub fn mint_nft_with_mpc(
        ctx: Context<MintNFTWithMPC>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        // prevent double-mint for this payer (same user_record approach could be used; here kept per-MPC flow)
        require!(
            !ctx.accounts.user_record.has_minted,
            ErrorCode::AlreadyMinted
        );

        let bump = ctx.bumps.mpc_authority;
        let seeds = &[b"mpc_authority", &[bump]];
        let signer = &[&seeds[..]];

        // Mint token using MPC PDA authority
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.mpc_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        mint_to(cpi_ctx, 1)?;

        // Create metadata with MPC PDA as verified creator / update authority
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

        let meta_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            accounts,
            signer,
        );

        create_metadata_accounts_v3(meta_ctx, data, true, true, Option::<()>::None)?;

        ctx.accounts.user_record.has_minted = true;

        Ok(())
    }
}

// ----------------- ACCOUNTS & STATE -----------------

/// Shared user record (prevents double mint by the same payer)
#[account]
pub struct UserRecord {
    pub has_minted: bool,
}
impl UserRecord {
    pub const SIZE: usize = 1;
}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    /// payer / signer
    #[account(mut)]
    pub payer: Signer<'info>,

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

    /// User record to prevent double minting
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + UserRecord::SIZE,
        seeds = [b"user_record", payer.key().as_ref()],
        bump
    )]
    pub user_record: Account<'info, UserRecord>,

    /// PDA authority for mint
    #[account(seeds = [b"mint_authority"], bump)]
    /// CHECK: PDA signer
    pub mint_authority: UncheckedAccount<'info>,

    /// Metadata account (Metaplex)
    #[account(mut)]
    /// CHECK: checked by Metaplex CPI
    pub metadata: UncheckedAccount<'info>,

    /// Token Metadata program (Metaplex) - pass mpl token metadata program id
    /// CHECK: verified at runtime by require_keys_eq if you want
    pub token_metadata_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintNFTWithMPC<'info> {
    /// payer / signer
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Mint account (new)
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = mpc_authority
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

    /// User record (shared with normal flow)
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + UserRecord::SIZE,
        seeds = [b"user_record", payer.key().as_ref()],
        bump
    )]
    pub user_record: Account<'info, UserRecord>,

    /// PDA authority for MPC flow
    #[account(seeds = [b"mpc_authority"], bump)]
    /// CHECK: PDA signer
    pub mpc_authority: UncheckedAccount<'info>,

    /// Metadata account (Metaplex)
    #[account(mut)]
    /// CHECK: checked by Metaplex CPI
    pub metadata: UncheckedAccount<'info>,

    /// Token Metadata program (Metaplex) - pass mpl token metadata program id
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
    #[msg("Invalid MPC input data.")]
    InvalidMPCData,
            }
