import { describe, expect, it } from 'vitest';
import { advance, beginLife, choose, createLife, getDecision } from '../engine';
import { createExpandedLife } from './origins';
import { canAutoChoose } from '../simulation';
import { isLife } from '../storage';
const ready = () => choose(beginLife(createExpandedLife({seed:42})), 'expanded.memory.observe');
describe('expanded annual transactions', () => {
  it('routes explicit expanded creation without changing the legacy default', () => {
    expect(createLife({seed:1,ruleset:'expanded-1'}).ruleset).toBe('expanded-1');
    expect(createLife({seed:1}).ruleset).toBeUndefined();
  });
  it('drains same-year decisions without repeating annual effects and survives reload exactly', () => {
    const life = ready(); if(life.ruleset!=='expanded-1')throw Error('expanded');
    life.pending='expanded.reading'; life.expansion.queue=['expanded.practice'];
    const next=choose(life,'expanded.reading.learn');
    expect(next.age).toBe(life.age); expect(next.pending).toBe('expanded.practice');
    expect(choose(JSON.parse(JSON.stringify(next)),'expanded.practice.magic')).toEqual(choose(next,'expanded.practice.magic'));
    expect(advance(next,'year')).toBe(next);
    expect(isLife(next)).toBe(true);
  });
  it('does not mutate original states or accept invalid ticks and choices', () => {
    const life=ready(), raw=JSON.stringify(life);
    expect(advance(life,'tick',NaN)).toBe(life);
    expect(choose(life,'foreign')).toBe(life);
    advance(life,'year'); expect(JSON.stringify(life)).toBe(raw);
  });
  it('requires manual faction, marriage, military and title decisions', () => {
    const life=ready();
    for(const id of ['orsted','hitogami','marriage','service','challenge']) {
      life.pending=`expanded.${id}`;
      expect(canAutoChoose(life)).toBe(false);
    }
  });
  it('handles birth-year history after the first memory before any annual tick', () => {
    const life=createExpandedLife({seed:1});life.expansion.birthYear=417;
    const next=choose(beginLife(life),'expanded.memory.observe');
    expect(next.age).toBe(0);expect(getDecision(next)?.id).toBe('expanded.calamity');
  });
});
