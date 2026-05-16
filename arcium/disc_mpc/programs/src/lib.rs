use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;
use borsh::{BorshSerialize, BorshDeserialize};
use arcium_macros::circuit_hash;

declare_id!("FygFxVHQsikUznYVfGxgue3trkRu1uVyprHAA5BRa9Tr"); 


#[derive(BorshSerialize, BorshDeserialize)]
pub struct DiscOutput {
    pub d_score: u8,
    pub i_score: u8,
    pub s_score: u8,
    pub c_score: u8,
}

#[arcium_program]
pub mod disc_mpc {
    use super::*;

    
    pub fn init_compute_disc_comp_def(ctx: Context<InitComputeDiscCompDef>) -> Result<()> {
        init_computation_def(
            ctx.accounts,
            Some(arcium_client::idl::arcium::types::CircuitSource::OffChain(
                arcium_client::idl::arcium::types::OffChainCircuitSource {
                    source: "https://raw.githubusercontent.com/Aren1414/Arciumint/main/arcium/disc_mpc/build/compute_disc.arcis".to_string(),
                    hash: circuit_hash!("compute_disc"),
                }
            )),
            None, // compute_limit
        )
    }

    
    pub fn compute_disc(
        ctx: Context<ComputeDisc>,
        computation_offset: u64,
        pubkey: [u8; 32],
        nonce: u128,
        ciphertexts: Vec<[u8; 32]>,
    ) -> Result<()> {
        require!(ciphertexts.len() == 28, ErrorCode::InvalidCiphertextsLen);

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
        output: SignedComputationOutputs<DiscOutput>,
    ) -> Result<()> {
        let result = output
            .verify_output(&ctx.accounts.cluster_account, &ctx.accounts.computation_account)
            .map_err(|_| ErrorCode::AbortedComputation)?;

        msg!("Scores: D={}, I={}, S={}, C={}", 
            result.d_score, result.i_score, result.s_score, result.c_score);

        emit!(DiscScoresEvent {
            computation_account: ctx.accounts.computation_account.key(),
            d_score: result.d_score,
            i_score: result.i_score,
            s_score: result.s_score,
            c_score: result.c_score,
        });

        Ok(())
    }
}

// ساختارهای Accounts (مطابق با الگوی fresh_project، فقط اسم‌ها عوض شده)
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
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut, address = derive_mempool_pda!(mxe_account, ErrorCode::ClusterNotSet))]
    pub mempool_account: UncheckedAccount<'info>,
    #[account(mut, address = derive_execpool_pda!(mxe_account, ErrorCode::ClusterNotSet))]
    pub executing_pool: UncheckedAccount<'info>,
    #[account(mut, address = derive_comp_pda!(computation_offset, mxe_account, ErrorCode::ClusterNotSet))]
    pub computation_account: UncheckedAccount<'info>,
    #[account(address = derive_comp_def_pda!(comp_def_offset("compute_disc")))]
    pub comp_def_account: Box<Account<'info, ComputationDefinitionAccount>>,
    #[account(mut, address = derive_cluster_pda!(mxe_account, ErrorCode::ClusterNotSet))]
    pub cluster_account: Box<Account<'info, Cluster>>,
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
    /// CHECK: computation_account, checked by arcium program
    pub computation_account: UncheckedAccount<'info>,
    #[account(address = derive_cluster_pda!(mxe_account, ErrorCode::ClusterNotSet))]
    pub cluster_account: Account<'info, Cluster>,
    #[account(address = ::arcium_anchor::solana_instructions_sysvar::ID)]
    /// CHECK: instructions_sysvar, checked by account constraint
    pub instructions_sysvar: UncheckedAccount<'info>,
}

#[init_computation_definition_accounts("compute_disc", payer)]
#[derive(Accounts)]
pub struct InitComputeDiscCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,
    #[account(mut)]
    /// CHECK: comp_def_account, checked by arcium program
    pub comp_def_account: UncheckedAccount<'info>,
    #[account(mut, address = derive_mxe_lut_pda!(mxe_account.lut_offset_slot))]
    /// CHECK: address_lookup_table, checked by arcium program
    pub address_lookup_table: UncheckedAccount<'info>,
    #[account(address = LUT_PROGRAM_ID)]
    /// CHECK: lut_program is the Address Lookup Table program
    pub lut_program: UncheckedAccount<'info>,
    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct DiscScoresEvent {
    pub computation_account: Pubkey,
    pub d_score: u8,
    pub i_score: u8,
    pub s_score: u8,
    pub c_score: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The computation was aborted")]
    AbortedComputation,
    #[msg("Cluster not set")]
    ClusterNotSet,
    #[msg("ciphertexts length must be exactly 28")]
    InvalidCiphertextsLen,
}
