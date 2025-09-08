use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{mint_to, Mint, MintTo, Token, TokenAccount};
use anchor_spl::metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3};
use mpl_token_metadata::types::{CollectionDetails, Creator, DataV2};

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
    /// Payer / signer
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Mint account for the NFT
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = mint_authority
    )]
    pub mint: Account<'info, Mint>,

    /// Associated token account for payer to receive NFT
    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// Per-user record (only one mint per wallet)
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + UserRecord::SIZE,
        seeds = [b"user_record", payer.key().as_ref()],
        bump
    )]
    pub user_record: Account<'info, UserRecord>,

    /// PDA used as mint authority
    #[account(seeds = [b"mint_authority"], bump)]
    /// CHECK: PDA signer
    pub mint_authority: UncheckedAccount<'info>,

    /// Metadata account PDA
    #[account(mut)]
    /// CHECK: checked in Metaplex CPI
    pub metadata: UncheckedAccount<'info>,

    /// Metaplex Token Metadata program
    /// CHECK: verified in runtime
    pub token_metadata_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[program]
pub mod arciumintnftgen {
    use super::*;

    pub fn mint_nft(
        ctx: Context<MintNFT>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        if ctx.accounts.user_record.has_minted {
            return err!(ErrorCode::AlreadyMinted);
        }

        let bump = ctx.bumps.mint_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority", &[bump]]];

        // --- Mint token ---
        mint_token_to_user_accounts(
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            signer_seeds,
        )?;

        // --- Create metadata ---
        create_metadata_for_token_accounts(
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
            name,
            symbol,
            uri,
            signer_seeds,
        )?;

        // --- Update state ---
        let user_record = &mut ctx.accounts.user_record;
        user_record.has_minted = true;

        Ok(())
    }

    pub fn mint_nft_with_mpc(
        ctx: Context<MintNFT>,
        name: String,
        symbol: String,
        uri: String,
        encrypted_bytes: Vec<u8>,
    ) -> Result<()> {
        require!(!encrypted_bytes.is_empty(), ErrorCode::InvalidMPCData);

        if ctx.accounts.user_record.has_minted {
            return err!(ErrorCode::AlreadyMinted);
        }

        let bump = ctx.bumps.mint_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority", &[bump]]];

        mint_token_to_user_accounts(
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            signer_seeds,
        )?;

        create_metadata_for_token_accounts(
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
            name,
            symbol,
            uri,
            signer_seeds,
        )?;

        let user_record = &mut ctx.accounts.user_record;
        user_record.has_minted = true;

        Ok(())
    }
}

/// ---- Helpers ----

fn mint_token_to_user_accounts<'a>(
    mint_ai: AccountInfo<'a>,
    to_ai: AccountInfo<'a>,
    authority_ai: AccountInfo<'a>,
    token_program_ai: AccountInfo<'a>,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let cpi_accounts = MintTo {
        mint: mint_ai.clone(),
        to: to_ai.clone(),
        authority: authority_ai.clone(),
    };
    let cpi_ctx = CpiContext::new_with_signer(token_program_ai, cpi_accounts, signer_seeds);
    mint_to(cpi_ctx, 1)?;
    Ok(())
}

fn create_metadata_for_token_accounts<'a>(
    metadata_ai: AccountInfo<'a>,
    mint_ai: AccountInfo<'a>,
    mint_authority_ai: AccountInfo<'a>,
    payer_ai: AccountInfo<'a>,
    token_metadata_program_ai: AccountInfo<'a>,
    system_program_ai: AccountInfo<'a>,
    rent_ai: AccountInfo<'a>,
    name: String,
    symbol: String,
    uri: String,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let creator = Creator {
        address: payer_ai.key(),
        verified: false,
        share: 100,
    };

    let data = DataV2 {
        name,
        symbol,
        uri,
        seller_fee_basis_points: 500,
        creators: Some(vec![creator]),
        collection: None,
        uses: None,
    };

    let accounts = CreateMetadataAccountsV3 {
        metadata: metadata_ai.clone(),
        mint: mint_ai.clone(),
        mint_authority: mint_authority_ai.clone(),
        payer: payer_ai.clone(),
        update_authority: payer_ai.clone(),
        system_program: system_program_ai.clone(),
        rent: rent_ai.clone(),
    };

    let cpi_ctx = CpiContext::new_with_signer(token_metadata_program_ai, accounts, signer_seeds);

    create_metadata_accounts_v3(
        cpi_ctx,
        data,
        true,  // is_mutable
        true,  // update_authority_is_signer
        Option::<CollectionDetails>::None,
    )?;

    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("This wallet has already minted an NFT.")]
    AlreadyMinted,
    #[msg("Invalid token program.")]
    InvalidTokenProgram,
    #[msg("Invalid MPC input data.")]
    InvalidMPCData,
    }
