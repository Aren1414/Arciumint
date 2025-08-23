use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount, Token, MintTo, mint_to};
use anchor_spl::metadata::create_metadata_accounts_v3;

declare_id!("22aiFCK8g424HHtkhcZfJTrCx34eQMcRHNgsWGyXB8Vn");

#[program]
pub mod arciumintnftgen {
    use super::*;

    pub fn mint_nft(
        ctx: Context<MintNFT>, 
        name: String, 
        symbol: String, 
        uri: String
    ) -> Result<()> {
        let user_record = &mut ctx.accounts.user_record;

        if user_record.has_minted {
            return err!(ErrorCode::AlreadyMinted);
        }

        let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority", &[ctx.bumps.mint_authority]]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
            signer_seeds,
        );
        mint_to(cpi_ctx, 1)?;

        let ix = create_metadata_accounts_v3(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata.key(),
            ctx.accounts.mint.key(),
            ctx.accounts.mint_authority.key(),
            ctx.accounts.signer.key(),
            ctx.accounts.mint_authority.key(),
            name,
            symbol,
            uri,
            None,
            1,
            true,
            false,
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
                ctx.accounts.signer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
            signer_seeds,
        )?;

        user_record.has_minted = true;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + UserRecord::SIZE,
        seeds = [b"user_record", signer.key().as_ref()],
        bump
    )]
    pub user_record: Account<'info, UserRecord>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,

    pub token_metadata_program: UncheckedAccount<'info>,
}

#[account]
pub struct UserRecord {
    pub has_minted: bool,
}

impl UserRecord {
    pub const SIZE: usize = 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("This wallet has already minted an NFT.")]
    AlreadyMinted,
}
