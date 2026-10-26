import type { RaceId } from '../types';
import type { Occupation, Wealth } from './types';
export const WEALTH: Record<RaceId, readonly (readonly [Wealth,number])[]> = {
  human:[['poor',45],['modest',35],['comfortable',17],['extreme',3]],
  elf:[['poor',35],['modest',40],['comfortable',22],['extreme',3]],
  dwarf:[['poor',35],['modest',40],['comfortable',22],['extreme',3]],
  beastfolk:[['poor',70],['modest',23],['comfortable',6],['extreme',1]],
  migurd:[['poor',80],['modest',16],['comfortable',3.5],['extreme',0.5]],
  superd:[['poor',90],['modest',9],['comfortable',0.9],['extreme',0.1]],
};
export const OCCUPATIONS: Occupation[] = ['child','student','laborer','farmer','merchant','guard','adventurer','swordsman','mage','healer','cleric','knight','teacher','professor','retired'];
export const PAY: Record<Occupation,number> = {child:0,student:0,laborer:12,farmer:20,merchant:30,guard:28,adventurer:32,swordsman:34,mage:38,healer:30,cleric:28,knight:45,teacher:28,professor:60,retired:0};
export const SUPPORT: Record<Wealth,number> = {poor:10,modest:20,comfortable:40,extreme:90};
export const PURSE: Record<Wealth,number> = {poor:0,modest:12,comfortable:40,extreme:100};
export const FAMILY_FUNDS: Record<Wealth,number> = {poor:0,modest:50,comfortable:400,extreme:1600};
export const LIMITS = {people:64,friends:32,cohorts:256,facts:512,history:128,achievements:64,queue:16,spouses:6,children:12};
export const HAZARDS = {malnutrition:0.018, illness:0.002, unmetCare:0.006, unmetShelter:0.003, unsafe:0.003, persecution:0.135, travel:0.004};
export const EXPANDED_EVENT_IDS = ['memory','reading','practice','work','opportunity','assessment','university','school-year','career','instruction','protection','aid','travel','calamity','succession','conflict','orsted','hitogami','assignment','defect','challenge','defense','courtship','marriage','child','family','discovery','grant','retire','research','service'] as const;
export const validEventId = (id:unknown): id is string => typeof id === 'string' && EXPANDED_EVENT_IDS.some(k=>id===`expanded.${k}`);
