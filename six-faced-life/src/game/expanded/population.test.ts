import { describe, expect, it } from 'vitest';
import { createExpandedLife } from './origins';
import { applyEconomyYear, checkSurvival } from './economy';
describe('frozen childhood survival cohorts',()=>{
  it('meets the Superd mortality target with effective protection in 10,000 births',()=>{
    let attempts=0, births=0, deaths=0, protectedDeaths=0;
    while(births<10000){
      const life=createExpandedLife({seed:Math.imul(attempts++,2654435761)>>>0});if(life.race!=='superd')continue;
      births++;const protectedLife=structuredClone(life);protectedLife.expansion.economy.support=40;protectedLife.expansion.economy.protectionUntil=1500;
      for(const [l,protectedFlag] of [[life,false],[protectedLife,true]] as const){
        l.phase='alive';
        for(l.age=1;l.age<15;l.age++){applyEconomyYear(l);if(checkSurvival(l)){if(protectedFlag)protectedDeaths++;else deaths++;break;}}
      }
    }
    console.info(JSON.stringify({cohort:'Superd',attempts,births,deaths,protectedDeaths}));
    expect(deaths/10000).toBeGreaterThanOrEqual(.87);expect(deaths/10000).toBeLessThanOrEqual(.93);
    expect((deaths-protectedDeaths)/10000).toBeGreaterThanOrEqual(.10);
  },60000);
  it('makes poor childhood at least twice as dangerous with a five-point gap for every other race',()=>{
    for(const race of ['human','elf','dwarf','migurd','beastfolk'] as const){
      let poor=0,comfortable=0;
      for(let seed=0;seed<10000;seed++){
        const l=createExpandedLife({seed});l.race=race;
        for(const support of [10,40]){const life=structuredClone(l);life.expansion.economy.support=support;
          for(life.age=1;life.age<15;life.age++){applyEconomyYear(life);if(checkSurvival(life)){if(support===10)poor++;else comfortable++;break;}}
        }
      }
      console.info(JSON.stringify({race,poor,comfortable}));expect(poor).toBeGreaterThanOrEqual(comfortable*2);expect(poor-comfortable).toBeGreaterThanOrEqual(500);expect(poor).toBeLessThan(10000);expect(comfortable).toBeGreaterThan(0);
    }
  },60000);
});
