use anchor_lang::prelude::*;
use mpl_token_metadata::instruction::create_metadata_accounts_v3;
use mpl_token_metadata::state::{Creator, DataV2};
use solana_program::program::invoke_signed;

pub fn create_metadata<'info>(
    ctx: &Context<crate::MintNFT>,
    metadata_account: Pubkey,
    name: String,
    symbol: String,
    uri: String,
    bump: u8,
) -> Result<()> {
    let creators = vec![
        Creator {
            address: ctx.accounts.signer.key(),
            verified: true,
            share: 100,
        },
    ];

    let metadata_instruction = create_metadata_accounts_v3(
        ctx.accounts.token_metadata_program.key(), // Metaplex program ID
        metadata_account,                          // PDA for metadata account
        ctx.accounts.mint.key(),                   // Mint address
        ctx.accounts.mint_authority.key(),         // Mint authority
        ctx.accounts.signer.key(),                 // Payer
        ctx.accounts.mint_authority.key(),         // Update authority
        name,
        symbol,
        uri,
        Some(creators),
        500, // Royalty: 5%
        true,  // Primary sale happened
        true,  // Is mutable
        None,  // Collection
        None,  // Uses
        None,  // RuleSet
    );

    let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority", &[bump]]];

    invoke_signed(
        &metadata_instruction,
        &[
            ctx.accounts.token_metadata_program.to_account_info(),
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        signer_seeds,
    )?;

    Ok(())
      }
