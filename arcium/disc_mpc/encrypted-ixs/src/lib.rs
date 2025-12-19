use arcis::*;

#[encrypted]
mod circuits {
    use arcis::*;

    // 28 answers, each in range 0..3
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
    pub fn compute_disc(
        input_ctxt: Enc<Shared, DiscInput>
    ) -> Enc<Shared, DiscOutput> {

        let input = input_ctxt.to_arcis();

        let mut d: u8 = 0;
        let mut i: u8 = 0;
        let mut s: u8 = 0;
        let mut c: u8 = 0;

        // MPC-safe loop
        for idx in 0..28 {
            let v = input.answers[idx];

            // match is MPC-safe in Arcis
            match v {
                0 => d += 1, // Dominance
                1 => i += 1, // Influence
                2 => s += 1, // Steadiness
                3 => c += 1, // Conscientiousness
                _ => {}
            }
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
