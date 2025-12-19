use arcis::*;

#[encrypted]
mod circuits {
    use arcis::*;

    // 28 answers
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
        input_ctxt: Enc<Shared, DiscInput>,
    ) -> Enc<Shared, DiscOutput> {
        let input = input_ctxt.to_arcis();

        let mut d: u8 = 0;
        let mut i: u8 = 0;
        let mut s: u8 = 0;
        let mut c: u8 = 0;

        // MPC-safe loop
        for idx in 0..28 {
            let v = input.answers[idx];

            // MPC-safe equality checks
            let is_d = v.eq(&0u8);
            let is_i = v.eq(&1u8);
            let is_s = v.eq(&2u8);
            let is_c = v.eq(&3u8);

            // MPC-safe accumulation (NO branching, NO casting)
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
