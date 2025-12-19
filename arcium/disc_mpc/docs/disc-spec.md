# DISC MPC Specification

## Overview
This specification defines an encrypted DISC scoring computation executed via Arcium MPC.

- Total questions: **28**
- Each question has **4** options: **a, b, c, d**
- Option → Trait mapping:
  - **a → Dominance (D)**
  - **b → Influence (I)**
  - **c → Steadiness (S)**
  - **d → Conscientiousness (C)**

The system must produce a **privacy-preserving** DISC result such that:
- Only the user can decrypt and view the result (developer and public chain observers cannot).
- Output supports **1–4 active traits** (traits with score = 0 must not be shown).

---

## Terminology
- **Answer code**: `u8` in `{0,1,2,3}`
  - `0=a (D)`, `1=b (I)`, `2=c (S)`, `3=d (C)`
- **Score**: number of answers mapped to a trait.
- **Active trait**: a trait with `score > 0`.
- **Mask**: bitmask describing which traits are active.

---

## Input (Encrypted)
The MPC circuit receives the following encrypted inputs:

- `answers: [u8; 28]`
  - Each entry must be one of `{0,1,2,3}`:
    - `0=a (D)`
    - `1=b (I)`
    - `2=c (S)`
    - `3=d (C)`
- `nonce: u64`
  - User-provided nonce used for uniqueness / binding (e.g., for NFT reveal flows).
  - Included in encrypted outputs or event data as required by the application.

### Input Validation Rules
Inside MPC, each `answers[i]` must satisfy:
- `answers[i] <= 3`
If an invalid value is detected:
- The computation must fail/abort deterministically (or return a defined error output, depending on program policy).

---

## Raw Scoring (Encrypted)
Compute raw scores as counts:

- `d_score = count(answers == 0)`
- `i_score = count(answers == 1)`
- `s_score = count(answers == 2)`
- `c_score = count(answers == 3)`

Constraints:
- Each score is `u8` and must be in `[0..28]`.
- Sum must equal 28:
  - `d_score + i_score + s_score + c_score == 28`

---

## Active-Trait Mask (Encrypted)
Traits with score `> 0` are active and must be the only traits displayed by clients.

Define bit positions:
- `D = 1 << 0`  (1)
- `I = 1 << 1`  (2)
- `S = 1 << 2`  (4)
- `C = 1 << 3`  (8)

Compute:
- `mask = (d_score>0 ? 1 : 0) | (i_score>0 ? 2 : 0) | (s_score>0 ? 4 : 0) | (c_score>0 ? 8 : 0)`

Examples:
- Only D active → `mask = 1`
- D + I active → `mask = 3`
- D + I + C active → `mask = 11`
- All active → `mask = 15`

---

## Percentage Calculation (Encrypted)

### Core Rule (Important)
Percentages must be computed **relative to total active answers**, not always 28.

1) Compute active total:
- `active_total = (d_score if d_score>0 else 0)
               + (i_score if i_score>0 else 0)
               + (s_score if s_score>0 else 0)
               + (c_score if c_score>0 else 0)`

2) For each trait:
- If `score == 0`, it is **inactive** and must not be displayed.
- Otherwise:
  - `pct = round_half_up( score * 100 / active_total )`

### Rounding / Normalization
To avoid sums like 99% or 101% due to rounding, enforce:

- Compute `pct` for all active traits using integer arithmetic.
- Ensure the sum of active percentages equals **100**:
  - Let `sum_pct = Σ pct(active traits)`
  - If `sum_pct != 100`, adjust deterministically:
    - Add/subtract the difference to the trait with the **largest score**.
    - If tie, break ties deterministically in this order: `D > I > S > C`.

This guarantees deterministic outputs and stable UI rendering.

### Edge Cases
- If only one trait is active (e.g., all answers are `a`):
  - `active_total == 28`, the active trait must have `pct == 100`.
- It is impossible for `active_total == 0` if inputs are valid, since 28 answers exist.
  - If it occurs (corrupt input), computation must fail/abort.

---

## Output (Encrypted)

### Output Structure (Fixed-size, Self-describing)
Because variable-length structures are often undesirable in MPC circuits, use a fixed layout plus `mask`:

- `mask: u8` (bitmask of active traits)
- `d_pct: u8` (0..100)
- `i_pct: u8` (0..100)
- `s_pct: u8` (0..100)
- `c_pct: u8` (0..100)
- `nonce: u64` (echoed/bound nonce; optional but recommended)

### Output Display Rules (Client/UI)
- The client MUST render only traits whose bit is set in `mask`.
- Percentages for inactive traits must be ignored, regardless of their numeric value.

---

## Privacy & On-chain Safety
- All inputs (`answers`, `nonce`) and outputs (`mask`, percentages) remain encrypted throughout MPC execution.
- No plaintext DISC scores or percentages are stored on-chain.
- Any on-chain events emitted by the program must contain only ciphertext (or encrypted blobs) such that:
  - Observers (including the developer) cannot infer results.
- Decryption keys must be controlled by the user (or user-authorized viewers) only.

---

## Determinism Requirements
To ensure reproducible verification and consistent outputs:
- Mask computation, percentage rounding, and normalization must be fully deterministic.
- Tie-breaking rules must be fixed and documented (D > I > S > C).

---

## Reference Mapping
- `0 → D`
- `1 → I`
- `2 → S`
- `3 → C`
- `mask bits: D=1, I=2, S=4, C=8`
