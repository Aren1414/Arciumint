use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount, Token, MintTo, mint_to};
use anchor_lang::solana_program::pubkey::Pubkey;
use spl_token;
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

        metadata::create_metadata(
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.signer.to_account_info(),
            name,
            symbol,
            uri,
            signer_seeds,
        )?;

        let user_record = &mut ctx.accounts.user_record;
        require!(!user_record.has_minted, ErrorCode::AlreadyMinted);
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

    #[account(mut)]
    pub metadata: AccountInfo<'info>,

    /// CHECK: Metaplex program id
    pub token_metadata_program: AccountInfo<'info>,

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
}
