use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke_signed, account_info::AccountInfo};
use mpl_token_metadata::instruction::create_metadata_accounts_v3;
use mpl_token_metadata::state::{Creator, DataV2};

#[inline(never)]
pub fn create_metadata_for_token<'info>(
    ctx: &Context<impl MetadataAccounts<'info>>,
    name: String,
    symbol: String,
    uri: String,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let creator = Box::new(Creator {
        address: ctx.accounts().signer.key(),
        verified: true,
        share: 100,
    });

    let data = Box::new(DataV2 {
        name,
        symbol,
        uri,
        seller_fee_basis_points: 500,
        creators: Some(vec![*creator]),
        collection: None,
        uses: None,
    });

    let ix = create_metadata_accounts_v3(
        ctx.accounts().token_metadata_program.key(),
        ctx.accounts().metadata.key(),
        ctx.accounts().mint.key(),
        ctx.accounts().mint_authority.key(),
        ctx.accounts().signer.key(),
        ctx.accounts().mint_authority.key(),
        *data,
        true,
        true,
        None,
        None,
    );

    invoke_signed(
        &ix,
        &[
            ctx.accounts().token_metadata_program.clone(),
            ctx.accounts().metadata.clone(),
            ctx.accounts().mint.clone(),
            ctx.accounts().mint_authority.clone(),
            ctx.accounts().signer.clone(),
        ],
        signer_seeds,
    )?;

    Ok(())
}

pub trait MetadataAccounts<'info> {
    fn accounts(&self) -> MetadataContext<'info>;
}

pub struct MetadataContext<'info> {
    pub token_metadata_program: AccountInfo<'info>,
    pub metadata: AccountInfo<'info>,
    pub mint: AccountInfo<'info>,
    pub mint_authority: AccountInfo<'info>,
    pub signer: AccountInfo<'info>,
}
