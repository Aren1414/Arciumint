use anchor_lang::prelude::*;
use anchor_spl::token::{self, mint_to, Mint, MintTo, Token, TokenAccount};

pub mod metadata;
pub mod accounts;

use accounts::*; 

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
}

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

    mint_to(cpi_ctx, 1)?;
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("This wallet has already minted an NFT.")]
    AlreadyMinted,

    #[msg("Invalid token program.")]
    InvalidTokenProgram,
}
