use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    instruction::Instruction,
    program::invoke_signed,
    pubkey::Pubkey,
};
use mpl_token_metadata::types::Creator;
use mpl_token_metadata::accounts::CreateMetadataAccountsV3;
use mpl_token_metadata::instructions::create_metadata_accounts_v3;

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
    let creators = vec![Creator {
        address: payer.key(), // Pubkey از anchor_lang::solana_program
        verified: true,
        share: 100,
    }];

    let accounts = CreateMetadataAccountsV3 {
        metadata: metadata_account,
        mint: *mint.key,
        mint_authority: *mint_authority.key,
        payer: *payer.key,
        update_authority,
        system_program: *system_program.key,
        rent: *rent.key,
    };

    let ix: Instruction = create_metadata_accounts_v3(
        accounts,
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
        &ix,
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
