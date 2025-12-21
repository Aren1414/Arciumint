export type DiscResult = {
  d: number;
  i: number;
  s: number;
  c: number;

  dPct: number;
  iPct: number;
  sPct: number;
  cPct: number;

  dominant: "D" | "I" | "S" | "C";

  // optional raw for debugging
  raw?: any;
};

let _discResult: DiscResult | null = null;

export function setDiscResult(result: DiscResult) {
  _discResult = result;
}

export function getDiscResult(): DiscResult | null {
  return _discResult;
}

export function clearDiscResult() {
  _discResult = null;
}
