import type { ExpandedLife } from "../types";
import { courtCard, courtOption } from "./crown-service";
import { assessTalent, talentAssessmentScore, UNIVERSITY_KNOWLEDGE, SCHOLARSHIP_SCORE } from "./education";
import { worldYear } from "./facts";

const id = "expanded.beastfolk-mentor";
const title = ["A Letter to Ranoa", "จดหมายถึงราโนอา"] as const;

function canMeetMentor(life: ExpandedLife) {
  const stage = life.expansion.education.stage;
  return life.phase === "alive" && life.race === "beastfolk" && life.region === "forest" &&
    stage !== "university" && stage !== "graduated";
}

export function mentorAvailable(life: ExpandedLife) {
  if (!canMeetMentor(life) || life.age < 12) return false;
  const mentor = life.expansion.beastfolkMentor;
  return !mentor || (!mentor.completed && worldYear(life) > mentor.startedYear);
}

export function creditMentorStudy(life: ExpandedLife) {
  const mentor = life.expansion.beastfolkMentor;
  if (mentor && !mentor.completed && mentor.studiedYear === undefined &&
    life.focus === "study" && canMeetMentor(life)) {
    mentor.studiedYear = worldYear(life);
  }
}

export function mentorDecision(life: ExpandedLife) {
  if (life.pending !== id || life.expansion.optionalActivity !== id || !mentorAvailable(life)) return null;
  const mentor = life.expansion.beastfolkMentor;
  if (!mentor) {
    const admissionHint = life.age < 15 ? [
      " If Ranoa offers a place before the letter is ready, you can defer and apply again later.",
      " หากราโนอาเสนอที่เรียนก่อนจดหมายพร้อม คุณเลื่อนการตัดสินใจและกลับมาสมัครภายหลังได้",
    ] : ["", ""];
    const card = courtCard(id, title, [
      "A forest teacher sets a worn primer before you. She offers lessons and, once you’re old enough and ready, a recommendation for a scholarship at Ranoa.",
      "ครูในป่าวางหนังสือเรียนเล่มเก่าตรงหน้าคุณ เธอเสนอจะสอนให้ และเมื่อคุณอายุถึงเกณฑ์และพร้อมแล้ว เธอจะเขียนจดหมายแนะนำเพื่อขอทุนที่ราโนอา",
    ]);
    courtOption(card, "study", ["Accept the lessons", "รับข้อเสนอเรียนกับครู"], [
      "Your mentor lent you a primer. Choose Read & learn and spend a year in the Great Forest, then visit her again." + admissionHint[0],
      "ครูให้คุณยืมหนังสือเรียน เลือกอ่านและเรียนรู้ ใช้เวลาหนึ่งปีในป่าใหญ่ แล้วกลับมาพบเธออีกครั้ง" + admissionHint[1],
    ]);
    courtOption(card, "later", ["Come back later", "กลับมาภายหลัง"], [
      "The teacher left the offer open.", "ครูยังเปิดโอกาสให้คุณกลับมาเรียน",
    ]);
    return card;
  }

  const studied = mentor.studiedYear !== undefined;
  const knowledge = Math.floor(life.stats.knowledge);
  const score = talentAssessmentScore(life);
  const ready = life.age >= 15 && studied && knowledge >= UNIVERSITY_KNOWLEDGE && score >= SCHOLARSHIP_SCORE;
  const card = courtCard(id, title, [
    "Your mentor has an envelope for Ranoa on her desk. Beside it is a request for help sorting seedlings at the forest nursery.",
    "บนโต๊ะของครูมีซองจดหมายถึงราโนอา ข้างกันนั้นมีใบขอคนช่วยคัดต้นกล้าที่เรือนเพาะชำของชุมชน",
  ]);
  courtOption(card, "letter", ["Ask for the recommendation", "ขอจดหมายแนะนำ"], ready ? [
    "Your mentor assessed you and wrote the letter. Open University admission to use your full scholarship, including travel and living costs.",
    "ครูประเมินคุณและเขียนจดหมายให้ เปิดเมนูสมัครมหาวิทยาลัยเพื่อใช้ทุนเต็มจำนวนที่รวมค่าเดินทางและค่าครองชีพ",
  ] : [
    `Requires age 15, a year of Read & learn in the Great Forest (${studied ? "complete" : "pending"}), Knowledge ${knowledge}/${UNIVERSITY_KNOWLEDGE}, and assessment ${score}/${SCHOLARSHIP_SCORE}.`,
    `ต้องมีอายุ 15 ปี อ่านและเรียนรู้ในป่าใหญ่หนึ่งปี (${studied ? "ครบแล้ว" : "ยังไม่ครบ"}) ความรู้ ${knowledge}/${UNIVERSITY_KNOWLEDGE} และคะแนนประเมิน ${score}/${SCHOLARSHIP_SCORE}`,
  ], !ready);
  const pay = Math.min(12, 1_000_000 - life.coins);
  courtOption(card, "local-work", ["Take the nursery job", "รับงานที่เรือนเพาะชำ"], life.age >= 15 ? [
    `You sorted seedlings for the nursery and earned ${pay} silver. The mentorship is complete.`,
    `คุณช่วยคัดต้นกล้าที่เรือนเพาะชำและได้รับ ${pay} เหรียญเงิน การเรียนกับครูสิ้นสุดลงแล้ว`,
  ] : ["Available from age 15.", "รับงานได้ตั้งแต่อายุ 15 ปี"], life.age < 15);
  card.choices[1].coins = pay;
  courtOption(card, "later", ["Come back later", "กลับมาภายหลัง"], [
    "You kept both options open.", "คุณเก็บทั้งสองทางเลือกไว้ตัดสินใจภายหลัง",
  ]);
  return card;
}

export function resolveMentorChoice(life: ExpandedLife, choice: string) {
  const mentor = life.expansion.beastfolkMentor;
  if (choice === id + ".study") {
    life.expansion.beastfolkMentor = { startedYear: worldYear(life) };
  } else if (mentor && choice === id + ".letter") {
    assessTalent(life);
    mentor.completed = "letter";
  } else if (mentor && choice === id + ".local-work") {
    mentor.completed = "local-work";
  }
}
