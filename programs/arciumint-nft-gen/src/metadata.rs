use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke_signed, pubkey::Pubkey};
use mpl_token_metadata::instructions::CreateMetadataAccountsV3;
use mpl_token_metadata::types::{Creator, DataV2};

#[allow(clippy::too_many_arguments)]
pub fn create_metadata<'info>(
    metadata_program: AccountInfo<'info>,
    metadata_account: Pubkey,
    mint: Pubkey,
    mint_authority: Pubkey,
    payer: Pubkey,
    update_authority: Pubkey,
    name: String,
    symbol: String,
    uri: String,
    system_program: AccountInfo<'info>,
    metadata_ai: AccountInfo<'info>,
    mint_ai: AccountInfo<'info>,
    mint_authority_ai: AccountInfo<'info>,
    payer_ai: AccountInfo<'info>,
    update_authority_ai: AccountInfo<'info>,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let creators = vec![Creator {
        address: payer,
        verified: true,
        share: 100,
    }];

    let data_v2 = DataV2 {
        name,
        symbol,
        uri,
        seller_fee_basis_points: 500,
        creators: Some(creators),
        collection: None,
        uses: None,
    };

    let ix = CreateMetadataAccountsV3 {
        metadata: metadata_account,
        mint,
        mint_authority,
        payer,
        update_authority,
        system_program: system_program.key(),
        rent: None,
    }
    .instruction(data_v2);

    let accounts = &[
        metadata_ai,
        mint_ai,
        mint_authority_ai,
        payer_ai,
        update_authority_ai,
        system_program,
    ];

    invoke_signed(&ix, accounts, signer_seeds)?;

    Ok(())
}
