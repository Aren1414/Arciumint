use arcis::*;

#[encrypted]
mod circuits {
    use arcis::*;

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

        let mut d = 0u8;
        let mut i = 0u8;
        let mut s = 0u8;
        let mut c = 0u8;

        for idx in 0..28 {
            let v = input.answers[idx];
            d += (v == 0) as u8;
            i += (v == 1) as u8;
            s += (v == 2) as u8;
            c += (v == 3) as u8;
        }

        input_ctxt.owner.from_arcis(DiscOutput {
            d_score: d,
            i_score: i,
            s_score: s,
            c_score: c,
        })
    }
}
