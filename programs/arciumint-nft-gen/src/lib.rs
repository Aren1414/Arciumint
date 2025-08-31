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

        // signer seeds for PDA (mint_authority)
        let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority", &[ctx.bumps.mint_authority]]];

        // mint 1 token to user (CPI)
        mint_token_to_user(&ctx, signer_seeds)?;

        // create metadata for NFT (CPI)
        metadata::create_metadata_for_token(&ctx, name, symbol, uri, signer_seeds)?;

        // mark user as minted
        let user_record = &mut ctx.accounts.user_record;
        require!(!user_record.has_minted, ErrorCode::AlreadyMinted);
        user_record.has_minted = true;

        Ok(())
    }
}

// NOTE: helper kept outside #[program] so Anchor doesn't treat it as an instruction
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
    /// payer / caller
    #[account(mut)]
    pub signer: Signer<'info>,

    /// record to prevent double mint
    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + UserRecord::SIZE,
        seeds = [b"user_record", signer.key().as_ref()],
        bump
    )]
    pub user_record: Box<Account<'info, UserRecord>>,

    /// Mint account (must exist)
    #[account(mut)]
    pub mint: Box<Account<'info, Mint>>,

    /// User token account (must exist)
    #[account(mut)]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// PDA used as mint authority
    #[account(seeds = [b"mint_authority"], bump)]
    /// CHECK: PDA signer (no data read)
    pub mint_authority: UncheckedAccount<'info>,

    /// Metadata PDA (to be created by Metaplex CPI)
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// Metaplex Token Metadata program (pass the program id)
    /// We use Program<AccountInfo> above, but using UncheckedAccount is fine too.
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
