import { useId } from "react";
import type { ExpandedLife } from "../game/types";
import {
  SWORD_STYLES,
  swordRank,
  isSwordStyle,
  type SwordStyle,
} from "../game/expanded/sword-state";
import { swordStyleName, swordRankName, swordMentorText } from "../i18n/sword";
export function SwordProgress({
  life,
  onSelect,
}: {
  life: ExpandedLife;
  onSelect?: (style: SwordStyle) => void;
}) {
  const id = useId(),
    s = life.expansion.swords,
    language = life.language ?? "en",
    th = language === "th";
  if (!s) return null;
  const locked =
    life.phase !== "alive" ||
    life.age < 5 ||
    !!life.pending ||
    life.expansion.queue.length > 0;
  const records = (
    <dl className="detail-list">
      {SWORD_STYLES.map((style) => (
        <div key={style}>
          <dt>
            {swordStyleName(style, language)}
            {s.selected === style ? (th ? " · กำลังฝึก" : " · Selected") : ""}
          </dt>
          <dd>
            {swordRankName(swordRank(s.tracks[style]), language)} ·{" "}
            {Number(s.tracks[style].xp.toFixed(2))} XP
          </dd>
        </div>
      ))}
    </dl>
  );
  const guidance = (
    <p>
      {th
        ? "ฝึกเองได้ถึงขั้นสูง ชั้นเซียนขึ้นไปต้องหาอาจารย์และฝึกหนึ่งปีต่อระดับ งานใช้รูปแบบที่แข็งแกร่งที่สุด เหตุการณ์ใช้รูปแบบที่เลือก"
        : "Self-practice reaches Advanced. Saint+ needs a mentor and one training year per rank. Jobs use your strongest style; events use your selected style."}
    </p>
  );
  return (
    <section className="rail-section sword-progress" aria-labelledby={id}>
      <h2 id={id}>{th ? "วิชาดาบสามรูปแบบ" : "Sword styles"}</h2>
      {life.age < 5 ? (
        <>
          <p>{th ? "เริ่มฝึกได้เมื่ออายุ 5 ปี" : "Practice opens at age 5"}</p>
          <details>
            <summary>
              {th
                ? "ระดับที่บันทึกไว้และการพัฒนา"
                : "Recorded styles and advancement"}
            </summary>
            {records}
            {guidance}
          </details>
        </>
      ) : (
        records
      )}
      {s.legacy && (
        <p>
          {th
            ? `โอนประสบการณ์เดิม ${s.legacy.xp} XP และเพดานระดับไปยังรูปแบบเดียวได้ครั้งเดียว รูปแบบอื่นเริ่มที่ศูนย์`
            : `Move existing ${s.legacy.xp} XP and earned ceiling once, into one style. The other styles begin at zero.`}
        </p>
      )}
      {onSelect && life.phase === "alive" && life.age >= 5 && (
        <>
          <label htmlFor={`${id}-select`}>
            {th ? "รูปแบบวิชาดาบที่ฝึก" : "Practice style"}
          </label>
          <select
            id={`${id}-select`}
            value={s.selected ?? ""}
            disabled={locked}
            aria-describedby={locked ? `${id}-lock` : undefined}
            onChange={(e) => {
              if (isSwordStyle(e.target.value)) onSelect(e.target.value);
            }}
          >
            <option value="" disabled>
              {th ? "เลือกรูปแบบดาบ" : "Choose a style"}
            </option>
            {SWORD_STYLES.map((style) => (
              <option key={style} value={style}>
                {swordStyleName(style, language)}
              </option>
            ))}
          </select>
        </>
      )}
      {locked && life.phase === "alive" && life.age >= 5 && (
        <p id={`${id}-lock`}>
          {life.age < 5
            ? th
              ? "เริ่มฝึกได้เมื่ออายุ 5 ปี"
              : "Practice opens at age 5"
            : th
              ? "ตัดสินใจเรื่องที่รออยู่ก่อนเปลี่ยนรูปแบบดาบ"
              : "Resolve the current decision before changing style."}
        </p>
      )}
      {life.age >= 5 && (
        <details>
          <summary>
            {th ? "เกี่ยวกับการพัฒนาวิชาดาบ" : "About sword advancement"}
          </summary>
          {guidance}
        </details>
      )}
      {swordMentorText(life, language, true).map((line) => (
        <p key={line}>{line}</p>
      ))}
    </section>
  );
}
