use anchor_lang::prelude::*;
use mpl_token_metadata::instruction::create_metadata_accounts_v3;
use mpl_token_metadata::types::{Creator, DataV2}; 
use anchor_lang::solana_program::program::invoke_signed;

pub fn create_metadata<'info>(
    metadata_program: AccountInfo<'info>,
    metadata_account: Pubkey,
    mint: AccountInfo<'info>,
    mint_authority: AccountInfo<'info>,
    payer: AccountInfo<'info>,
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
    let creators = vec![
        Creator {
            address: payer.key(),
            verified: true,
            share: 100,
        },
    ];

    let metadata_instruction = create_metadata_accounts_v3(
        metadata_program.key(),
        metadata_account,
        mint.key(),
        mint_authority.key(),
        payer.key(),
        update_authority,
        name,
        symbol,
        uri,
        Some(creators),
        500,  // Royalty: 5%
        true, // Primary sale happened
        true, // Is mutable
        None, // Collection
        None, // Uses
        None, // RuleSet
    );

    invoke_signed(
        &metadata_instruction,
        &[
            metadata_program,
            metadata,
            mint,
            mint_authority,
            payer,
            system_program,
            rent,
        ],
        signer_seeds,
    )?;

    Ok(())
}
