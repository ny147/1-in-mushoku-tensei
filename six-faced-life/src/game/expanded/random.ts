export function draw(state: { rng: number }): number {
  state.rng = (state.rng + 0x6d2b79f5) >>> 0;
  let t = state.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export function weighted<T extends string>(
  state: { rng: number },
  values: readonly (readonly [T, number])[],
): T {
  let target = draw(state) * values.reduce((n, [, w]) => n + w, 0);
  return (
    values.find(([, w]) => (target -= w) < 0)?.[0] ??
    values[values.length - 1][0]
  );
}
export const clamp = (v: number, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, v));
// Marsaglia–Tsang gamma sampler; shapes here are positive integers. Rejection
// depends on random draws rather than the size of the represented population.
function gamma(state: { rng: number }, shape: number): number {
  const d = shape - 1 / 3,
    c = 1 / Math.sqrt(9 * d);
  for (;;) {
    const z =
      Math.sqrt(-2 * Math.log(Math.max(Number.MIN_VALUE, draw(state)))) *
      Math.cos(2 * Math.PI * draw(state));
    const base = 1 + c * z;
    if (base <= 0) continue;
    const v = base * base * base,
      u = draw(state);
    if (
      u < 1 - 0.0331 * z ** 4 ||
      Math.log(u) < 0.5 * z * z + d * (1 - v + Math.log(v))
    )
      return d * v;
  }
}
/** Binomial sampling: small Bernoulli groups, sparse inversion, then beta
 * decomposition. The latter halves the population each step, retaining the
 * binomial law without one random draw per represented person. */
export function sampleCount(
  state: { rng: number },
  n: number,
  p: number,
): number {
  if (n <= 0 || p <= 0) return 0;
  if (p >= 1) return n;
  if (n <= 64) {
    let count = 0;
    for (let i = 0; i < n; i++) if (draw(state) < p) count++;
    return count;
  }
  if (p > 0.5) return n - sampleCount(state, n, 1 - p);
  if (n * p < 32) {
    let k = 0,
      mass = Math.exp(n * Math.log1p(-p)),
      u = draw(state);
    while (u > mass && k < 256 && k < n) {
      u -= mass;
      k++;
      mass *= ((n - k + 1) / k) * (p / (1 - p));
    }
    return k;
  }
  const a = Math.floor(n / 2) + 1,
    b = n - a + 1,
    x = gamma(state, a),
    y = gamma(state, b),
    beta = x / (x + y);
  return beta >= p
    ? sampleCount(state, a - 1, p / beta)
    : a + sampleCount(state, b - 1, (p - beta) / (1 - beta));
}
