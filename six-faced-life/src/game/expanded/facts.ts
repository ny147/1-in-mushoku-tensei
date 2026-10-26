import type { ExpandedLife } from '../types';
import type { Fact } from './types';
export const worldYear = (life:ExpandedLife) => life.expansion.birthYear+life.age;
export function fact(life:ExpandedLife, kind:Fact['kind'], code:string, detail='', value=0) {
  const x=life.expansion;
  x.facts.push({id:x.nextId++,year:worldYear(life),kind,code,detail:detail.slice(0,150),value});
  // Durable ledgers retain occupations, marriages, counts and history independently.
  if(x.facts.length>512)x.facts.splice(0,x.facts.length-512);
}
export function entry(life:ExpandedLife, code:string, title:string, text:string, kind:'life'|'choice'|'world'|'training'|'ending'='life', detail='') {
  life.history.push({id:(life.history.at(-1)?.id??0)+1,age:life.age,title,text,kind,message:{key:`expanded.${code}`,params:detail?{detail}:undefined}});
  if(life.history.length>600)life.history.shift();
}
