import { describe,expect,it } from 'vitest';
import { createExpandedLife } from './origins';
import { finishLife } from '../engine';
import { buildSummary, legacySummary } from './summary';
import { isLife, loadGame } from '../storage';
import { createLife } from '../legacy/engine';
describe('factual immutable retrospectives',()=>{
  it('records actual style ranks, last selection and completion years only when present',()=>{
    const l=createExpandedLife({seed:1});l.age=40;const s=l.expansion.swords!;s.selected='water-god';s.tracks['sword-god']={xp:560,cap:4};s.completed['sword-god'][4]=l.expansion.birthYear+39;finishLife(l,'aging');
    const work=l.expansion.summary!.sections.find(s=>s.key==='work')!;
    expect(work.en).toContain('Sword God: King');expect(work.en).toContain('Last selected: Water God');expect(work.en).toContain(`K${l.expansion.birthYear+39}`);expect(work.th).toContain('เทพดาบ');
    const old=createExpandedLife({seed:2});delete old.expansion.swords;finishLife(old,'illness');expect(old.expansion.summary!.sections.find(s=>s.key==='work')!.en).not.toContain('Last selected');
  });
  it('captures early deaths without inventing marriage, degree or hidden diagnoses',()=>{
    const l=createExpandedLife({seed:1});l.age=3;l.expansion.genetics.carrier=true;l.expansion.genetics.manifestation='mana';
    finishLife(l,'illness');expect(l.expansion.summary).toEqual(buildSummary(l));expect(l.expansion.summary!.spouseCount).toBe(0);
    expect(l.expansion.summary!.narrative.en).not.toContain('Laplace');expect(l.expansion.summary!.narrative.en.split(/\s+/).length).toBeGreaterThanOrEqual(80);
    expect(isLife(l)).toBe(true);
    const before=JSON.stringify(l);loadGame({getItem:()=>JSON.stringify({version:1,active:l,archive:[l]}),setItem:()=>{throw Error('no write');}});expect(JSON.stringify(l)).toBe(before);
  });
  it('keeps legacy unknown descendants distinct from a verified zero',()=>{
    const old=createLife({seed:1});expect(legacySummary(old).descendants).toBeNull();expect(legacySummary(old).marriages).toBeNull();
  });
  it('retains a completed bilingual snapshot without rendering or replaying the simulation',()=>{
    const l=createExpandedLife({seed:1});l.age=40;l.expansion.career.role='farmer';l.expansion.career.records.farmer.years=25;l.expansion.education.stage='withdrawn';finishLife(l,'aging');
    const s=l.expansion.summary!;expect(s.sections.map(r=>r.key)).toEqual(['identity','childhood','work','public','family','legacy']);expect(s.narrative.th).toMatch(/[ก-๙]/);expect(s.narrative.en.split(/\s+/).length).toBeGreaterThanOrEqual(200);
    expect(s.survivingDescendants).toBe(0);expect(s.sections.find(s=>s.key==='work')!.en).toContain('Farmer');
  });
});
