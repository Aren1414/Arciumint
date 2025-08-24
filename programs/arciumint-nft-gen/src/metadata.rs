use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    program::invoke_signed,
    pubkey::Pubkey,
};
use mpl_token_metadata::instruction::create_metadata_accounts_v3;
use mpl_token_metadata::state::Creator;

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
    bump: u8,
    system_program: AccountInfo<'info>,
    rent: AccountInfo<'info>,
    metadata: AccountInfo<'info>,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let creators = vec![Creator {
        address: payer,
        verified: true,
        share: 100,
    }];

    let ix = create_metadata_accounts_v3(
        metadata_program.key(),
        metadata_account,
        mint,
        mint_authority,
        payer,
        update_authority,
        name,
        symbol,
        uri,
        Some(creators),
        500,
        true,
        true,
        None,
        None,
        None,
    );

    invoke_signed(
        &ix,
        &[
            metadata_program,
            metadata,
            system_program,
            rent,
        ],
        signer_seeds,
    )?;

    Ok(())
}
