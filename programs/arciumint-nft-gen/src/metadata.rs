use anchor_lang::prelude::*;
use anchor_spl::metadata::{
    create_metadata_accounts_v3, mpl_token_metadata::types::{Creator, DataV2, CollectionDetails},
    CreateMetadataAccountsV3, Metadata,
};

use crate::MintNFT;

pub fn create_metadata_for_token<'info>(
    ctx: &Context<MintNFT>,
    name: String,
    symbol: String,
    uri: String,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    // single creator = user (signer)
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

    // CPI accounts for Metaplex create_metadata_accounts_v3
    let accounts = CreateMetadataAccountsV3 {
        metadata: ctx.accounts.metadata.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        mint_authority: ctx.accounts.mint_authority.to_account_info(),
        payer: ctx.accounts.signer.to_account_info(),
        update_authority: ctx.accounts.signer.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
    };

    let program: AccountInfo<'info> = ctx.accounts.token_metadata_program.to_account_info();

    // Per mpl-token-metadata v5.x via anchor_spl::metadata the signature expects 5 args:
    // (ctx, data, is_mutable, update_authority_is_signer, collection_details)
    let cpi_ctx = CpiContext::new_with_signer(program, accounts, signer_seeds);
    create_metadata_accounts_v3(
        cpi_ctx,
        data,
        true,                  // is_mutable
        true,                  // update_authority_is_signer
        Option::<CollectionDetails>::None, // no collection details
    )?;

    Ok(())
}
