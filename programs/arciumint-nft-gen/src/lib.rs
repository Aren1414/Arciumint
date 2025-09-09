use anchor_lang::prelude::*;
use anchor_spl::{
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
    associated_token::AssociatedToken,
    metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3},
};
use mpl_token_metadata::types::{Creator, DataV2, CollectionDetails};
use mpl_token_metadata::ID as TOKEN_METADATA_ID;

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
        require_keys_eq!(
            ctx.accounts.token_metadata_program.key(),
            TOKEN_METADATA_ID,
            ErrorCode::InvalidTokenProgram
        );

        require!(!ctx.accounts.user_record.has_minted, ErrorCode::AlreadyMinted);

        let bump = ctx.bumps.mint_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority", &[bump]]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        mint_to(cpi_ctx, 1)?;

        let creator = Creator {
            address: ctx.accounts.payer.key(),
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

        let meta_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                mint_authority: ctx.accounts.mint_authority.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                update_authority: ctx.accounts.payer.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signer_seeds,
        );

        create_metadata_accounts_v3(
            meta_ctx,
            data,
            true,
            true,
            Option::<CollectionDetails>::None,
        )?;

        ctx.accounts.user_record.has_minted = true;
        Ok(())
    }

    pub fn mint_nft_with_mpc(
        ctx: Context<MintNFTWithMPC>,
        name: String,
        symbol: String,
        uri: String,
        encrypted_bytes: Vec<u8>,
    ) -> Result<()> {
        require!(!encrypted_bytes.is_empty(), ErrorCode::InvalidMPCData);
        require!(!ctx.accounts.user_record.has_minted, ErrorCode::AlreadyMinted);

        require_keys_eq!(
            ctx.accounts.token_metadata_program.key(),
            TOKEN_METADATA_ID,
            ErrorCode::InvalidTokenProgram
        );

        let bump = ctx.bumps.mpc_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"mpc_authority", &[bump]]];

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.mpc_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds,
        );
        mint_to(cpi_ctx, 1)?;

        let creator = Creator {
            address: ctx.accounts.mpc_authority.key(),
            verified: true,
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

        let meta_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                mint_authority: ctx.accounts.mpc_authority.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                update_authority: ctx.accounts.mpc_authority.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signer_seeds,
        );

        create_metadata_accounts_v3(
            meta_ctx,
            data,
            true,
            true,
            Option::<CollectionDetails>::None,
        )?;

        ctx.accounts.user_record.has_minted = true;
        Ok(())
    }
}

// ----------------- STATE -----------------

#[account]
pub struct UserRecord {
    pub has_minted: bool,
}
impl UserRecord {
    pub const SIZE: usize = 1;
}

// ----------------- ACCOUNTS -----------------

#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(seeds = [b"mint_authority"], bump)]
    /// CHECK: PDA signer only
    pub mint_authority: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + UserRecord::SIZE,
        seeds = [b"user_record", payer.key().as_ref()],
        bump
    )]
    pub user_record: Box<Account<'info, UserRecord>>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = mint_authority
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    /// CHECK: Metaplex metadata account created via CPI
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex token metadata program
    pub token_metadata_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintNFTWithMPC<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(seeds = [b"mpc_authority"], bump)]
    /// CHECK: PDA signer only
    pub mpc_authority: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + UserRecord::SIZE,
        seeds = [b"user_record", payer.key().as_ref()],
        bump
    )]
    pub user_record: Box<Account<'info, UserRecord>>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = mpc_authority
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    /// CHECK: Metaplex metadata account created via CPI
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex token metadata program
    pub token_metadata_program: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// ----------------- ERRORS -----------------

#[error_code]
pub enum ErrorCode {
    #[msg("This wallet has already minted an NFT.")]
    AlreadyMinted,
    #[msg("Invalid token program.")]
    InvalidTokenProgram,
    #[msg("Invalid MPC input data.")]
    InvalidMPCData,
            }
