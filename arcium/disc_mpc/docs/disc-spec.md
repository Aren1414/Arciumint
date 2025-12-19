# DISC MPC Specification

- Total questions: 28
- Each question has 4 options (a, b, c, d)
- Mapping:
  - a -> Dominance (D)
  - b -> Influence (I)
  - c -> Steadiness (S)
  - d -> Conscientiousness (C)

## Input (Encrypted)
- answers: [u8; 28]  // 0=a, 1=b, 2=c, 3=d
- nonce: u64

## Output (Encrypted)
- d_score: u8
- i_score: u8
- s_score: u8
- c_score: u8

## Percentage Calculation
percentage = (score / 28) * 100

## Privacy
- All inputs and outputs remain encrypted
- No plaintext scores are ever stored on-chain
