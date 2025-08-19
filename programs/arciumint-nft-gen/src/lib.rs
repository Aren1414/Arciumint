use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount, Token, MintTo, mint_to};

declare_id!("Hx6jdiv9A7LVoa83LYRNXb2SaTGTPdfKQ75hB3hyRuHW");

#[program]
pub mod arciumintnftgen {
    use super::*;

    pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
        let user_record = &mut ctx.accounts.user_record;

        require!(!user_record.has_minted, ErrorCode::AlreadyMinted);

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );

        mint_to(cpi_ctx, 1)?;
        user_record.has_minted = true;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    /// Signer who pays for account creation and owns the NFT
    #[account(mut)]
    pub authority: Signer<'info>,

    /// PDA to track if this user has minted
    #[account(
        init_if_needed,
        seeds = [b"userrecord", authority.key().as_ref()],
        bump,
        payer = authority,
        space = 8 + 1
    )]
    pub user_record: Account<'info, UserRecord>,

    /// Mint account for the NFT
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    /// Token account to receive the minted NFT
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    /// SPL Token program
    pub token_program: Program<'info, Token>,

    /// System program
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
