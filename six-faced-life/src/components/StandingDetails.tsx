import type { ExpandedLife } from "../game/types";
import { useI18n } from "../i18n/context";
import { socialText, type SocialPresentation } from "../i18n/social";

export function StandingDetails({
  life,
  birth = false,
}: {
  life: ExpandedLife;
  birth?: boolean;
}) {
  const { language } = useI18n(),
    th = language === "th",
    text = socialText(life, language);
  const fields: [keyof SocialPresentation, string, string][] = [
    ["birthRank", "Birth rank", "ฐานันดรเมื่อเกิด"],
    ["currentStanding", "Current legal standing", "ฐานันดรปัจจุบัน"],
    ["royalAncestry", "Royal ancestry", "เชื้อสายราชวงศ์"],
    [
      "association",
      "House association and access",
      "สังกัดสกุลและสิทธิ์เข้าถึง",
    ],
    ["housing", "Household housing", "ที่อยู่ครัวเรือน"],
    ["debt", "Parental liability", "ภาระหนี้ครอบครัว"],
    ["commitment", "Repayment commitment", "สัญญาชำระหนี้"],
  ];
  return (
    <details className="standing-details" open={birth || undefined}>
      <summary>
        {th ? "ฐานันดรและภาระครัวเรือน" : "Standing and household obligations"}
      </summary>
      <dl className="expanded-facts">
        {fields.map(([key, en, thai]) => (
          <div key={key}>
            <dt>{th ? thai : en}</dt>
            <dd>{text[key]}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
