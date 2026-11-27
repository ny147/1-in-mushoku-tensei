import type { ExpandedLife } from "../types";
import { courtCard, courtOption } from "./crown-service";
import { moveByOrdinaryTravel, travelCost } from "./education";
import { canRelocate } from "./succession-restrictions";
import { isRuler } from "./governance";
import { entry, worldYear } from "./facts";

const id = "expanded.long-road-home";
export const isDisplaced = (life: ExpandedLife) =>
  life.region === "demon" && life.expansion.origin.locality === "displaced";

export function roadAvailable(life: ExpandedLife) {
  if (life.phase !== "alive" || worldYear(life) < 417 || life.age < 8 || !isDisplaced(life)) return false;
  const road = life.expansion.longRoadHome;
  if (road) return road.resolution === "pending" && worldYear(life) >= road.dueYear;
  return life.expansion.history.some(h => h.year === 417 && h.code === "calamity" &&
    h.region === "asura" && h.locality === "fittoa" && (h.exposure === "civilian" || h.exposure === "support"));
}

function passageBlock(life: ExpandedLife): readonly [string, string] | undefined {
  if (life.age < 18) return ["Travel opens at age 18.", "เดินทางได้เมื่ออายุ 18 ปี"];
  if (!canRelocate(life, "asura") || isRuler(life))
    return ["Your current travel restrictions prevent boarding.", "ข้อจำกัดการเดินทางในขณะนี้ทำให้คุณขึ้นเรือไม่ได้"];
  if (life.coins < travelCost(life))
    return ["You cannot afford the fare.", "คุณมีเงินไม่พอจ่ายค่าโดยสาร"];
}


export function roadDecision(life: ExpandedLife) {
  if (life.pending !== id || life.expansion.optionalActivity !== id || !roadAvailable(life)) return null;
  const road = life.expansion.longRoadHome;
  const fare = travelCost(life), blocked = passageBlock(life);
  const quote = [`Fare: ${fare} silver, payable only at boarding.`, `ค่าโดยสาร ${fare} เหรียญเงิน จ่ายเมื่อขึ้นเรือเท่านั้น`];
  const due = worldYear(life) + 1;
  if (!road) {
    const card = courtCard(id, ["A place to sleep", "ที่พักค้างคืน"],
      ["The refuge keeper folds back a blanket. At the other end of the bench, a boat clerk opens next year’s passage list.",
       "คนดูแลที่พักคลี่ผ้าห่มให้คุณ ที่ปลายม้านั่งอีกด้าน เสมียนเรือกางสมุดจองที่นั่งสำหรับปีหน้า"]);
    courtOption(card,"refuge",["Stay at the refuge","อยู่ที่พักพิง"],[`You took a free bed. Return in K${due} to recover up to 10 health.`,`คุณรับที่นอนฟรี กลับมาในปี K${due} เพื่อฟื้นสุขภาพสูงสุด 10 หน่วย`]);
    courtOption(card,"passage",["Arrange passage to Asura","จองเรือไปอัสรา"],
      [`Departure from K${due}. ${quote[0]} ${blocked?.[0] ?? "No silver is reserved."}`,`ออกเรือได้ตั้งแต่ K${due} ${quote[1]} ${blocked?.[1] ?? "ยังไม่กันเงินไว้"}`], !!blocked);
    courtOption(card,"later",["Not now","ไว้ภายหลัง"],["You left the offer open without paying.","คุณยังไม่ตัดสินใจและยังไม่ได้จ่ายเงิน"]);
    card.choices[1].outcome = `You reserved a place for Asura from K${due}. No silver changed hands.`;
    card.localized!.choices[id+".passage"].outcome = `คุณจองที่ไปอัสราตั้งแต่ปี K${due} โดยยังไม่จ่ายเงิน`;
    return card;
  }
  const card = courtCard(id, ["A year later", "หนึ่งปีให้หลัง"], road.route === "refuge"
    ? ["The keeper sets out breakfast. For once there is time to finish it before setting out.","คนดูแลยกอาหารเช้ามาให้ คราวนี้คุณมีเวลานั่งกินจนหมดก่อนออกเดินทาง"]
    : ["The boat clerk finds your name. The boat is bound for the countryside of Asura.","เสมียนพบชื่อของคุณในสมุด เรือจะพาคุณไปยังชนบทของอัสรา"]);
  const destination = road.route === "refuge" ? "demon" : "asura";
  const relative = life.expansion.family.people.find(p => p.died === null && p.home === destination);
  if (road.route === "refuge") {
    const gain = Math.min(10,100-life.stats.health);
    courtOption(card,"recover",["Record your recovery","บันทึกการพักฟื้น"],
      [`You rested at the refuge. Health +${Number(gain.toFixed(3))}.`,`คุณพักฟื้นที่ที่พักพิง สุขภาพ +${Number(gain.toFixed(3))}`]);
  } else {
    courtOption(card,"board",["Board for Asura","ขึ้นเรือไปอัสรา"],
      [blocked ? quote[0]+" "+blocked[0] : `You paid ${fare} silver and arrived in the Asuran countryside.`,
       blocked ? quote[1]+" "+blocked[1] : `คุณจ่าย ${fare} เหรียญเงินและเดินทางถึงชนบทของอัสรา`], !!blocked);
    card.choices[0].cost = fare;
    courtOption(card,"wait",["Wait for another departure","รอเรือเที่ยวถัดไป"],["Your passage remains open. You paid nothing.","คุณยังมีสิทธิขึ้นเรือและยังไม่ได้จ่ายเงิน"]);
    courtOption(card,"cancel",["Cancel passage","ยกเลิกการเดินทาง"],["You gave up your passage without charge.","คุณสละสิทธิขึ้นเรือโดยไม่เสียเงิน"]);
  }
  if (relative) {
    const completed = card.choices[0], thai = card.localized!.choices[completed.id];
    completed.outcome += ` The family register lists ${relative.name} in ${destination === "demon" ? "the Demon Continent" : "Asura"}.`;
    thai.outcome += ` ตามทะเบียนครอบครัว ${relative.name} อาศัยอยู่${destination === "demon" ? "บนทวีปปีศาจ" : "ในอัสรา"}`;
  }
  return card;
}

// chooseExpanded checks the live card and deducts its displayed cost once before applying the action.
export function resolveRoadChoice(life: ExpandedLife, choice: string) {
  const road = life.expansion.longRoadHome;
  if (!road && (choice === id+".refuge" || choice === id+".passage")) {
    life.expansion.longRoadHome = {route: choice.endsWith(".refuge") ? "refuge" : "passage", dueYear:worldYear(life)+1, resolution:"pending"};
  } else if (road?.resolution === "pending") {
    if (choice === id+".recover") {
      life.stats.health = Math.min(100,life.stats.health+10);
      road.resolution = "recovered";
    } else if (choice === id+".board") {
      road.resolution = "boarded";
      moveByOrdinaryTravel(life,"asura");
    } else if (choice === id+".cancel") road.resolution = "cancelled";
  }
}

export function closeRoad(life: ExpandedLife, reason: "left" | "ended") {
  const road = life.expansion.longRoadHome;
  if (road?.resolution !== "pending") return;
  road.resolution = reason;
  const en = reason === "left" ? "You left the displaced settlement independently. Your refuge arrangement ended." : "Your refuge arrangement ended with your life.";
  const th = reason === "left" ? "คุณออกจากชุมชนผู้พลัดถิ่นด้วยตนเอง ข้อตกลงที่ที่พักพิงจึงสิ้นสุดลง" : "ข้อตกลงที่ที่พักพิงสิ้นสุดลงเมื่อชีวิตของคุณจบลง";
  entry(life,"long-road-home.closed","The Long Road Home",en,"world");
  life.history[life.history.length-1].message={key:"expanded.education-choice",params:{title:"หนทางไกลกลับบ้าน",text:th}};
}
