use anchor_lang::prelude::*;
use anchor_spl::metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3};
use mpl_token_metadata::types::{Creator, DataV2, CollectionDetails};

use crate::MintNFT;

pub fn create_metadata_for_token<'info>(
    ctx: &Context<MintNFT>,
    name: String,
    symbol: String,
    uri: String,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    // creator — signer is the payer/update authority here
    let creator = Creator {
        address: ctx.accounts.signer.key(),
        verified: false, // not verified by Metaplex until update_authority signs; set according to flow
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
        metadata: ctx.accounts.metadata.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        mint_authority: ctx.accounts.mint_authority.to_account_info(),
        payer: ctx.accounts.signer.to_account_info(),
        update_authority: ctx.accounts.signer.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(), // <-- required field (fixed)
    };

    let program = ctx.accounts.token_metadata_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(program, accounts, signer_seeds);

    // create_metadata_accounts_v3 expects (ctx, data, is_mutable, update_authority_is_signer, collection_details)
    create_metadata_accounts_v3(
        cpi_ctx,
        data,
        true,                                // is_mutable
        true,                                // update_authority_is_signer
        Option::<CollectionDetails>::None,   // collection details (None)
    )?;

    Ok(())
}
