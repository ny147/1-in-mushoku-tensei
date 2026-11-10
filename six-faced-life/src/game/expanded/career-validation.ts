import type { ExpandedLife } from "../types";
import {
  CAREER_BRANCHES,
  CAREER_NODES,
  isCareerNode,
  isCareerPath,
} from "./career-catalogue";
import { worldYear } from "./facts";
import { PAY } from "./balance";
const obj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);
const int = (v: unknown, min = 0, max = 1_000_000): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= min && v <= max;
const schools = ["water", "fire", "earth", "wind", "healing"];
export function validateCareerPaths(value: unknown, l: ExpandedLife): boolean {
  if (value === undefined) return true;
  if (!obj(value) || value.version !== 1) return false;
  const s = value,
    y = worldYear(l),
    born = l.expansion.birthYear;
  const year = (v: unknown) => int(v, born - 1, y);
  if (
    !(s.active === null || isCareerNode(s.active)) ||
    !obj(s.earned) ||
    !obj(s.work) ||
    !obj(s.payFloor) ||
    !int(s.requests) ||
    !year(s.lastWorkYear) ||
    !year(s.lastProjectYear) ||
    !(s.selection === null || isCareerPath(s.selection)) ||
    ![null, "magic", "sword"].includes(s.teaching as string | null) ||
    !Array.isArray(s.recent) ||
    s.recent.length > 64
  )
    return false;
  for (const [id, r] of Object.entries(s.earned)) {
    if (
      !isCareerNode(id) ||
      !obj(r) ||
      !["earned", "inherited"].includes(String(r.source)) ||
      !(r.year === null ? r.source === "inherited" : int(r.year, born, y))
    )
      return false;
  }
  if (Object.keys(s.work).length !== CAREER_BRANCHES.length) return false;
  for (const key of CAREER_BRANCHES) {
    const w = s.work[key];
    if (
      !Object.hasOwn(s.work, key) ||
      !obj(w) ||
      !int(w.years) ||
      !int(w.units) ||
      !int(w.milestones)
    )
      return false;
  }
  for (const [key, v] of Object.entries(s.payFloor)) {
    if (
      !Object.hasOwn(PAY, key) ||
      PAY[key as keyof typeof PAY] === 0 ||
      typeof v !== "number" ||
      !Number.isFinite(v) ||
      v < 0 ||
      v > 1_000_000
    )
      return false;
  }
  if (s.active !== null) {
    const id = s.active as keyof typeof CAREER_NODES;
    if (
      !Object.hasOwn(s.earned, id) ||
      CAREER_NODES[id].occupation !== l.expansion.career.role
    )
      return false;
  } else if (PAY[l.expansion.career.role] > 0) return false;
  if (s.teacherCourse !== null) {
    const t = s.teacherCourse;
    if (
      !obj(t) ||
      !(t.kind === "sword"
        ? t.school === null
        : t.kind === "magic" && schools.includes(String(t.school)))
    )
      return false;
  }
  return s.recent.every(
    (r) =>
      obj(r) &&
      year(r.year) &&
      isCareerNode(r.node) &&
      typeof r.code === "string" &&
      /^[a-z-]{1,64}$/.test(r.code) &&
      int(r.units),
  );
}
