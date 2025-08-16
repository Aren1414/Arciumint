use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount, Token, mint_to, MintTo};

declare_id!("FJbJDhJ8cRN2qjMwqQw5UwbqznjXxDxPwQtpzaojLaHi");

#[program]
pub mod arciumint_nft_gen {
    use super::*;

    pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
        let user_record = &mut ctx.accounts.user_record;

        if user_record.has_minted {
            return Err(error!(ErrorCode::AlreadyMinted));
        }

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        mint_to(cpi_ctx, 1)?;

        user_record.has_minted = true;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_program: Program<'info, Token>,

    #[account(
        init_if_needed,
        seeds = [b"user_record", authority.key().as_ref()],
        bump,
        payer = authority,
        space = 8 + 1
    )]
    pub user_record: Account<'info, UserRecord>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserRecord {
    pub has_minted: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("This wallet has already minted an NFT.")]
    AlreadyMinted,
}
