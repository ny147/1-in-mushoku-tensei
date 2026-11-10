import type { ExpandedLife } from "../game/types";
import { useI18n } from "../i18n/context";
import { CAREER_NODES, CAREER_PATHS } from "../game/expanded/career-catalogue";
import {
  careerNode,
  pathIncome,
  pathRequirements,
} from "../game/expanded/career-paths";
import { careerNodeText, careerPathText } from "../i18n/careers";
import { currentRequirementText } from "../i18n/current-requirements";
import { expandedLabel } from "../i18n/expanded";
import { moneyText } from "../i18n/money";
import { educationRequirements } from "../game/expanded/education";

export function CareerPaths({ life }: { life: ExpandedLife }) {
  const { language } = useI18n(),
    th = language === "th",
    x = life.expansion,
    s = x.careerPaths!,
    n = careerNode(life);
  const next = n
    ? Object.values(CAREER_NODES).filter((v) => v.predecessor === n.id)
    : [];
  const training =
    x.training?.active && !x.training.paused && x.training.mode === "full-time";
  const requirements = (rows: ReturnType<typeof pathRequirements>) => (
    <ul className="requirement-list">
      {rows.map((r, i) => (
        <li key={`${r.id}-${i}`} data-met={r.met}>
          {r.met ? (th ? "ผ่าน" : "Met") : th ? "ยังไม่ผ่าน" : "Unmet"}:{" "}
          {currentRequirementText(r, language)}
        </li>
      ))}
    </ul>
  );
  return (
    <section className="rail-section expanded-career career-paths">
      <h2>{th ? "งานและโอกาส" : "Work and opportunity"}</h2>
      {n?.path && (
        <p className="career-path-label">{careerPathText(n.path, language)}</p>
      )}
      <h3>
        {n
          ? careerNodeText(n.id, language)
          : expandedLabel(x.career.role, language)}
      </h3>
      <p className="career-path-pay">
        {moneyText(pathIncome(life), language)}{" "}
        {th ? "ต่อปี ก่อนหักค่าใช้จ่าย" : "per year before living costs"}
      </p>
      {training && (
        <p>
          {th
            ? "ฝึกเต็มเวลา: รับเบี้ยเลี้ยงแทนค่าจ้าง เก็บงานและความก้าวหน้าเดิมไว้"
            : "Full-time training: a stipend replaces job wages; your job and earned progress are retained."}
        </p>
      )}
      {n && (
        <>
          <p>
            {th ? "การทำงานในระบบใหม่" : "New-path work"}:{" "}
            {s.work[n.branch].years} {th ? "ปี" : "years"} ·{" "}
            {th ? "ความก้าวหน้างาน" : "Work progress"} {s.work[n.branch].units}
          </p>
          {n.branch === "adventure" && (
            <p>
              {th ? "คำขอสำเร็จ" : "Completed requests"}: {s.requests} · F → D →
              B → S
            </p>
          )}
          {s.earned[n.id]?.source === "inherited" && (
            <p className="career-inherited">
              {th
                ? "การรับรองจากประวัติเดิม: เก็บตำแหน่งและค่าจ้างที่ได้รับไว้ จำนวนคำขอและโครงการแสดงเฉพาะที่บันทึกจริง"
                : "Inherited recognition: your earned title and pay are retained. Request and project counts include only recorded work."}
            </p>
          )}
          {next.map((v) => (
            <div className="career-next" key={v.id}>
              <p>
                <strong>
                  {th ? "เป้าหมายถัดไป: " : "Next milestone: "}
                  {careerNodeText(v.id, language)}
                </strong>
              </p>
              {requirements(pathRequirements(life, v.id))}
            </div>
          ))}
        </>
      )}
      <p className="career-path-guidance">
        {th
          ? "เปิด “ดูอาชีพ” ในกิจกรรมที่เลือกทำได้เพื่อรับงาน เปลี่ยนสาย หรือเลื่อนตำแหน่ง เลื่อนไว้ก่อนได้โดยไม่เสียความก้าวหน้า"
          : "Open Browse careers in Optional activities to enter work, change branches or accept a promotion. You can defer without losing progress."}
      </p>
      <p>
        {th ? "รายรับปีล่าสุด" : "Last annual income"}{" "}
        {moneyText(x.economy.lastIncome, language)} ·{" "}
        {th ? "จ่ายจริง" : "Actually spent"}{" "}
        {moneyText(x.economy.lastExpenses, language)}
      </p>
      <div className="career-path-list">
        {CAREER_PATHS.map((p) => (
          <details className="career-path-group" key={p.id}>
            <summary>{careerPathText(p.id, language)}</summary>
            {p.branches.map((branch) => {
              const nodes = Object.values(CAREER_NODES).filter(
                (v) => v.path === p.id && v.branch === branch,
              );
              return (
                <div className="career-branch" key={branch}>
                  <p>
                    {nodes.map((v, i) => (
                      <span key={v.id}>
                        {i > 0 ? " → " : ""}
                        {careerNodeText(v.id, language)}
                        {s.earned[v.id] ? (
                          <span className="career-earned">
                            {" "}
                            {th ? "(ได้รับแล้ว)" : "(earned)"}
                          </span>
                        ) : (
                          ""
                        )}
                      </span>
                    ))}
                  </p>
                  {nodes[0] &&
                    requirements(pathRequirements(life, nodes[0].id))}
                  {nodes
                    .filter((v) => v.id === "knight" || v.id === "professor")
                    .map((v) => (
                      <div key={v.id}>
                        <p>{careerNodeText(v.id, language)}</p>
                        {requirements(pathRequirements(life, v.id))}
                      </div>
                    ))}
                </div>
              );
            })}
          </details>
        ))}
      </div>
      <details className="career-history">
        <summary>
          {th ? "ประวัติงานที่เก็บไว้" : "Retained work record"}
        </summary>
        {Object.entries(x.career.records)
          .filter(([, r]) => r.years > 0)
          .map(([role, r]) => (
            <p key={role}>
              {expandedLabel(role, language)} · {r.years} {th ? "ปี" : "years"}
            </p>
          ))}
        {s.recent.slice(-8).map((r, i) => (
          <p key={`${r.year}-${i}`}>
            K{r.year} · {careerNodeText(r.node, language)} ·{" "}
            {r.code === "work"
              ? th
                ? "ทำงาน"
                : "Work"
              : r.code === "failure"
                ? th
                  ? "งานไม่สำเร็จ"
                  : "Work unsuccessful"
                : r.code === "promotion"
                  ? th
                    ? "เลื่อนตำแหน่ง"
                    : "Promotion"
                  : r.code === "appointment"
                    ? th
                      ? "รับงาน"
                      : "Appointment"
                    : th
                      ? "โครงการ"
                      : "Project"}
          </p>
        ))}
      </details>
      <details>
        <summary>
          {th ? "เงื่อนไขมหาวิทยาลัย" : "University requirements"}
        </summary>
        {requirements(educationRequirements(life))}
      </details>
    </section>
  );
}
