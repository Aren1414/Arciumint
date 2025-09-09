use anchor_lang::prelude::*;
use anchor_spl::{
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
    associated_token::AssociatedToken,
};
use mpl_token_metadata::instruction::create_metadata_accounts_v3;
use mpl_token_metadata::types::{Creator, DataV2};

declare_id!("22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn");

#[program]
pub mod arciumintnftgen {
    use super::*;

    pub fn mint_nft(
        ctx: Context<MintNFT>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let bump = ctx.bumps.mint_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority", &[bump]]];

        // Mint token
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

        // Metadata
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

        let ix = create_metadata_accounts_v3(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.mint.key(),
            ctx.accounts.mint_authority.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.payer.key(),
            data,
            true,
            true,
            None,
            None,
            None,
        );

        anchor_lang::solana_program::program::invoke_signed(
            &ix,
            &[
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.mint_authority.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
            signer_seeds,
        )?;

        Ok(())
    }

    pub fn mint_nft_with_mpc(
        ctx: Context<MintNFTWithMPC>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let bump = ctx.bumps.mpc_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"mpc_authority", &[bump]]];

        // Mint token
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

        // Metadata
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

        let ix = create_metadata_accounts_v3(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.mint.key(),
            ctx.accounts.mpc_authority.key(),
            ctx.accounts.payer.key(),
            ctx.accounts.mpc_authority.key(),
            data,
            true,
            true,
            None,
            None,
            None,
        );

        anchor_lang::solana_program::program::invoke_signed(
            &ix,
            &[
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.mpc_authority.to_account_info(),
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
            signer_seeds,
        )?;

        Ok(())
    }
}

// ----------------- CONTEXT STRUCTS -----------------
#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

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
    pub mint_authority: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: checked by Metaplex
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex program
    pub token_metadata_program: UncheckedAccount<'info>,

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
    pub mpc_authority: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: checked by Metaplex
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex program
    pub token_metadata_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
                }
