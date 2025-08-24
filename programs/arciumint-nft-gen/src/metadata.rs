use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke_signed, pubkey::Pubkey};
use mpl_token_metadata::instruction::create_metadata_accounts_v3;
use mpl_token_metadata::types::Creator;

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
    _bump: u8,
    
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
        500,     // seller_fee_basis_points (5%)
        true,    // update_authority_is_signer
        true,    // is_mutable
        None,    // collection
        None,    // uses
        None,    // collection_details
    );

    let accounts = &[
        metadata_ai,          // Metadata PDA
        mint_ai,              // Mint
        mint_authority_ai,    // Mint Authority
        payer_ai,             // Payer
        update_authority_ai,  // Update Authority
        system_program,       // System Program
    ];

    invoke_signed(&ix, accounts, signer_seeds)?;

    Ok(())
             }
