use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use mpl_token_metadata::instruction::create_metadata_accounts_v3;
use mpl_token_metadata::state::{Creator, DataV2};

use crate::MintNFT;

pub fn create_metadata_for_token<'info>(
    ctx: &Context<MintNFT>,
    name: String,
    symbol: String,
    uri: String,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let creator = Creator {
        address: ctx.accounts.signer.key(),
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

    let ix = create_metadata_accounts_v3(
        ctx.accounts.token_metadata_program.key(),
        ctx.accounts.metadata.key(),
        ctx.accounts.mint.key(),
        ctx.accounts.mint_authority.key(),
        ctx.accounts.signer.key(),
        ctx.accounts.mint_authority.key(),
        data,
        true,
        true,
        None,
        None,
    );

    let account_infos = &[
        ctx.accounts.token_metadata_program.to_account_info(),
        ctx.accounts.metadata.to_account_info(),
        ctx.accounts.mint.to_account_info(),
        ctx.accounts.mint_authority.clone(),
        ctx.accounts.signer.to_account_info(),
    ];

    invoke_signed(&ix, account_infos, signer_seeds)?;

    Ok(())
}
