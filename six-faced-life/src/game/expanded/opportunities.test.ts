import { describe,expect,it } from 'vitest';
import { createExpandedLife } from './origins';
import { beginLife, choose, getDecision } from '../engine';
describe('playable expanded opportunities',()=>{
  it('offers actual scholarship and ordinary work choices with requirements applied',()=>{
    const l=createExpandedLife({seed:1});l.phase='alive';l.age=15;l.stats.knowledge=50;l.training.magicXp=80;l.expansion.genetics.magicTalent=true;l.pending='expanded.assessment';
    const tested=choose(l,'expanded.assessment.take');tested.pending='expanded.university';
    expect(getDecision(tested)?.choices.some(c=>c.id==='expanded.university.enroll'&&!c.disabled)).toBe(true);
    const enrolled=choose(tested,'expanded.university.enroll');if(enrolled.ruleset!=='expanded-1')throw Error('expanded');
    expect(enrolled.expansion.education.stage).toBe('university');
    const work=createExpandedLife({seed:1});work.phase='alive';work.age=15;work.pending='expanded.work';
    const farmer=choose(work,'expanded.work.farmer');if(farmer.ruleset!=='expanded-1')throw Error('expanded');expect(farmer.expansion.career.role).toBe('farmer');
  });
  it('rejects invalidated adult opportunities while draining the queue',()=>{
    const l=beginLife(createExpandedLife({seed:1}));if(l.ruleset!=='expanded-1')throw Error('expanded');
    l.expansion.queue=['expanded.orsted'];const n=choose(l,'expanded.memory.observe');expect(n.pending).not.toBe('expanded.orsted');
  });
});
