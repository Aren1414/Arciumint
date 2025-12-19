use arcis::*;

#[encrypted]
mod circuits {
    use arcis::*;

    pub struct DiscInput {
        pub answers: [u8; 28], // 0=D, 1=I, 2=S, 3=C
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

        // MPC-safe counting (NO match, NO branching)
        for idx in 0..28 {
            let v = input.answers[idx];

            d += (v == 0) as u8;
            i += (v == 1) as u8;
            s += (v == 2) as u8;
            c += (v == 3) as u8;
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
