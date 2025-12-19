use arcis::*;
use arcis_compiler::traits::Select;

#[encrypted]
mod circuits {
    use super::*;
    use arcis_compiler::traits::Select;

    // 28 answers, each in range 0..=3
    // 0 = D, 1 = I, 2 = S, 3 = C
    pub struct DiscInput {
        pub answers: [u8; 28],
    }

    pub struct DiscOutput {
        pub d_score: u8,
        pub i_score: u8,
        pub s_score: u8,
        pub c_score: u8,
    }

    #[instruction]
    pub fn compute_disc(input_ctxt: Enc<Shared, DiscInput>) -> Enc<Shared, DiscOutput> {
        let input = input_ctxt.to_arcis();

        let mut d: u8 = 0;
        let mut i: u8 = 0;
        let mut s: u8 = 0;
        let mut c: u8 = 0;

        // MPC-safe counting (no match)
        for idx in 0..28 {
            let v = input.answers[idx];

            let is_d: bool = v == 0;
            let is_i: bool = v == 1;
            let is_s: bool = v == 2;
            let is_c: bool = v == 3;

            d = d + is_d.select(1u8, 0u8);
            i = i + is_i.select(1u8, 0u8);
            s = s + is_s.select(1u8, 0u8);
            c = c + is_c.select(1u8, 0u8);
        }

        let output = DiscOutput {
            d_score: d,
            i_score: i,
            s_score: s,
            c_score: c,
        };

        input_ctxt.owner.from_arcis(output)
    }
}
