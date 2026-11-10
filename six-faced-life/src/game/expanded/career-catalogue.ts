import type { Occupation } from './types';

export const CAREER_BRANCHES = ['everyday','farming','trade','sword','guard','knight','adventure','mage','academic','instructor','healer','cleric'] as const;
export type CareerBranchId = typeof CAREER_BRANCHES[number];
export const CAREER_PATHS = [
  { id: 'livelihood', branches: ['everyday','farming'] },
  { id: 'trade', branches: ['trade'] },
  { id: 'martial', branches: ['sword','guard','knight','instructor'] },
  { id: 'adventure', branches: ['adventure'] },
  { id: 'magic', branches: ['mage','academic'] },
  { id: 'healing', branches: ['healer','cleric'] },
] as const satisfies readonly { id:string; branches:readonly CareerBranchId[] }[];
export type CareerPathId = typeof CAREER_PATHS[number]['id'];
export const CAREER_NODE_IDS = ['laborer','farmhand','farmer','farm-steward','trade-assistant','merchant','established-merchant','trade-leader','swordsman','senior-swordsman','guard','guard-captain','sworn-service','knight','knight-commander','adventure-f','adventure-d','adventure-b','adventure-s','mage','senior-mage','master-practitioner','magic-teacher','researcher','professor','sword-instructor','healer','senior-healer','clinic-leader','cleric','senior-cleric','teacher-unspecified'] as const;
export type CareerNodeId = typeof CAREER_NODE_IDS[number];
export interface CareerNode {
  id: CareerNodeId; path: CareerPathId|null; branch:CareerBranchId;
  occupation: Occupation; pay:number; predecessor:CareerNodeId|null;
  title:string; tier:0|1|2|3;
}
const node = (id:CareerNodeId,path:CareerPathId|null,branch:CareerBranchId,occupation:Occupation,pay:number,title:string,predecessor:CareerNodeId|null=null,tier:0|1|2|3=0):CareerNode =>
  ({id,path,branch,occupation,pay,title,predecessor,tier});
export const CAREER_NODES: Readonly<Record<CareerNodeId,CareerNode>> = Object.fromEntries([
  node('laborer','livelihood','everyday','laborer',18,'Laborer'),
  node('farmhand','livelihood','farming','farmer',20,'Farmhand'),
  node('farmer','livelihood','farming','farmer',28,'Farmer','farmhand',1),
  node('farm-steward','livelihood','farming','farmer',52,'Farm Steward','farmer',2),
  node('trade-assistant','trade','trade','merchant',24,'Trade Assistant'),
  node('merchant','trade','trade','merchant',30,'Merchant','trade-assistant',1),
  node('established-merchant','trade','trade','merchant',48,'Established Merchant','merchant',2),
  node('trade-leader','trade','trade','merchant',62,'Trading House Leader','established-merchant',3),
  node('swordsman','martial','sword','swordsman',34,'Swordsman'),
  node('senior-swordsman','martial','sword','swordsman',52,'Senior Swordsman','swordsman',2),
  node('guard','martial','guard','guard',28,'Guard'),
  node('guard-captain','martial','guard','guard',60,'Guard Captain','guard',2),
  node('sworn-service','martial','knight','guard',36,'Sworn service'),
  node('knight','martial','knight','knight',45,'Knight','sworn-service',1),
  node('knight-commander','martial','knight','knight',77,'Knight Commander','knight',2),
  node('adventure-f','adventure','adventure','adventurer',32,'F-rank Adventurer'),
  node('adventure-d','adventure','adventure','adventurer',40,'D-rank Adventurer','adventure-f',1),
  node('adventure-b','adventure','adventure','adventurer',50,'B-rank Adventurer','adventure-d',2),
  node('adventure-s','adventure','adventure','adventurer',64,'S-rank Adventurer','adventure-b',3),
  node('mage','magic','mage','mage',38,'Practicing Mage'),
  node('senior-mage','magic','mage','mage',56,'Senior Mage','mage',1),
  node('master-practitioner','magic','mage','mage',70,'Master Practitioner','senior-mage',2),
  node('magic-teacher','magic','academic','teacher',28,'Magic Teacher'),
  node('researcher','magic','academic','teacher',46,'Researcher','magic-teacher',1),
  node('professor','magic','academic','professor',60,'Professor','researcher',2),
  node('sword-instructor','martial','instructor','teacher',28,'Sword Instructor'),
  node('healer','healing','healer','healer',30,'Healer'),
  node('senior-healer','healing','healer','healer',48,'Senior Healer','healer',1),
  node('clinic-leader','healing','healer','healer',62,'Clinic Leader','senior-healer',2),
  node('cleric','healing','cleric','cleric',28,'Cleric'),
  node('senior-cleric','healing','cleric','cleric',60,'Senior Cleric','cleric',2),
  node('teacher-unspecified',null,'instructor','teacher',28,'Teacher'),
].map(n=>[n.id,n])) as Record<CareerNodeId,CareerNode>;
export const isCareerNode = (v:unknown):v is CareerNodeId => typeof v==='string' && Object.hasOwn(CAREER_NODES,v);
export const isCareerPath = (v:unknown):v is CareerPathId => CAREER_PATHS.some(p=>p.id===v);

