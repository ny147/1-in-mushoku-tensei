import { describe, expect, it } from 'vitest';
import { CAREER_NODES, CAREER_PATHS } from '../game/expanded/career-catalogue';
import { careerNodeText, careerPathText, careerProjectText } from './careers';
describe('career localization',()=>{
  it('provides original English and Thai for every node and path',()=>{
    for(const n of Object.values(CAREER_NODES)){
      expect(careerNodeText(n.id,'en').length).toBeGreaterThan(2);
      expect(careerNodeText(n.id,'th')).toMatch(/[ก-๙]/);
    }
    for(const p of CAREER_PATHS)expect(careerPathText(p.id,'th')).toMatch(/[ก-๙]/);
  });
  it('discloses upfront costs, chance and failure without promising success',()=>{
    const q={branch:'adventure' as const,cost:4,successChance:0.75,failureHealth:8,success:{units:0,milestones:1,requests:4,silver:16,service:0,trust:0,research:0}};
    expect(careerProjectText(q,'en')).toContain('Upfront cost: 4 silver');
    expect(careerProjectText(q,'en')).toContain('Success chance 75%');
    expect(careerProjectText(q,'th')).toContain('สุขภาพ −8');
  });
});
