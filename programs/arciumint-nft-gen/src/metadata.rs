use anchor_lang::prelude::*;
use mpl_token_metadata::instruction::create_metadata_accounts_v3;
use mpl_token_metadata::state::DataV2;


pub fn create_metadata_for_token<'info>(
    ctx: &Context<crate::MintNFT>,
    name: String,
    symbol: String,
    uri: String,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    let data_v2 = DataV2 {
        name,
        symbol,
        uri,
        seller_fee_basis_points: 0, 
        creators: None,
        collection: None,
        uses: None,
    };

    
    let metadata_program = ctx.accounts.token_metadata_program.to_account_info();

    let ix = create_metadata_accounts_v3(
        metadata_program.key(),
        ctx.accounts.metadata.key(),         // PDA 
        ctx.accounts.mint.key(),             // mint
        ctx.accounts.mint_authority.key(),   // authority
        ctx.accounts.payer.key(),            // payer
        ctx.accounts.payer.key(),            // update authority
        data_v2,
        true,  // is_mutable
        true,  // update_authority_is_signer
        None,  // collection details
    );

    
    anchor_lang::solana_program::program::invoke_signed(
        &ix,
        &[
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.mint_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        signer_seeds,
    )?;

    Ok(())
}
