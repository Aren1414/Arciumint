use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke_signed, pubkey::Pubkey, account_info::AccountInfo};
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
        *mint_authority.key, // update authority
        data,
        true,  // is mutable
        true,  // update authority is signer
        None,  // collection
        None,  // uses
    );

    invoke_signed(
        &ix,
        &[
            token_metadata_program,
            metadata,
            mint,
            mint_authority,
            payer,
        ],
        signer_seeds,
    )?;

    Ok(())
}
