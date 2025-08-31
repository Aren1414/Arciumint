use anchor_lang::prelude::*;
use anchor_spl::token::{self, mint_to, Mint, MintTo, Token, TokenAccount};
use anchor_spl::metadata::Metadata;

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

        // PDA signer seeds for mint authority
        let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority", &[ctx.bumps.mint_authority]]];

        // 1) mint exactly 1 token to user's token account
        mint_token_to_user(&ctx, signer_seeds)?;

        // 2) create metadata via Metaplex CPI
        metadata::create_metadata_for_token(&ctx, name, symbol, uri, signer_seeds)?;

        // 3) mark user as minted (one-time mint)
        let user_record = &mut ctx.accounts.user_record;
        require!(!user_record.has_minted, ErrorCode::AlreadyMinted);
        user_record.has_minted = true;

        Ok(())
    }
}

// helper kept OUTSIDE #[program] so Anchor doesn't treat it as an instruction
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
    // mint 1 token (NFT)
    mint_to(cpi_ctx, 1)
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

    /// Mint account (already created with decimals=0 and mint_authority = PDA)
    #[account(mut)]
    pub mint: Box<Account<'info, Mint>>,

    /// User's associated token account for the above mint
    #[account(mut)]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// PDA used as mint authority
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    /// CHECK: PDA signer (derivation checked by seeds; used only as signer/authority)
    pub mint_authority: UncheckedAccount<'info>,

    /// Metadata PDA (Metaplex metadata account for the mint)
    /// CHECK: PDA address verified off-chain; Metaplex CPI will initialize it
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// Metaplex Token Metadata program
    pub token_metadata_program: Program<'info, Metadata>,

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
