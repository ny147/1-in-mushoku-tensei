export function draw(state: { rng: number }): number {
  state.rng = (state.rng + 0x6d2b79f5) >>> 0;
  let t = state.rng; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export function weighted<T extends string>(state: {rng:number}, values: readonly (readonly [T, number])[]): T {
  let target = draw(state) * values.reduce((n, [,w])=>n+w,0);
  return values.find(([,w])=>(target-=w)<0)?.[0] ?? values[values.length-1][0];
}
export const clamp = (v:number, lo=0, hi=100) => Math.max(lo, Math.min(hi, v));
