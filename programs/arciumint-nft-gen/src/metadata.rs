use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke_signed, account_info::AccountInfo, pubkey::Pubkey};
use mpl_token_metadata::instruction::create_metadata_accounts_v3;
use mpl_token_metadata::state::{Creator, DataV2};

pub fn create_metadata<'info>(
    token_metadata_program: AccountInfo<'info>,
    metadata: AccountInfo<'info>,
    mint: AccountInfo<'info>,
    mint_authority: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    name: String,
    symbol: String,
    uri: String,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {

    let creators = vec![Creator {
        address: *payer.key,
        verified: true,
        share: 100,
    }];

    let data = DataV2 {
        name,
        symbol,
        uri,
        seller_fee_basis_points: 500,
        creators: Some(creators),
        collection: None,
        uses: None,
    };

    let ix = create_metadata_accounts_v3(
        *token_metadata_program.key,
        *metadata.key,
        *mint.key,
        *mint_authority.key,
        *payer.key,
        *mint_authority.key,
        data,
        true,
        true,
        None,
        None,
    );

    invoke_signed(
        &ix,
        &[
            token_metadata_program.clone(),
            metadata.clone(),
            mint.clone(),
            mint_authority.clone(),
            payer.clone(),
        ],
        signer_seeds,
    )?;

    Ok(())
}
