use anchor_lang::prelude::*;
use anchor_spl::token::{mint_to, Mint, MintTo, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3};
use mpl_token_metadata::types::{Creator, DataV2, CollectionDetails};

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
        let signer_seeds = &[&[b"mint_authority", &[ctx.bumps.mint_authority]]];
        mint_token(&ctx.accounts, signer_seeds)?;
        create_metadata(&ctx.accounts, name, symbol, uri, signer_seeds)?;
        require!(!ctx.accounts.user_record.has_minted, ErrorCode::AlreadyMinted);
        ctx.accounts.user_record.has_minted = true;
        Ok(())
    }

    pub fn mint_nft_with_mpc(
        ctx: Context<MintNFTWithMPC>,
        name: String,
        symbol: String,
        uri: String,
        ciphertext: String,
        public_key: String,
        nonce: String,
    ) -> Result<()> {
        require!(ciphertext.len() > 0, ErrorCode::InvalidMPCData);
        require!(public_key.len() == 64, ErrorCode::InvalidMPCData);
        require!(nonce.len() == 32, ErrorCode::InvalidMPCData);
        let signer_seeds = &[&[b"mint_authority", &[ctx.bumps.mint_authority]]];
        mint_token(&ctx.accounts, signer_seeds)?;
        create_metadata(&ctx.accounts, name, symbol, uri, signer_seeds)?;
        require!(!ctx.accounts.user_record.has_minted, ErrorCode::AlreadyMinted);
        ctx.accounts.user_record.has_minted = true;
        Ok(())
    }
}

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
    #[account(seeds = [b"mint_authority"], bump)]
    /// CHECK: PDA signer
    pub mint_authority: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: created by Metaplex CPI
    pub metadata: UncheckedAccount<'info>,
    /// CHECK: Metaplex program
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
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + UserRecord::SIZE,
        seeds = [b"user_record", payer.key().as_ref()],
        bump
    )]
    pub user_record: Account<'info, UserRecord>,
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
    #[account(seeds = [b"mint_authority"], bump)]
    /// CHECK: PDA signer
    pub mint_authority: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: created by Metaplex CPI
    pub metadata: UncheckedAccount<'info>,
    /// CHECK: Metaplex program
    pub token_metadata_program: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
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

fn mint_token<'info>(
    accounts: &impl MintAccounts<'info>,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let cpi_ctx = CpiContext::new_with_signer(
        accounts.token_program().to_account_info(),
        MintTo {
            mint: accounts.mint().to_account_info(),
            to: accounts.token_account().to_account_info(),
            authority: accounts.mint_authority().to_account_info(),
        },
        signer_seeds,
    );
    mint_to(cpi_ctx, 1)?;
    Ok(())
}

fn create_metadata<'info>(
    accounts: &impl MintAccounts<'info>,
    name: String,
    symbol: String,
    uri: String,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let creator = Creator {
        address: accounts.payer().key(),
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
    let cpi_ctx = CpiContext::new_with_signer(
        accounts.token_metadata_program().to_account_info(),
        CreateMetadataAccountsV3 {
            metadata: accounts.metadata().to_account_info(),
            mint: accounts.mint().to_account_info(),
            mint_authority: accounts.mint_authority().to_account_info(),
            payer: accounts.payer().to_account_info(),
            update_authority: accounts.payer().to_account_info(),
            system_program: accounts.system_program().to_account_info(),
            rent: accounts.rent().to_account_info(),
        },
        signer_seeds,
    );
    create_metadata_accounts_v3(cpi_ctx, data, true, true, None)?;
    Ok(())
}

pub trait MintAccounts<'info> {
    fn payer(&self) -> &Signer<'info>;
    fn user_record(&self) -> &Account<'info, UserRecord>;
    fn mint(&self) -> &Account<'info, Mint>;
    fn token_account(&self) -> &Account<'info, TokenAccount>;
    fn mint_authority(&self) -> &UncheckedAccount<'info>;
    fn metadata(&self) -> &UncheckedAccount<'info>;
    fn token_metadata_program(&self) -> &UncheckedAccount<'info>;
    fn token_program(&self) -> &Program<'info, Token>;
    fn associated_token_program(&self) -> &Program<'info, AssociatedToken>;
    fn system_program(&self) -> &Program<'info, System>;
    fn rent(&self) -> &Sysvar<'info, Rent>;
}

impl<'info> MintAccounts<'info> for MintNFT<'info> {
    fn payer(&self) -> &Signer<'info> { &self.payer }
    fn user_record(&self) -> &Account<'info, UserRecord> { &self.user_record }
    fn mint(&self) -> &Account<'info, Mint> { &self.mint }
    fn token_account(&self) -> &Account<'info, TokenAccount> { &self.token_account }
    fn mint_authority(&self) -> &UncheckedAccount<'info> { &self.mint_authority }
    fn metadata(&self) -> &UncheckedAccount<'info> { &self.metadata }
    fn token_metadata_program(&self) -> &UncheckedAccount<'info> { &self.token_metadata_program }
    fn token_program(&self) -> &Program<'info, Token> { &self.token_program }
    fn associated_token_program(&self) -> &Program<'info, AssociatedToken> { &self.associated_token_program }
    fn system_program(&self) -> &Program<'info, System> { &self.system_program }
    fn rent(&self) -> &Sysvar<'info, Rent> { &self.rent }
}

impl<'info> MintAccounts<'info> for MintNFTWithMPC<'info> {
    fn payer(&self) -> &Signer<'info> { &self.payer }
    fn user_record(&self) -> &Account<'info, UserRecord> { &self.user_record }
    fn mint(&self) -> &Account<'info, Mint> { &self.mint }
    fn token_account(&self) -> &Account<'info, TokenAccount> { &self.token_account }
    fn mint_authority(&self) -> &UncheckedAccount<'info> { &self.mint_authority }
    fn metadata(&self) -> &UncheckedAccount<'info> { &self.metadata }
    fn token_metadata_program(&self) -> &UncheckedAccount<'info> { &self.token_metadata_program }
    fn token_program(&self) -> &Program<'info, Token> { &self.token_program }
    fn associated_token_program(&self) -> &Program<'info, AssociatedToken> { &self.associated_token_program }
    fn system_program(&self) -> &Program<'info, System> { &self.system_program }
    fn rent(&self) -> &Sysvar<'info, Rent> { &self.rent }
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
