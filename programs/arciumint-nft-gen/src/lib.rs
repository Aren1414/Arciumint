use anchor_lang::prelude::*;
use anchor_spl::token::{self, mint_to, Mint, MintTo, Token, TokenAccount};

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

        // 1) mint 1 token to user's token account (CPI)
        mint_token_to_user(&ctx, signer_seeds)?;

        // 2) create metadata on-chain via Metaplex CPI
        metadata::create_metadata_for_token(&ctx, name, symbol, uri, signer_seeds)?;

        // 3) mark user as minted
        let user_record = &mut ctx.accounts.user_record;
        require!(!user_record.has_minted, ErrorCode::AlreadyMinted);
        user_record.has_minted = true;

        Ok(())
    }
}

// helper function outside #[program] so Anchor doesn't treat it as an instruction
#[inline(never)]
fn mint_token_to_user<'info>(
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

    // mint exactly 1 token (NFT)
    mint_to(cpi_ctx, 1)?;
    Ok(())
}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    /// caller / payer
    #[account(mut)]
    pub payer: Signer<'info>,

    /// user-specific record (tracks if already minted)
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + UserRecord::SIZE,
        seeds = [b"user_record", payer.key().as_ref()],
        bump
    )]
    pub user_record: Account<'info, UserRecord>,

    /// Mint account (must exist and have decimals = 0)
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    /// User's token account (must exist and be associated to `mint`)
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,

    /// PDA used as mint authority
    #[account(seeds = [b"mint_authority"], bump)]
    /// CHECK: PDA signer (no data read)
    pub mint_authority: UncheckedAccount<'info>,

    /// Metadata PDA (Metaplex metadata account for the mint)
    #[account(mut)]
    /// CHECK: to be created/initialized by Metaplex CPI
    pub metadata: UncheckedAccount<'info>,

    /// Metaplex Token Metadata program (pass the program id)
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

#[error_code]
pub enum ErrorCode {
    #[msg("This wallet has already minted an NFT.")]
    AlreadyMinted,

    #[msg("Invalid token program.")]
    InvalidTokenProgram,
}
