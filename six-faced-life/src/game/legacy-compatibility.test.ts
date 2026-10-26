import { describe, expect, it } from 'vitest';
import baseline from './fixtures/legacy-baseline.json';
import { advance, beginLife, choose, createLife, getDecision } from './engine';
import { isLife, loadGame } from './storage';
import type { Language } from './types';

const hash = async (value: unknown) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value))))).map(v=>v.toString(16).padStart(2,'0')).join('');
describe('frozen legacy compatibility', () => {
  it('reproduces every action of 200 pre-expansion lives including random state', async () => {
    for (const record of baseline.records) {
      let life = createLife({seed:record.seed, language:record.language as Language, name:'Baseline'});
      expect(await hash(life)).toBe(record.checkpoints[0]);
      life = beginLife(life);
      expect(await hash(life)).toBe(record.checkpoints[1]);
      for (const checkpoint of record.checkpoints.slice(2)) {
        const decision = getDecision(life);
        const choice = decision?.choices.find(c => !c.disabled && (c.cost ?? 0) <= life.coins && !c.risk)
          ?? decision?.choices.find(c => !c.disabled && (c.cost ?? 0) <= life.coins);
        life = decision ? choose(life, choice!.id) : advance(life, 'year');
        expect(await hash(life), `seed ${record.seed}, age ${life.age}`).toBe(checkpoint);
      }
      expect(life.phase).toBe('ended');
    }
  }, 60_000);
  it('rejects unknown rules without rewriting the original storage', () => {
    const life = {...createLife({seed:4}), ruleset:'future-9'};
    expect(isLife(life)).toBe(false);
    let writes = 0;
    const raw = JSON.stringify({version:1, active:life, archive:[]});
    const result = loadGame({getItem:()=>raw, setItem:()=>{ writes++; }});
    expect(result.error).toBeTruthy();
    expect(writes).toBe(0);
  });
});
