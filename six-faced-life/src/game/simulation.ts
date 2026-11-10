import type { ExpandedLife, Life, MagicSchool } from "./types";
import { MANUAL, getExpandedDecision } from "./expanded/events";
import {
  setSpecialization as legacyStudy,
  careerTitle as legacyTitle,
} from "./progression";
import { expandedLabel } from "../i18n/expanded";
import { careerNode } from './expanded/career-paths';
import { careerNodeText } from '../i18n/careers';
export const isExpanded = (life: Life): life is ExpandedLife =>
  life.ruleset === "expanded-1";
export function canAutoChoose(life: Life): boolean {
  return !isExpanded(life) || (!MANUAL.has(life.pending?.slice(9) ?? "")&&!getExpandedDecision(life)?.requiresManual);
}
export function setSpecialization(life: Life, school: MagicSchool): Life {
  const next = legacyStudy(life, school);
  if (next !== life && next.ruleset === "expanded-1")
    next.expansion.study = school;
  return next;
}
export function careerTitle(life: Life): string {
  if(life.ruleset==='expanded-1' && life.phase!=='ended') {
    const node=careerNode(life);if(node)return careerNodeText(node.id,life.language??'en');
  }
  return life.ruleset === "expanded-1"
    ? expandedLabel(life.expansion.career.role, life.language ?? "en")
    : legacyTitle(life);
}
