use arcis::*;

#[encrypted]
mod circuits {
    use arcis::*;

    pub struct DiscInput {
        pub answers: [u8; 28], // 0=a, 1=b, 2=c, 3=d
    }

    pub struct DiscOutput {
        pub d_score: u8,
        pub i_score: u8,
        pub s_score: u8,
        pub c_score: u8,
    }

    #[instruction]
    pub fn compute_disc(
        ctx: Enc<Shared, DiscInput>,
    ) -> Enc<Shared, DiscOutput> {
        let input = ctx.to_arcis();

        let mut d: u8 = 0;
        let mut i: u8 = 0;
        let mut s: u8 = 0;
        let mut c: u8 = 0;

        for idx in 0..28 {
            let v = input.answers[idx];
            if v == 0 { d += 1; }
            else if v == 1 { i += 1; }
            else if v == 2 { s += 1; }
            else if v == 3 { c += 1; }
        }

        ctx.owner.from_arcis(DiscOutput {
            d_score: d,
            i_score: i,
            s_score: s,
            c_score: c,
        })
    }
    }
