use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, mint_to};
pub mod metadata;

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
        require!(
            ctx.accounts.token_program.key() == token::ID,
            ErrorCode::InvalidTokenProgram
        );

        let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority", &[ctx.bumps.mint_authority]]];

        mint_token_to_user(&ctx, signer_seeds)?;
        metadata::create_metadata_for_token(&ctx, name, symbol, uri, signer_seeds)?;

        let user_record = &mut ctx.accounts.user_record;
        require!(!user_record.has_minted, ErrorCode::AlreadyMinted);
        user_record.has_minted = true;

        Ok(())
    }

    #[inline(never)]
    pub fn mint_token_to_user<'info>(
        ctx: &Context<MintNFT>,
        signer_seeds: &[&[&[u8]]],
    ) -> Result<()> {
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
            signer_seeds,
        );
        mint_to(cpi_ctx, 1)
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
    pub user_record: Box<Account<'info, UserRecord>>,

    #[account(mut)]
    pub mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: AccountInfo<'info>,

    /// CHECK: PDA for metadata account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex program id
    pub token_metadata_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
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

    #[msg("Invalid token program.")]
    InvalidTokenProgram,
}
