import type { ExpandedLife } from "../game/types";
import { useI18n } from "../i18n/context";
import { expandedLabel } from "../i18n/expanded";
import { worldYear } from "../game/expanded/facts";
import { materialNeeds } from "../game/expanded/economy";
import {
  careerIncomeExpanded,
  careerRequirements,
} from "../game/expanded/careers";
import { educationRequirements } from "../game/expanded/education";
import { OCCUPATIONS } from "../game/expanded/balance";
import { descendantCounts } from "../game/expanded/family";

export function ExpandedDetails({
  life,
  birth = false,
}: {
  life: ExpandedLife;
  birth?: boolean;
}) {
  const { language } = useI18n(),
    th = language === "th",
    x = life.expansion;
  const label = (key: string) => expandedLabel(key, language);
  return (
    <section
      className="expanded-details"
      aria-label={th ? "ยุคสมัยและโอกาส" : "Era and opportunity"}
    >
      <h2>
        {birth
          ? th
            ? "ชาติกำเนิดและยุคสมัย"
            : "Origins and era"
          : th
            ? "ชีวิตในยุคสมัยนี้"
            : "Your life in history"}
      </h2>
      <p className="expanded-calendar">
        K{worldYear(life)} · {th ? "อายุ" : "Age"} {life.age}
      </p>
      <dl className="expanded-facts">
        <div>
          <dt>{th ? "ทรัพยากรครอบครัว" : "Family resources"}</dt>
          <dd>{label(x.origin.wealth)}</dd>
        </div>
        <div>
          <dt>{th ? "ฐานะ" : "Standing"}</dt>
          <dd>{label(x.standing.status)}</dd>
        </div>
        <div>
          <dt>{th ? "ถิ่นที่อยู่" : "Locality"}</dt>
          <dd>
            {label(
              (birth ? x.origin.birthplace : x.origin.locality) === "capital"
                ? "capital-city"
                : birth
                  ? x.origin.birthplace
                  : x.origin.locality,
            )}
          </dd>
        </div>
        <div>
          <dt>{th ? "การศึกษา" : "Education"}</dt>
          <dd>{label(x.education.stage)}</dd>
        </div>
      </dl>
      {life.race === "superd" && (
        <p className="expanded-warning">
          {th
            ? "จุดเริ่มต้นที่เสี่ยงอย่างยิ่ง: ภายใต้สภาพเริ่มต้นทั่วไป สเปิร์ดราว 90% เสียชีวิตก่อนอายุ 15 ปี นี่คือเป้าหมายสมดุลประชากร ไม่ใช่ชะตาที่กำหนดไว้ ความคุ้มครองและการดูแลช่วยเพิ่มโอกาสรอด"
            : "Extreme survival start: about 90% of Superd die before age 15 under typical starting conditions. This population balance target does not predetermine your life. Protection and care improve the odds."}
        </p>
      )}
      {materialNeeds(life).map((need) => (
        <p className="expanded-warning" key={need}>
          {label(need)}
        </p>
      ))}
      {x.education.probation && (
        <p className="expanded-warning">
          {th
            ? "ภาคทัณฑ์การศึกษา: ต้องมีความก้าวหน้าในปีหน้า มิฉะนั้นจะต้องยุติการเรียน"
            : "Study probation: make progress next year or attendance will end."}
        </p>
      )}
      {x.education.scholarship && (
        <p>
          {th
            ? "ทุนครอบคลุมค่าเรียน ค่าครองชีพ และค่าเดินทาง ต้องเรียนและแสดงความก้าวหน้า"
            : "Scholarship covers tuition, living and travel costs. Study and progress are required."}
        </p>
      )}
      {x.genetics.discovered && (
        <p>
          {th
            ? "การประเมินยืนยันลักษณะสืบทอดที่สังเกตพบแล้ว"
            : "An assessment established an inherited trait from observed signs."}{" "}
          {x.genetics.auraImpaired
            ? th
              ? "ความเข้ากันได้กับออราต่อสู้จำกัดระดับการเรียนดาบ"
              : "Impaired battle-aura compatibility limits sword instruction."
            : ""}
        </p>
      )}
      {x.politics.faction && (
        <p>
          {label(x.politics.faction)} ·{" "}
          {th ? "หน้าที่ค้างอยู่" : "Outstanding obligations"}{" "}
          {x.politics.obligations} · {th ? "ความไว้ใจ" : "Trust"}{" "}
          {Math.round(x.politics.trust)}
        </p>
      )}
      {birth && (
        <p className="expanded-note">
          {th
            ? "มิกุรด์และสเปิร์ดเกิดบนทวีปปีศาจในระบบชาติกำเนิดนี้ แต่ย้ายถิ่นได้ในภายหลัง เด็กในครอบครัวที่ย้ายถิ่นเกิดตามบ้านที่อาศัยอยู่จริง"
            : "Migurd and Superd protagonists are born on the Demon Continent. Migration is possible; children are born where their family actually lives."}
        </p>
      )}
    </section>
  );
}
export function ExpandedCareer({ life }: { life: ExpandedLife }) {
  const { language } = useI18n(),
    th = language === "th",
    x = life.expansion,
    label = (key: string) => expandedLabel(key, language),
    record = x.career.records[x.career.role];
  return (
    <section className="rail-section expanded-career">
      <h2>{th ? "งานและโอกาส" : "Work and opportunity"}</h2>
      <h3>{label(x.career.role)}</h3>
      <p>
        {careerIncomeExpanded(life)}{" "}
        {th
          ? "เหรียญต่อปี ก่อนหักค่าใช้จ่าย"
          : "coins per year before living costs"}
      </p>
      <p>
        {th ? "ระดับ" : "Level"} {record.level} ·{" "}
        {th ? "ประสบการณ์" : "Experience"} {record.xp} · {record.years}{" "}
        {th ? "ปี" : "years"}
      </p>
      <p>
        {th ? "รายรับปีล่าสุด" : "Last annual income"} {x.economy.lastIncome} ·{" "}
        {th ? "จ่ายจริง" : "Actually spent"} {x.economy.lastExpenses}
      </p>
      <details>
        <summary>
          {th
            ? "เงื่อนไขการศึกษาและอาชีพ"
            : "Education and career requirements"}
        </summary>
        <h3>{th ? "มหาวิทยาลัย" : "University"}</h3>
        <ul className="requirement-list">
          {educationRequirements(life).map((r) => (
            <li key={r.id} data-met={r.met}>
              {r.met ? (th ? "ผ่าน" : "Met") : th ? "ยังไม่ผ่าน" : "Unmet"}:{" "}
              {label(r.id)} {Math.round(r.current)} / {r.required}
            </li>
          ))}
        </ul>
        {OCCUPATIONS.filter(
          (r) => !["child", "student", "retired"].includes(r),
        ).map((role) => (
          <div className="career-requirements" key={role}>
            <h3>{label(role)}</h3>
            <ul className="requirement-list">
              {careerRequirements(life, role).map((r) => (
                <li key={r.id} data-met={r.met}>
                  {r.met ? (th ? "ผ่าน" : "Met") : th ? "ยังไม่ผ่าน" : "Unmet"}:{" "}
                  {label(r.id)} {Math.round(r.current)} / {r.required}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p>
          {th
            ? "มีคุณสมบัติครบไม่ได้รับประกันตำแหน่งว่าง งานทั่วไปเปิดรับตามสภาพร่างกาย งานพิเศษต้องรอโอกาสจริง"
            : "Meeting requirements does not guarantee a vacancy. Ordinary work remains available according to health; specialized jobs require an actual opening."}
        </p>
      </details>
    </section>
  );
}
export function ExpandedFamily({ life }: { life: ExpandedLife }) {
  const { language } = useI18n(),
    th = language === "th",
    x = life.expansion,
    c = descendantCounts(life);
  return (
    <section className="rail-section expanded-family">
      <h2>{th ? "ผู้คนข้างกาย" : "The people beside you"}</h2>
      <p>
        {th ? "บุตรที่เกิด" : "Children born"} {c.born} ·{" "}
        {th ? "ผู้สืบสกุลที่ยังมีชีวิต" : "Surviving descendants"}{" "}
        {c.survivingDescendants}
      </p>
      {x.family.projectionLimited && (
        <p className="expanded-warning">
          {th
            ? "ระบบถึงขีดจำกัดผู้สืบสกุลที่จำลองหนึ่งล้านคนแล้ว จึงไม่สร้างการเกิดรุ่นไกลเพิ่ม คนที่บันทึกไว้ยังเติบโตและมีชีวิตตามข้อมูลจริง"
            : "The one-million modeled-descendant limit was reached. Further distant births are not projected; existing recorded people continue to age with their actual living counts."}
        </p>
      )}
      <details>
        <summary>
          {th ? "ครอบครัวและประวัติการสมรส" : "Family and marriage record"}
        </summary>
        <ul className="family-ledger">
          {x.family.people.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong>
              <span>
                {expandedLabel(p.role, language)} · K{p.born}
                {p.died === null
                  ? ` · ${worldYear(life) - p.born} ${th ? "ปี" : "years"}`
                  : `–K${p.died}`}{" "}
                · {th ? "ความผูกพัน" : "Closeness"} {Math.round(p.strength)}
              </span>
            </li>
          ))}
        </ul>
        {x.family.marriages.map((m, i) => (
          <p key={`${m.person}-${i}`}>
            {x.family.people.find((p) => p.id === m.person)?.name} · K{m.start}–
            {m.end ?? (th ? "ปัจจุบัน" : "present")}
            {m.reason
              ? ` · ${m.reason === "widowhood" ? (th ? "คู่เสียชีวิต" : "widowed") : th ? "หย่า" : "divorced"}`
              : ""}
          </p>
        ))}
        {x.family.friends.map((p) => (
          <p key={p.id}>
            {p.name} · {expandedLabel(p.role, language)} ·{" "}
            {Math.round(p.strength)}
          </p>
        ))}
        <p>
          {th
            ? "ระบบรองรับคู่สมรสที่ต่างคนกันตลอดชีวิตหกคนและบุตรโดยตรงสิบสองคน ญาติรุ่นหลังอาจเก็บเป็นกลุ่มประชากรโดยยังรักษาจำนวนที่มีชีวิต"
            : "The simulation supports six distinct lifetime spouses and twelve direct children. Later generations may use demographic cohorts while retaining living counts."}
        </p>
      </details>
    </section>
  );
}
