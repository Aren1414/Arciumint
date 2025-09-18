use anchor_lang::prelude::*;
use anchor_spl::token::{self, mint_to, Mint, MintTo, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

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
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        mint::decimals = 0,
        mint::authority = signer,
        mint::freeze_authority = signer
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + UserRecord::SIZE,
        seeds = [b"user_record", signer.key().as_ref()],
        bump
    )]
    pub user_record: Account<'info, UserRecord>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[program]
pub mod arciumintnftgen {
    use super::*;

    pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
        require!(!ctx.accounts.user_record.has_minted, ErrorCode::AlreadyMinted);

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        mint_to(cpi_ctx, 1)?;

        ctx.accounts.user_record.has_minted = true;
        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("This wallet has already minted an NFT.")]
    AlreadyMinted,
}
