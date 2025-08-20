use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount, Token, MintTo, mint_to};

declare_id!("Hx6jdiv9A7LVoa83LYRNXb2SaTGTPdKfQ75hB3hyRuHW");

#[program]
pub mod arciumintnftgen {
    use super::*;

    pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
        let user_record = &mut ctx.accounts.user_record;
        require!(!user_record.has_minted, ErrorCode::AlreadyMinted);

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
        user_record.has_minted = true;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"userrecord", signer.key().as_ref()],
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

    pub token_program: Program<'info, Token>,
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

#[error_code]
pub enum ErrorCode {
    #[msg("This wallet has already minted an NFT.")]
    AlreadyMinted,
}
