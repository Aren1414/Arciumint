use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + UserRecord::SIZE,
        seeds = [b"user_record", payer.key().as_ref()],
        bump
    )]
    pub user_record: Account<'info, UserRecord>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    #[account(seeds = [b"mint_authority"], bump)]
    /// CHECK: PDA signer (no data read)
    pub mint_authority: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: to be created/initialized by Metaplex CPI
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: treated as program id in CPI
    pub token_metadata_program: UncheckedAccount<'info>,

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
