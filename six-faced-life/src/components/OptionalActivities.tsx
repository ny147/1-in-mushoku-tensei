import type { ExpandedLife } from "../game/types";
import {
  ACTIVITIES,
  activitiesBlock,
  activityOpening,
  type Activity,
} from "../game/expanded/activities";
import { useI18n } from "../i18n/context";
const names: Record<Activity, [string, string]> = {
  discovery: ["Ask about an unusual training sign", "ถามครูเรื่องสัญญาณผิดปกติระหว่างฝึก"],
  "hitogami-dream": ["The Dream’s Warning", "คำเตือนในฝัน"],
  "orsted-ledger": ["Orsted’s ledger assignment", "ภารกิจบัญชีเสบียงของออร์สเตด"],
  "house-petition": ["Petition your house", "ยื่นคำร้องต่อสกุล"],
  "royal-marriage": ["Review a royal marriage proposal", "พิจารณาข้อเสนอสมรสทางราชวงศ์"],
  "crown-petition": ["Petition for household relief", "ยื่นคำร้องขอเงินช่วยเหลือครัวเรือน"],
  "debt-service-exit": ["Review creditor service", "ทบทวนสัญญาทำงานใช้หนี้"],
  career: ["Browse careers", "ดูอาชีพ"],
  "career-work": ["Career work", "งานประจำสายอาชีพ"],
  training: ["Career training", "ฝึกอาชีพ"],
  instruction: ["Seek instruction", "หาผู้สอน"],
  "sword-mentor": ["Seek a sword mentor", "หาอาจารย์ดาบ"],
  assessment: ["Talent assessment", "ประเมินความสามารถ"],
  university: ["University admission", "สมัครมหาวิทยาลัย"],
  travel: ["Plan a move", "วางแผนย้ายถิ่น"],
  courtship: ["Meet someone", "ทำความรู้จักใครสักคน"],
  challenge: ["Legendary challenges", "ท้าชิงเจ็ดมหาอำนาจ"],
};
export function OptionalActivities({
  life,
  onOpen,
  onReviewDecision,
}: {
  life: ExpandedLife;
  onOpen: (key: Activity) => void;
  onReviewDecision?: () => void;
}) {
  const { language, t } = useI18n();
  const block = activitiesBlock(life);
  if (block === "inactive") return null;
  const opportunities = block ? [] : ACTIVITIES.map((key) => ({
    key,
    opening: activityOpening(life, key),
  }));
  const available = opportunities.filter(({ key, opening }) =>
    opening.kind === "available" && key !== "debt-service-exit",
  );
  const canReviewContract = opportunities.some(({ key, opening }) =>
    key === "debt-service-exit" && opening.kind === "available",
  );
  const later = opportunities.filter(({ opening }) =>
    opening.kind !== "available" && opening.kind !== "irrelevant",
  );
  const name = (key: Activity) => {
    if (key === "hitogami-dream" && life.expansion.politics.dreamWarning)
      return language === "th" ? "อ่านข่าวจากท่าเรือ" : "Read the ferry dispatch";
    return names[key][language === "th" ? 1 : 0];
  };

  return (
    <details className="optional-activities">
      <summary>{t("Optional activities")}</summary>
      {block === "custody" && <p>{language === "th"
        ? `ระหว่างถูกคุมขัง กิจกรรมจะเปิดอีกครั้งเมื่อสิ้นรอบปี K${life.expansion.succession!.restrictions.custody!.releaseYear}`
        : `Activities resume after your release at the end of K${life.expansion.succession!.restrictions.custody!.releaseYear}.`}</p>}
      {block === "pending" && (
        <>
          <p>{t("Finish the current decision before opening another activity.")}</p>
          {onReviewDecision && (
            <button type="button" className="button secondary" onClick={onReviewDecision}>
              {t("Review choices")}
            </button>
          )}
        </>
      )}
      {block === "queued" && (
        <p>{t("Continue your chronicle to resolve upcoming decisions before opening an activity.")}</p>
      )}
      {available.length > 0 && (
        <>
          <p>{t("Time pauses while you review. Opening an activity lets you check what its offers require before you commit.")}</p>
          <div className="activity-buttons">
            {available.map(({ key }) => (
              <button type="button" className="button secondary" key={key} onClick={() => onOpen(key)}>
                {name(key)}
              </button>
            ))}
          </div>
        </>
      )}
      {canReviewContract && (
        <div className="activity-contract">
          <p>{t("Your creditor-service contract")}</p>
          <button type="button" className="button secondary" onClick={() => onOpen("debt-service-exit")}>
            {name("debt-service-exit")}
          </button>
        </div>
      )}
      {later.length > 0 && (
        <details className="later-activities">
          <summary>{t("Later opportunities")}</summary>
          <ul>
            {later.map(({ key, opening }) => (
              <li key={key}>
                <strong>{name(key)}</strong>
                <span>
                  {opening.kind === "age" && t("Opens at age {age}.", { age: opening.age })}
                  {opening.kind === "career-work" && t("Hold a career position with work available this year.")}
                  {opening.kind === "enrolled" && t("You’re already attending university.")}
                  {opening.kind === "challenge-window" && t("Requires age {age} and year K{year} or later.", {
                    age: opening.age,
                    year: opening.year,
                  })}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </details>
  );
}
