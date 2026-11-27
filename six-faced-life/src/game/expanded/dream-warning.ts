import type { ExpandedLife } from "../types";
import { courtCard, courtOption } from "./crown-service";
import { dispatches, dispatchTitle } from "./dream-dispatch";

const id = "expanded.hitogami-dream";
const trustGain = (life: ExpandedLife) => Math.min(6, 100 - life.expansion.politics.trust);

export function dreamAvailable(life: ExpandedLife) {
  return life.phase === "alive" && life.age >= 18 && life.expansion.politics.faction === "hitogami" &&
    life.expansion.politics.dreamWarning !== "closed";
}

export function dreamDecision(life: ExpandedLife) {
  if (life.pending !== id || life.expansion.optionalActivity !== id || !dreamAvailable(life)) return null;
  const stage = life.expansion.politics.dreamWarning;
  if (stage === "stopped" || stage === "passed") {
    const card = courtCard(id, dispatchTitle, dispatches[stage]);
    courtOption(card, "read", ["Record the dispatch", "บันทึกข่าวจากท่าเรือ"], dispatches[stage]);
    card.choices[0].description = "Keep this account in your chronicle.";
    card.localized!.choices[id + ".read"].description = "เก็บเรื่องนี้ไว้ในบันทึกชีวิต";
    return card;
  }
  const card = courtCard(id, ["The Dream’s Warning", "คำเตือนในฝัน"],
    ["In the dream, Hitogami draws a cartwheel in the dust. “Keep the oil cart from the ferry today.” You ask why. He wipes the wheel away.",
     "ในฝัน ฮิโตงามิวาดวงล้อเกวียนลงบนฝุ่น “วันนี้อย่าให้เกวียนน้ำมันไปถึงท่าเรือ” เมื่อคุณถามว่าทำไม เขาก็ลบรอยล้อทิ้ง"]);
  const gain = trustGain(life);
  courtOption(card, "stop", ["Stop the oil cart", "รั้งเกวียนน้ำมันไว้"],
    [`You persuaded the driver to wait until morning. Faction trust +${gain}.`,
     `คุณเกลี้ยกล่อมให้คนขับรอจนถึงเช้า ความไว้วางใจของฝ่าย +${gain}`]);
  courtOption(card, "pass", ["Let the delivery pass", "ปล่อยให้เกวียนไปส่งของ"],
    ["You kept the dream to yourself. The delivery went through.", "คุณเก็บเรื่องความฝันไว้กับตัว เกวียนจึงไปส่งของตามเดิม"]);
  return card;
}

export function resolveDreamChoice(life: ExpandedLife, choice: string) {
  const politics = life.expansion.politics;
  if (!dreamAvailable(life)) return;
  if (politics.dreamWarning === undefined) {
    if (choice === id + ".stop") {
      politics.trust += trustGain(life);
      politics.dreamWarning = "stopped";
    } else if (choice === id + ".pass") {
      politics.dreamWarning = "passed";
    }
  } else if (choice === id + ".read") {
    politics.dreamWarning = "closed";
  }
}
