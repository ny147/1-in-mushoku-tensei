import type { MagicSchool } from '../types';
import type { Occupation } from './types';
import { CAREER_BRANCHES, type CareerBranchId, type CareerNodeId, type CareerPathId } from './career-catalogue';
export interface CareerPathState {
  version:1;
  active:CareerNodeId|null;
  earned:Partial<Record<CareerNodeId,{year:number|null;source:'earned'|'inherited'}>>;
  work:Record<CareerBranchId,{years:number;units:number;milestones:number}>;
  requests:number; lastWorkYear:number; lastProjectYear:number;
  payFloor:Partial<Record<Occupation,number>>;
  selection:CareerPathId|null;
  teaching:'magic'|'sword'|null;
  teacherCourse:{kind:'magic'|'sword';school:MagicSchool|null}|null;
  recent:{year:number;node:CareerNodeId;code:string;units:number}[];
}
export function emptyCareerPaths(year:number):CareerPathState {
  return {version:1,active:null,earned:{},work:Object.fromEntries(CAREER_BRANCHES.map(b=>[b,{years:0,units:0,milestones:0}])) as CareerPathState['work'],requests:0,lastWorkYear:year-1,lastProjectYear:year-1,payFloor:{},selection:null,teaching:null,teacherCourse:null,recent:[]};
}
