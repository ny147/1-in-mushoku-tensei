import type { ExpandedLife } from "../types";
import { entry } from "./facts";

export const dispatchTitle = ["Word from the ferry", "ข่าวจากท่าเรือ"] as const;
export const dispatches = {
  stopped: [
    "The ferry clinic ran out of lamp oil and stitched a boatman’s hand by candlelight. The patrol turned back without finding the ferryman who had carried fugitives across.",
    "น้ำมันตะเกียงที่สถานพยาบาลริมท่าหมด หมอต้องเย็บแผลที่มือคนเรือด้วยแสงเทียน ส่วนทหารลาดตระเวนย้อนกลับไปโดยไม่พบคนแจวเรือที่เคยพาผู้หลบหนีข้ามฟาก",
  ],
  passed: [
    "The oil reached the ferry clinic in time to light the room for a boatman’s stitches. A patrol followed the cart, found the ferryman who had carried fugitives across, and took him away.",
    "น้ำมันถึงสถานพยาบาลริมท่าทันจุดตะเกียงให้หมอเย็บแผลที่มือคนเรือ แต่ทหารลาดตระเวนตามเกวียนมาพบคนแจวเรือที่เคยพาผู้หลบหนีข้ามฟากและจับตัวเขาไป",
  ],
} as const;

export function closeDreamOnDefection(life: ExpandedLife) {
  const politics = life.expansion.politics;
  const stage = politics.dreamWarning;
  if (stage !== "stopped" && stage !== "passed") return;
  const [en, th] = dispatches[stage];
  entry(life, "dream-dispatch", dispatchTitle[0], en, "world");
  life.history[life.history.length - 1].message = {
    key: "expanded.education-choice", params: {title: dispatchTitle[1], text: th},
  };
  politics.dreamWarning = "closed";
}
