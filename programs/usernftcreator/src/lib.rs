use anchor_lang::prelude::*;

declare_id!("BajbA5RqB7CnhsbNKtpS6oQr8wNwXYBZxg4AK4jRrD9i");

#[program]
pub mod usernftcreator {
    use super::*;

    pub fn create_nft(
        ctx: Context<CreateNft>,
        image_url: String,
        description: String,
        price: u64,
        max_supply: u32,
        created_at: i64,
    ) -> Result<()> {
        let nft = &mut ctx.accounts.creator_nft;
        let stats = &mut ctx.accounts.creator_stats;

        if created_at - stats.last_reset > 86400 {
            stats.count = 0;
            stats.last_reset = created_at;
        }

        require!(stats.count < 2, CustomError::DailyLimitReached);
        stats.count += 1;

        nft.creator = ctx.accounts.creator.key();
        nft.image_url = image_url;
        nft.description = description;
        nft.price = price;
        nft.max_supply = max_supply;
        nft.minted = 0;
        nft.created_at = created_at;

        Ok(())
    }

    pub fn mint_nft(ctx: Context<MintNft>) -> Result<()> {
        let nft = &mut ctx.accounts.creator_nft;

        require!(nft.minted < nft.max_supply, CustomError::SoldOut);
        require!(ctx.accounts.buyer.lamports() >= nft.price, CustomError::InsufficientFunds);

        **ctx.accounts.buyer.try_borrow_mut_lamports()? -= nft.price;
        **ctx.accounts.creator.try_borrow_mut_lamports()? += nft.price;

        nft.minted += 1;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(created_at: i64)]
pub struct CreateNft<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 512,
        seeds = [b"nft", creator.key().as_ref(), &created_at.to_le_bytes()],
        bump
    )]
    pub creator_nft: Account<'info, CreatorNft>,

    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init_if_needed,
        payer = creator,
        space = 8 + 16,
        seeds = [b"stats", creator.key().as_ref()],
        bump
    )]
    pub creator_stats: Account<'info, CreatorStats>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintNft<'info> {
    #[account(mut)]
    pub creator_nft: Account<'info, CreatorNft>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub creator: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct CreatorNft {
    pub creator: Pubkey,
    pub image_url: String,
    pub description: String,
    pub price: u64,
    pub max_supply: u32,
    pub minted: u32,
    pub created_at: i64,
}

#[account]
pub struct CreatorStats {
    pub count: u8,
    pub last_reset: i64,
}

#[error_code]
pub enum CustomError {
    #[msg("You have reached your daily limit.")]
    DailyLimitReached,
    #[msg("Max supply reached.")]
    SoldOut,
    #[msg("Insufficient funds.")]
    InsufficientFunds,
}
