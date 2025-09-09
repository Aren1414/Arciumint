use anchor_lang::prelude::*;
use anchor_spl::{
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
    associated_token::AssociatedToken,
};
use anchor_spl::metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3};
use mpl_token_metadata::types::{Creator, DataV2, CollectionDetails};

declare_id!("22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn");

// ----------------- PROGRAM -----------------
#[program]
pub mod arciumintnftgen {
    use super::*;

    // --------- NFT Mint (simple payer signer) ---------
    pub fn mint_nft(
        ctx: Context<MintNFT>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let bump = ctx.bumps.mint_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority", &[bump]]];

        // ---- Mint NFT ----
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        mint_to(cpi_ctx, 1)?;

        // ---- Metadata ----
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

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            accounts,
            signer_seeds,
        );

        create_metadata_accounts_v3(
            cpi_ctx,
            data,
            true,
            true,
            Option::<CollectionDetails>::None,
        )?;

        Ok(())
    }

    // --------- NFT Mint with MPC authority ---------
    pub fn mint_nft_with_mpc(
        ctx: Context<MintNFTWithMPC>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let bump = ctx.bumps.mpc_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"mpc_authority", &[bump]]];

        // ---- Mint NFT ----
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.mpc_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        mint_to(cpi_ctx, 1)?;

        // ---- Metadata ----
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

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            accounts,
            signer_seeds,
        );

        create_metadata_accounts_v3(
            cpi_ctx,
            data,
            true,
            true,
            Option::<CollectionDetails>::None,
        )?;

        Ok(())
    }
}

// ----------------- CONTEXTS -----------------
#[derive(Accounts)]
pub struct MintNFT<'info> {
    /// Payer / signer
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Mint account
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = mint_authority
    )]
    pub mint: Account<'info, Mint>,

    /// Associated token account of payer
    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// PDA authority
    #[account(seeds = [b"mint_authority"], bump)]
    /// CHECK: PDA signer only
    pub mint_authority: UncheckedAccount<'info>,

    /// Metadata PDA (Metaplex)
    #[account(mut)]
    /// CHECK: Metaplex CPI will check
    pub metadata: UncheckedAccount<'info>,

    /// Token Metadata program
    /// CHECK: verified at runtime
    pub token_metadata_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintNFTWithMPC<'info> {
    /// Payer / signer
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Mint account
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = mpc_authority
    )]
    pub mint: Account<'info, Mint>,

    /// Associated token account of payer
    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// MPC authority PDA
    #[account(seeds = [b"mpc_authority"], bump)]
    /// CHECK: PDA signer only
    pub mpc_authority: UncheckedAccount<'info>,

    /// Metadata PDA (Metaplex)
    #[account(mut)]
    /// CHECK: Metaplex CPI will check
    pub metadata: UncheckedAccount<'info>,

    /// Token Metadata program
    /// CHECK: verified at runtime
    pub token_metadata_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
            }
