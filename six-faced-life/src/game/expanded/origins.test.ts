import { describe, expect, it } from 'vitest';
import { createExpandedLife } from './origins';
import { isLife, loadGame, SAVE_KEY } from '../storage';

describe('expanded origins and validation', () => {
  it('creates stable independent streams and coherent unequal births over 10,000 seeds', () => {
    const years = new Set<number>(); const counts: Record<string, number> = {};
    let superd = 0; let noble = 0;
    for (let seed = 0; seed < 10_000; seed++) {
      const life = createExpandedLife({seed});
      expect(isLife(life), `seed ${seed}`).toBe(true);
      years.add(life.expansion.birthYear);
      if (['migurd','superd'].includes(life.race)) expect(life.birthRegion).toBe('demon');
      if (life.race === 'superd') superd++;
      if (life.expansion.origin.status === 'noble') {
        noble++; expect(['comfortable','extreme']).toContain(life.expansion.origin.wealth);
      }
      counts[life.race] = (counts[life.race] ?? 0) + 1;
    }
    expect([...years].sort()).toEqual(Array.from({length:31}, (_,i)=>397+i));
    expect(superd).toBeGreaterThan(15); expect(noble).toBeGreaterThan(50);
    expect(Object.keys(counts)).toHaveLength(6);
    expect(createExpandedLife({seed:42})).toEqual(createExpandedLife({seed:42}));
  }, 30_000);
  it('preserves valid expanded records and rejects malformed nested facts without rewriting', () => {
    const life = createExpandedLife({seed:42});
    const load = (active:unknown) => loadGame({getItem:key=>key===SAVE_KEY?JSON.stringify({version:1, active, archive:[]}):null,setItem:()=>{throw Error('must not write');}});
    expect(load(life).data.active).toEqual(life);
    for (const mutate of [
      (l:typeof life)=>{l.expansion.version = 2 as 1;},
      (l:typeof life)=>{l.expansion.birthYear = NaN;},
      (l:typeof life)=>{l.expansion.familyRng = -1;},
      (l:typeof life)=>{l.expansion.queue = ['foreign'];},
      (l:typeof life)=>{l.expansion.family.people[0].parents = [l.expansion.family.people[0].id];},
      (l:typeof life)=>{l.expansion.family.people.push(l.expansion.family.people[0]);},
    ]) { const bad = structuredClone(life); mutate(bad); expect(load(bad).error).toBeTruthy(); }
  });
});
