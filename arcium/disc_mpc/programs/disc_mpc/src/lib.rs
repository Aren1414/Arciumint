use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;
use arcium_anchor::traits::CallbackCompAccs;
use arcium_client::idl::arcium::types::{CircuitSource, OffChainCircuitSource};

const COMP_DEF_OFFSET_COMPUTE_DISC: u32 = comp_def_offset("compute_disc");

declare_id!("PPyR7WKqttjq4ZwcVwrerPsHkUnEkcZ6Vq7zQ1CbSvM");

#[arcium_program]
pub mod disc_mpc {
    use super::*;

    pub fn init_compute_disc_comp_def(
        ctx: Context<InitComputeDiscCompDef>,
    ) -> Result<()> {
        init_comp_def(
            ctx.accounts,
            Some(CircuitSource::OffChain(OffChainCircuitSource {
                source: "https://raw.githubusercontent.com/Aren1414/Arciumint/main/arcium/disc_mpc/build/compute_disc.arcis"
                    .to_string(),
                hash: [0; 32],
            })),
            None,
        )?;
        Ok(())
    }

    pub fn compute_disc(
        ctx: Context<ComputeDisc>,
        computation_offset: u64,
        ciphertext_0: [u8; 32],
        ciphertext_1: [u8; 32],
        ciphertext_2: [u8; 32],
        ciphertext_3: [u8; 32],
        ciphertext_4: [u8; 32],
        ciphertext_5: [u8; 32],
        ciphertext_6: [u8; 32],
        ciphertext_7: [u8; 32],
        ciphertext_8: [u8; 32],
        ciphertext_9: [u8; 32],
        ciphertext_10: [u8; 32],
        ciphertext_11: [u8; 32],
        ciphertext_12: [u8; 32],
        ciphertext_13: [u8; 32],
        ciphertext_14: [u8; 32],
        ciphertext_15: [u8; 32],
        ciphertext_16: [u8; 32],
        ciphertext_17: [u8; 32],
        ciphertext_18: [u8; 32],
        ciphertext_19: [u8; 32],
        ciphertext_20: [u8; 32],
        ciphertext_21: [u8; 32],
        ciphertext_22: [u8; 32],
        ciphertext_23: [u8; 32],
        ciphertext_24: [u8; 32],
        ciphertext_25: [u8; 32],
        ciphertext_26: [u8; 32],
        ciphertext_27: [u8; 32],
        pubkey: [u8; 32],
        nonce: u128,
    ) -> Result<()> {
        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

        let args = ArgBuilder::new()
            .x25519_pubkey(pubkey)
            .plaintext_u128(nonce)
            .encrypted_u8(ciphertext_0)
            .encrypted_u8(ciphertext_1)
            .encrypted_u8(ciphertext_2)
            .encrypted_u8(ciphertext_3)
            .encrypted_u8(ciphertext_4)
            .encrypted_u8(ciphertext_5)
            .encrypted_u8(ciphertext_6)
            .encrypted_u8(ciphertext_7)
            .encrypted_u8(ciphertext_8)
            .encrypted_u8(ciphertext_9)
            .encrypted_u8(ciphertext_10)
            .encrypted_u8(ciphertext_11)
            .encrypted_u8(ciphertext_12)
            .encrypted_u8(ciphertext_13)
            .encrypted_u8(ciphertext_14)
            .encrypted_u8(ciphertext_15)
            .encrypted_u8(ciphertext_16)
            .encrypted_u8(ciphertext_17)
            .encrypted_u8(ciphertext_18)
            .encrypted_u8(ciphertext_19)
            .encrypted_u8(ciphertext_20)
            .encrypted_u8(ciphertext_21)
            .encrypted_u8(ciphertext_22)
            .encrypted_u8(ciphertext_23)
            .encrypted_u8(ciphertext_24)
            .encrypted_u8(ciphertext_25)
            .encrypted_u8(ciphertext_26)
            .encrypted_u8(ciphertext_27)
            .build();

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![<ComputeDiscCallback as CallbackCompAccs>::callback_ix(
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
        let o = output
            .verify_output(&ctx.accounts.cluster_account, &ctx.accounts.computation_account)
            .map_err(|_| DiscMpcError::AbortedComputation)?;

        emit!(DiscScoresEvent {
            computation_account: ctx.accounts.computation_account.key(),
            d_score_cipher: o.field_0.ciphertexts[0],
            i_score_cipher: o.field_0.ciphertexts[1],
            s_score_cipher: o.field_0.ciphertexts[2],
            c_score_cipher: o.field_0.ciphertexts[3],
            nonce: o.field_0.nonce.to_le_bytes(),
        });

        Ok(())
    }
}

// ---------- CALLBACK ACCOUNTS (NO CUSTOM ERRORS) ----------

#[callback_accounts("compute_disc")]
#[derive(Accounts)]
pub struct ComputeDiscCallback<'info> {
    pub arcium_program: Program<'info, Arcium>,

    #[account(address = derive_comp_def_pda!(COMP_DEF_OFFSET_COMPUTE_DISC))]
    pub comp_def_account: Account<'info, ComputationDefinitionAccount>,

    #[account(address = derive_mxe_pda!())]
    pub mxe_account: Account<'info, MXEAccount>,

    /// CHECK
    pub computation_account: UncheckedAccount<'info>,

    #[account(address = derive_cluster_pda!(mxe_account))]
    pub cluster_account: Account<'info, Cluster>,

    #[account(address = ::anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

#[error_code]
pub enum DiscMpcError {
    #[msg("The computation was aborted")]
    AbortedComputation,
        }
