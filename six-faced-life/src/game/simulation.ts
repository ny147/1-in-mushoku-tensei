import type { ExpandedLife, Life } from './types';
import { MANUAL } from './expanded/events';
export const isExpanded=(life:Life):life is ExpandedLife=>life.ruleset==='expanded-1';
export function canAutoChoose(life:Life):boolean {return !isExpanded(life)||!MANUAL.has(life.pending?.slice(9)??'');}
