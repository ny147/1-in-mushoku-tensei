import type { Decision, ExpandedLife } from '../types';
import { emptySwordState, SWORD_STYLES, SWORD_NAMES, type SwordRank } from './sword-state';
import { ORDINARY_ROLES, ordinaryEntry } from './career-access';
import { talentMultiplier } from './genetics';
export function migrateSwordState(l: ExpandedLife, offered: Decision | null): ExpandedLife {
  if(l.phase==='ended'||l.expansion.swords!==undefined) return l;
  const n=structuredClone(l), s=emptySwordState();
  const track={xp:l.training.swordXp,cap:Math.max(2,l.training.swordCap) as SwordRank};
  const known=SWORD_STYLES.find(k=>l.training.school===SWORD_NAMES[k]||l.training.school===k);
  if(known){s.selected=known; s.tracks[known]=track;} else s.legacy=track;
  s.compatibilityDecision=offered?structuredClone(offered):null;
  for(const role of ORDINARY_ROLES){ const c=ordinaryEntry(role), r=l.expansion.training?.records[role];
    s.courseCredit[role]=r&&c.sword?Math.ceil(c.sword*r.units/c.units)*talentMultiplier(l,'sword'):0;
  }
  n.expansion.swords=s;
  // Preserve the old mirror exactly while an already offered decision is outstanding.
  return n;
}
