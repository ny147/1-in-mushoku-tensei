import type { ExpandedLife } from "../types";
import { getProgression, MAGIC_SCHOOLS } from "../progression";
import { ordinaryEntry, isOrdinaryRole, type OrdinaryRole, type TrainingMode } from "./career-access";
import { ensureEducationAccess } from "./education-access-state";
import { quoteEducation, reserveEducation, consumeEducation, refundEducation, type EducationQuote } from "./education-finance";
import { appoint } from "./careers";
import { requirement, type Requirement } from "./education";
import { fact, worldYear } from "./facts";
export interface TrainingQuote extends EducationQuote { mode: TrainingMode; remainingYears: number; income: number }
export const fullTimeTraining = (l: ExpandedLife) => !!l.expansion.training?.active && !l.expansion.training.paused && l.expansion.training.mode === "full-time";
export function quoteTraining(l: ExpandedLife, role: OrdinaryRole, mode: TrainingMode): TrainingQuote {
  const preview=structuredClone(l), t=ensureEducationAccess(preview).training, c=ordinaryEntry(role), r=t.records[role];
  if(t.active) refundEducation(preview,t.active);
  const remainingUnits=c.units-r.units;
  const school=r.school ?? (role==="mage"?l.expansion.study:["healer","cleric"].includes(role)?"healing":null);
  return {...quoteEducation(preview,{purpose:role,admission:0,travel:0,tuition:c.tuition?remainingUnits*4:0,living:0,starterFee:c.starterFee,remainingUnits,school}),
    mode,remainingYears:Math.ceil(remainingUnits/(mode==="full-time"?2:1)),income:mode==="full-time"?24:0};
}
export function enrollTraining(l: ExpandedLife, q: TrainingQuote, borrow: boolean): boolean {
  if(l.phase!=="alive" || l.age<15 || l.expansion.education.stage==="university" || !isOrdinaryRole(q.purpose) || !["full-time","part-time"].includes(q.mode))return false;
  const role=q.purpose,t=l.expansion.training;
  if(t?.records[role].completedYear!==null && t?.records[role].completedYear!==undefined)return false;
  if(t?.active===role)return false;
  const canonical=quoteTraining(l,role,q.mode);
  if(Object.keys(canonical).some(k=>canonical[k as keyof TrainingQuote]!==q[k as keyof TrainingQuote]))return false;
  const next=structuredClone(l),state=ensureEducationAccess(next).training;
  if(state.active)withdrawTraining(next);
  if(!reserveEducation(next,q,borrow))return false;
  state.active=role;state.mode=q.mode;state.paused=false;state.selection=null;state.records[role].school=q.school;
  l.coins=next.coins;l.expansion=next.expansion;
  fact(l,"education","training-enrolled",role);return true;
}
export function pauseTraining(l: ExpandedLife, paused: boolean): boolean {
  const t=l.expansion.training;if(l.phase!=="alive" || !t?.active)return false;t.paused=paused;return true;
}
export function setTrainingMode(l: ExpandedLife, mode: TrainingMode): boolean {
  const t=l.expansion.training;if(l.phase!=="alive" || !t?.active || !["full-time","part-time"].includes(mode))return false;t.mode=mode;return true;
}
export function withdrawTraining(l: ExpandedLife): boolean {
  const t=l.expansion.training;if(l.phase!=="alive" || !t?.active)return false;
  refundEducation(l,t.active);fact(l,"education","training-withdrawn",t.active);t.active=null;t.paused=false;return true;
}
export function applyTrainingYear(l: ExpandedLife): void {
  const t=l.expansion.training,y=worldYear(l);
  if(l.phase!=="alive" || !t?.active || t.paused || t.lastYear>=y || l.expansion.education.stage==="university")return;
  const role=t.active,c=ordinaryEntry(role),r=t.records[role],units=Math.min(c.units-r.units,t.mode==="full-time"?2:1);
  if(!consumeEducation(l,role,c.tuition?units*4:0,y))return;
  t.lastYear=y;r.units+=units;
  const target=(value:number)=>Math.ceil(value*r.units/c.units);
  if(c.health && l.stats.health>0)l.stats.health=Math.max(l.stats.health,target(c.health));
  if(c.knowledge)l.stats.knowledge=Math.max(l.stats.knowledge,target(c.knowledge));
  if(c.sword)l.training.swordXp=Math.max(l.training.swordXp,target(c.sword));
  if(c.trust)l.expansion.standing.trust=Math.max(l.expansion.standing.trust,target(c.trust));
  if(c.reputation)l.expansion.standing.reputation=Math.max(l.expansion.standing.reputation,target(c.reputation));
  if(c.cap && r.units===c.units){const key=c.cap==="magic"?"magicCap":"swordCap";l.training[key]=Math.max(1,l.training[key]);}
  if(c.magic && r.school){
    l.progression=getProgression(l);const track=l.progression.magic[r.school],gain=Math.max(0,target(c.magic)-track.xp);
    track.xp+=gain;l.training.magicXp+=gain;
    for(const spell of MAGIC_SCHOOLS[r.school].spells)if(track.xp>=spell.xp && l.training.magicCap>=spell.rank && !track.spells.includes(spell.id))track.spells.push(spell.id);
  }
  if(r.units===c.units){r.completedYear=y;t.active=null;t.paused=false;fact(l,"education","training-completed",role);}
}
export function placementRequirements(l: ExpandedLife, role: OrdinaryRole): Requirement[] {
  const r=l.expansion.training?.records[role],c=ordinaryEntry(role);
  return [requirement("age",l.age,15),requirement("qualification",r?.completedYear!==null && r?.completedYear!==undefined?1:0,1),
    ...(c.health?[requirement("health",l.stats.health,c.health)]:[])];
}
export function acceptTrainingPlacement(l: ExpandedLife, role: OrdinaryRole): boolean {
  const r=l.expansion.training?.records[role];
  if(l.phase!=="alive" || !r || l.expansion.career.role===role || l.expansion.education.stage==="university" || placementRequirements(l,role).some(r=>!r.met))return false;
  if(!appoint(l,role,{school:r.school??undefined,funding:"reserved-training"}))return false;
  r.placementAccepted=true;return true;
}
