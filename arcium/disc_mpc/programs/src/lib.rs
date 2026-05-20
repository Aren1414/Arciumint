#![cfg(not(test))]

use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;

const COMP_DEF_OFFSET_COMPUTE_DISC: u32 = comp_def_offset("compute_disc");

declare_id!("B43AmAinEGxWB7DW9ubjsJUqgWvm28ZBQuthMqqVtthk");

#[arcium_program]
pub mod disc_mpc {
    use super::*;

    pub fn init_compute_disc_comp_def(
        ctx: Context<InitComputeDiscCompDef>,
    ) -> Result<()> {
        init_computation_def(ctx.accounts, None)?;
        Ok(())
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

        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

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
        )?;
        Ok(())
    }

    #[arcium_callback(encrypted_ix = "compute_disc")]
    pub fn compute_disc_callback(
        ctx: Context<ComputeDiscCallback>,
        output: SignedComputationOutputs<ComputeDiscOutput>,
    ) -> Result<()> {
        let _o = match output.verify_output(
            &ctx.accounts.cluster_account,
            &ctx.accounts.computation_account,
        ) {
            Ok(o) => o,
            Err(_) => return Err(ErrorCode::AbortedComputation.into()),
        };

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

    #[account(
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Box<Account<'info, MXEAccount>>,

    /// CHECK: Mempool PDA is validated by Arcium runtime; we only pass it through.
    #[account(
        mut,
        address = derive_mempool_pda!(mxe_account)
    )]
    pub mempool_account: UncheckedAccount<'info>,

    /// CHECK: Exec pool PDA is validated by Arcium runtime; we only pass it through.
    #[account(
        mut,
        address = derive_execpool_pda!(mxe_account)
    )]
    pub executing_pool: UncheckedAccount<'info>,

    /// CHECK: Computation PDA is derived and validated by Arcium; no extra checks needed here.
    #[account(
        mut,
        address = derive_comp_pda!(computation_offset, mxe_account)
    )]
    pub computation_account: UncheckedAccount<'info>,

    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_COMPUTE_DISC)
    )]
    pub comp_def_account: Box<Account<'info, ComputationDefinitionAccount>>,

    #[account(
        mut,
        address = derive_cluster_pda!(mxe_account)
    )]
    pub cluster_account: Box<Account<'info, Cluster>>,

    #[account(
        mut,
        address = ARCIUM_FEE_POOL_ACCOUNT_ADDRESS,
    )]
    pub pool_account: Account<'info, FeePool>,

    #[account(
        mut,
        address = ARCIUM_CLOCK_ACCOUNT_ADDRESS
    )]
    pub clock_account: Account<'info, ClockAccount>,

    pub system_program: Program<'info, System>,
    pub arcium_program: Program<'info, Arcium>,
}

#[callback_accounts("compute_disc")]
#[derive(Accounts)]
pub struct ComputeDiscCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,

    #[account(
        address = derive_comp_def_pda!(COMP_DEF_OFFSET_COMPUTE_DISC)
    )]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,

    #[account(
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Account<'info, MXEAccount>,

    /// CHECK: Computation account is only read by Arcium verification logic.
    pub computation_account: UncheckedAccount<'info>,

    #[account(
        address = derive_cluster_pda!(mxe_account)
    )]
    pub cluster_account: Account<'info, Cluster>>,

    /// CHECK: This is the Solana instructions sysvar; Arcium validates it internally.
    #[account(address = ::arcium_anchor::solana_instructions_sysvar::ID)]
    pub instructions_sysvar: UncheckedAccount<'info>,
}

#[init_computation_definition_accounts("compute_disc", payer)]
#[derive(Accounts)]
pub struct InitComputeDiscCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        address = derive_mxe_pda!()
    )]
    pub mxe_account: Box<Account<'info, MXEAccount>>,

    /// CHECK: Created/initialized by Arcium helper; we only pass it to init_computation_def.
    #[account(mut)]
    pub comp_def_account: UncheckedAccount<'info>,

    /// CHECK: LUT PDA is derived and validated by Arcium; no extra checks needed here.
    #[account(
        mut,
        address = derive_mxe_lut_pda!(mxe_account.lut_offset_slot)
    )]
    pub address_lookup_table: UncheckedAccount<'info>,

    /// CHECK: This is the LUT program id; constant well-known program.
    #[account(address = LUT_PROGRAM_ID)]
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

// ---------- getrandom shim for sbpf / Solana test target ----------
#[cfg(target_os = "solana")]
mod solana_getrandom_shim {
    use getrandom::Error;

    // We never actually call getrandom on-chain; this is only to satisfy
    // dependencies that pull in `getrandom` for the sbpf target.
    fn solana_getrandom(_buf: &mut [u8]) -> Result<(), Error> {
        Err(Error::UNSUPPORTED)
    }

    getrandom::register_custom_getrandom!(solana_getrandom);
    }
