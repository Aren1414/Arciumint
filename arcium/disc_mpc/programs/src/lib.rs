use anchor_lang::{
    account,
    declare_id,
    error_code,
    instruction,
    msg,
    prelude::AccountInfo,
    Accounts,
};

use arcium_anchor::prelude::*;
use arcium_macros::circuit_hash;

declare_id!("B43AmAinEGxWB7DW9ubjsJUqgWvm28ZBQuthMqqVtthk");

#[arcium_program]
pub mod disc_mpc {
    use super::*;

    pub fn init_compute_disc_comp_def(
        ctx: Context<InitComputeDiscCompDef>,
    ) -> Result<()> {
        init_comp_def(
            ctx.accounts,
            Some(arcium_client::idl::arcium::types::CircuitSource::OffChain(
                arcium_client::idl::arcium::types::OffChainCircuitSource {
                    source: "https://raw.githubusercontent.com/Aren1414/Arciumint/main/arcium/disc_mpc/build/compute_disc.arcis".to_string(),
                    hash: circuit_hash!("compute_disc"),
                },
            )),
            None,
            None,
        )
    }

    pub fn compute_disc(
        ctx: Context<ComputeDisc>,
        computation_offset: u64,
        pubkey: [u8; 32],
        nonce: u128,
        ciphertexts: Vec<[u8; 32]>,
    ) -> Result<()> {
        require!(
            ciphertexts.len() == 28,
            ErrorCode::InvalidCiphertextsLen
        );

        let mut builder = ArgBuilder::new()
            .x25519_pubkey(pubkey)
            .plaintext_u128(nonce);

        for ct in ciphertexts {
            builder = builder.encrypted_u8(ct);
        }

        let args = builder.build();

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            vec![ComputeDiscCallback::callback_ix(
                computation_offset,
                &ctx.accounts.mxe_account,
                &[],
            )?],
            1,
            0,
        )
    }

    #[arcium_callback(encrypted_ix = "compute_disc")]
    pub fn compute_disc_callback(
        ctx: Context<ComputeDiscCallback>,
        output: SignedComputationOutputs<ComputeDiscOutput>,
    ) -> Result<()> {
        let _result = output
            .verify_output(
                &ctx.accounts.cluster_account,
                &ctx.accounts.computation_account,
            )
            .map_err(|_| ErrorCode::AbortedComputation)?;

        msg!("Computation completed successfully.");

        Ok(())
    }
}

#[queue_computation_accounts("compute_disc", payer)]
#[derive(Accounts)]
#[instruction(computation_offset: u64)]
pub struct ComputeDisc<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init_if_needed,
        space = 9,
        payer = payer,
        seeds = [&SIGN_PDA_SEED],
        bump,
        address = derive_sign_pda!(),
    )]
    pub sign_pda_account: Account<'info, ArciumSignerAccount>,

    #[account(address = derive_mxe_pda!())]
    pub mxe_account: Account<'info, MXEAccount>,

    #[account(mut, address = derive_mempool_pda!(mxe_account))]
    /// CHECK:
    pub mempool_account: UncheckedAccount<'info>,

    #[account(mut, address = derive_execpool_pda!(mxe_account))]
    /// CHECK:
    pub executing_pool: UncheckedAccount<'info>,

    #[account(mut, address = derive_comp_pda!(computation_offset, mxe_account))]
    /// CHECK:
    pub computation_account: UncheckedAccount<'info>,

    #[account(address = derive_comp_def_pda!(comp_def_offset("compute_disc")))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,

    #[account(mut, address = derive_cluster_pda!(mxe_account))]
    pub cluster_account: Account<'info, Cluster>,

    #[account(mut, address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS)]
    pub pool_account: Account<'info, FeePool>,

    #[account(mut, address = ARCIUM_CLOCK_ACCOUNT_ADDRESS)]
    pub clock_account: Account<'info, ClockAccount>,

    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
}

#[callback_accounts("compute_disc")]
#[derive(Accounts)]
pub struct ComputeDiscCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,

    #[account(address = derive_comp_def_pda!(comp_def_offset("compute_disc")))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,

    #[account(address = derive_mxe_pda!())]
    pub mxe_account: Account<'info, MXEAccount>,

    /// CHECK:
    pub computation_account: UncheckedAccount<'info>,

    #[account(address = derive_cluster_pda!(mxe_account))]
    pub cluster_account: Account<'info, Cluster>,

    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    /// CHECK:
    pub instructions_sysvar: AccountInfo<'info>,
}

#[init_computation_definition_accounts("compute_disc", payer)]
#[derive(Accounts)]
pub struct InitComputeDiscCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,

    #[account(mut)]
    /// CHECK:
    pub comp_def_account: UncheckedAccount<'info>,

    #[account(mut, address = derive_mxe_lut_pda!(mxe_account.lut_offset_slot))]
    /// CHECK:
    pub address_lookup_table: UncheckedAccount<'info>,

    #[account(address = LUT_PROGRAM_ID)]
    /// CHECK:
    pub lut_program: UncheckedAccount<'info>,

    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The computation was aborted")]
    AbortedComputation,

    #[msg("Invalid ciphertexts length, expected 28")]
    InvalidCiphertextsLen,
}
