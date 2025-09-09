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

    // --- ساده: مینت NFT ---
    pub fn mint_nft(
        ctx: Context<MintNFT>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        mint_core(ctx, name, symbol, uri, None)
    }

    
    pub fn mint_nft_with_mpc(
        ctx: Context<MintNFT>,
        name: String,
        symbol: String,
        uri: String,
        mpc_data: String,   
    ) -> Result<()> {
        mint_core(ctx, name, symbol, uri, Some(mpc_data))
    }
}

// ----------------- CORE FUNCTION -----------------
fn mint_core(
    ctx: Context<MintNFT>,
    name: String,
    symbol: String,
    uri: String,
    mpc_data: Option<String>,
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

    
    let extended_uri = if let Some(extra) = mpc_data {
        format!("{}?mpc={}", uri, extra)   
    } else {
        uri
    };

    let data = DataV2 {
        name,
        symbol,
        uri: extended_uri,
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

// ----------------- CONTEXT -----------------
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
