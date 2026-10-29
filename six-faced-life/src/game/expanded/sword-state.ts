import type { Decision, ExpandedLife, Life } from '../types';
import { ORDINARY_ROLES, type OrdinaryRole } from './career-access';

export const SWORD_STYLES = ['sword-god', 'water-god', 'north-god'] as const;
export type SwordStyle = typeof SWORD_STYLES[number];
export type SwordRank = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type AdvancedSwordRank = 3 | 4 | 5 | 6;
export const SWORD_XP = [0,35,110,260,560,1000,1800] as const;
export const SWORD_NAMES: Record<SwordStyle, string> = {'sword-god':'Sword God','water-god':'Water God','north-god':'North God'};
export interface SwordTrack { xp: number; cap: SwordRank }
export interface SwordMentorship { style: SwordStyle; target: AdvancedSwordRank; fee: number; progress: number; deferred: boolean }
export interface SwordState {
  version: 1; selected: SwordStyle | null; tracks: Record<SwordStyle, SwordTrack>;
  legacy: SwordTrack | null; compatibilityDecision: Decision | null;
  courseCredit: Record<OrdinaryRole, number>; mentorship: SwordMentorship | null;
  completed: Record<SwordStyle, Partial<Record<AdvancedSwordRank, number>>>;
}
export const isSwordStyle = (s: unknown): s is SwordStyle => typeof s === 'string' && (SWORD_STYLES as readonly string[]).includes(s);
export function emptySwordState(): SwordState {
  return {version:1, selected:null, tracks:{'sword-god':{xp:0,cap:2},'water-god':{xp:0,cap:2},'north-god':{xp:0,cap:2}}, legacy:null, compatibilityDecision:null,
    courseCredit:Object.fromEntries(ORDINARY_ROLES.map(r=>[r,0])) as Record<OrdinaryRole,number>, mentorship:null,
    completed:{'sword-god':{},'water-god':{},'north-god':{}}};
}
export function swordRank(t: SwordTrack): SwordRank { return Math.min(t.cap, SWORD_XP.filter(x=>t.xp>=x).length-1) as SwordRank; }
export function selectedSwordTrack(l: ExpandedLife): SwordTrack | null {
  const s=l.expansion.swords; return s ? s.selected ? s.tracks[s.selected] : null : {xp:l.training.swordXp,cap:l.training.swordCap as SwordRank};
}
export function swordTracks(l: ExpandedLife): SwordTrack[] {
  const s=l.expansion.swords; return s ? [...SWORD_STYLES.map(k=>s.tracks[k]), ...(s.legacy?[s.legacy]:[])] : [{xp:l.training.swordXp,cap:l.training.swordCap as SwordRank}];
}
export function bestSwordTrack(l: ExpandedLife): SwordTrack | null {
  return swordTracks(l).sort((a,b)=>swordRank(b)-swordRank(a)||b.xp-a.xp)[0]??null;
}
export function swordMeets(l: ExpandedLife, xp: number, cap: SwordRank, mode: 'career'|'event'): boolean {
  const tracks=mode==='career'?swordTracks(l):[selectedSwordTrack(l)];
  return tracks.some(t=>t!==null&&t.xp>=xp&&t.cap>=cap);
}
export function maxSwordXp(l: ExpandedLife): number { return Math.max(0,...swordTracks(l).map(t=>t.xp)); }
export function syncSwordCompatibility(l: ExpandedLife): void {
  if (!l.expansion.swords) return;
  const t=bestSwordTrack(l)!; l.training.swordXp=t.xp; l.training.swordCap=t.cap;
  l.training.school=l.expansion.swords.selected ? SWORD_NAMES[l.expansion.swords.selected] : '';
}
/** Caller owns the transaction; initial selection inside safe practice uses this helper. */
export function allocateSwordStyle(l: ExpandedLife, style: SwordStyle): void {
  const s=l.expansion.swords!;
  if(s.legacy) { s.tracks[style]={...s.legacy,cap:Math.max(2,s.legacy.cap) as SwordRank}; s.legacy=null; }
  s.selected=style; syncSwordCompatibility(l);
}
export function selectSwordStyle(l: Life, style: SwordStyle): Life {
  if(l.ruleset!=='expanded-1'||l.phase!=='alive'||l.age<5||l.pending||l.expansion.queue.length||!isSwordStyle(style)||!l.expansion.swords||l.expansion.swords.selected===style) return l;
  const n=structuredClone(l); allocateSwordStyle(n,style); return n;
}
export function grantSwordXp(l: ExpandedLife, amount: number): void {
  if(!Number.isFinite(amount)||amount<=0) return;
  const s=l.expansion.swords;
  if(!s) {l.training.swordXp=Math.min(1_000_000,l.training.swordXp+amount); return;}
  const t=s.selected?s.tracks[s.selected]:s.legacy;
  if(t) t.xp=Math.min(1_000_000,t.xp+amount);
  syncSwordCompatibility(l);
}
export function creditSwordCourse(l: ExpandedLife, role: OrdinaryRole, target: number): void {
  const s=l.expansion.swords;
  if(!s){ l.training.swordXp=Math.max(l.training.swordXp,target); return; }
  const t=s.selected?s.tracks[s.selected]:s.legacy;
  if(!t) return;
  const prior=s.courseCredit[role];
  grantSwordXp(l,Math.max(0,Math.min(target-prior,target-t.xp)));
  s.courseCredit[role]=Math.max(prior,target);
}
