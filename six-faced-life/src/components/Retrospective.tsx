import type { ExpandedLife } from "../game/types";
import { useI18n } from "../i18n/context";
import { expandedLabel } from "../i18n/expanded";
export function Retrospective({ life }: { life: ExpandedLife }) {
  const { language } = useI18n(),
    summary = life.expansion.summary;
  if (!summary) return null;
  return (
    <section className="retrospective">
      <h2>
        {language === "th"
          ? "เรื่องราวที่บันทึกไว้"
          : "The life that was recorded"}
      </h2>
      {summary.narrative[language].split("\n\n").map((p, i) => (
        <p className="retrospective-narrative" key={i}>
          {p}
        </p>
      ))}
      {summary.sections.map((s) => (
        <details key={s.key} open={s.key === "identity"}>
          <summary>
            <h3>{expandedLabel(s.key, language)}</h3>
          </summary>
          <p>{s[language]}</p>
        </details>
      ))}
    </section>
  );
}
