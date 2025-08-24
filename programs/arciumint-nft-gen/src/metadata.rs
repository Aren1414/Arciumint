use anchor_lang::prelude::*;
use solana_program::program::invoke_signed;
use mpl_token_metadata::instructions::CreateMetadataAccountV3CpiBuilder;

pub fn create_metadata<'info>(
    token_metadata_program: AccountInfo<'info>,
    metadata_account: AccountInfo<'info>,
    mint: AccountInfo<'info>,
    mint_authority: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    name: String,
    symbol: String,
    uri: String,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let mut builder = CreateMetadataAccountV3CpiBuilder::new(&token_metadata_program);

    builder
        .metadata(&metadata_account)
        .mint(&mint)
        .mint_authority(&mint_authority)
        .payer(&payer)
        .update_authority(&mint_authority, true)
        .name(name)
        .symbol(symbol)
        .uri(uri)
        .is_mutable(true);

    let ix = builder.instruction();

    invoke_signed(
        &ix,
        &[
            metadata_account,
            mint,
            mint_authority,
            payer,
            token_metadata_program,
        ],
        signer_seeds,
    )?;

    Ok(())
}
