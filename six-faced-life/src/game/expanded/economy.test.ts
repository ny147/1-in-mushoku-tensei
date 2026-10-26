import { describe, expect, it } from 'vitest';
import { createExpandedLife } from './origins';
import { applyEconomyYear, survivalRisks } from './economy';
describe('material needs and actual danger',()=>{
  it('uses household resources for children rather than an adult salary',()=>{
    const l=createExpandedLife({seed:1});l.age=4;l.coins=0;l.expansion.economy.support=10;
    applyEconomyYear(l);expect(l.coins).toBe(0);expect(l.expansion.economy.lastIncome).toBe(0);
    expect(l.expansion.economy.unmetCare).toBe(4);expect(l.expansion.economy.unmetShelter).toBe(4);
    expect(survivalRisks(l).find(r=>r.cause==='illness')!.chance).toBeGreaterThan(.002);
  });
  it('records starvation when food is unavailable and rest cannot create food',()=>{
    const l=createExpandedLife({seed:1});l.age=16;l.coins=0;l.focus='rest';l.expansion.career.role='child';l.expansion.economy.support=0;
    applyEconomyYear(l);expect(l.expansion.economy.unmetFood).toBe(8);expect(l.coins).toBe(0);
    expect(survivalRisks(l)[0]).toMatchObject({cause:'malnutrition',chance:.018});
  });
  it('protection and care improve rather than guarantee Superd survival',()=>{
    const l=createExpandedLife({seed:1});l.race='superd';l.age=3;l.expansion.economy.protectionUntil=1500;
    const risk=survivalRisks(l).find(r=>r.cause==='violence')!.chance;
    expect(risk).toBeGreaterThan(0);expect(risk).toBeLessThan(.135);
  });
});
