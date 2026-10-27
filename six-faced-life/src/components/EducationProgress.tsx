import type { ExpandedLife } from "../game/types";
import { ORDINARY_ROLES, ordinaryEntry } from "../game/expanded/career-access";
import { expandedLabel } from "../i18n/expanded";
import { ew } from "../i18n/education";
import { useI18n } from "../i18n/context";
export function EducationProgress({life,onOpenTraining}:{life:ExpandedLife;onOpenTraining?:()=>void}){
  const {language}=useI18n(),th=language==="th",t=life.expansion.training,f=life.expansion.finance;
  if(life.age<15)return null;
  const active=t?.active,record=active?t.records[active]:null;
  const complete=ORDINARY_ROLES.filter(role=>t?.records[role].completedYear!=null);
  const totals=Object.values(f?.purposes??{}).reduce((s,r)=>({borrowed:s.borrowed+r.borrowed,balance:s.balance+r.balance,repaid:s.repaid+r.repaid}),{borrowed:0,balance:0,repaid:0});
  return <section className="education-progress rail-section" aria-labelledby="education-progress-heading">
    <h2 id="education-progress-heading">{th?"การฝึกและเงินเพื่อการศึกษา":"Training and education finance"}</h2>
    {active&&record ? <>
      <h3>{expandedLabel(active,language)} · {t.paused?(th?"พักการฝึก":"Paused"):t.mode==="full-time"?ew("full",language):ew("part",language)}</h3>
      <p>{record.units} / {ordinaryEntry(active).units} {th?"หน่วย":"units"} · {Math.ceil((ordinaryEntry(active).units-record.units)/(t.mode==="full-time"?2:1))} {th?"ปีที่ต้องฝึกอีก":"participating years remaining"}</p>
      <progress value={record.units} max={ordinaryEntry(active).units} aria-label={th?"ความก้าวหน้าการฝึกอาชีพ":"Career training progress"}/>
      <p>{t.paused?(th?"พักความก้าวหน้าและเบี้ยเลี้ยง คงรายได้จากงานปัจจุบัน":"Progress and stipend paused; normal job income applies."):t.mode==="full-time"?(th?"24 เหรียญต่อปีแทนค่าจ้างงานเดิม":"24 coins/year replaces regular job wages."):(th?"คงรายได้งานเดิม ไม่มีเบี้ยเลี้ยงเพิ่ม":"Keep current job wages; no extra stipend.")}</p>
    </>:<p>{th?"เริ่มฝึกอาชีพทั่วไปได้โดยไม่ต้องมีทักษะเดิม หรือสมัครโดยตรงเมื่อคุณสมบัติครบ":"Begin ordinary career training without prior skills, or apply directly when qualified."}</p>}
    {complete.length>0&&<p>{th?"คุณวุฒิที่คงอยู่":"Retained qualifications"}: {complete.map(role=>expandedLabel(role,language)).join(" · ")}</p>}
    {onOpenTraining&&life.phase==="alive"&&<button className="button secondary" disabled={!!life.pending || life.expansion.queue.length>0} onClick={onOpenTraining}>{active?(th?"จัดการการฝึก":"Manage training"):ew("title",language)}</button>}
    {!!life.pending&&onOpenTraining&&<p>{th?"ตัดสินใจเรื่องที่รออยู่ก่อนจัดการการฝึก":"Finish the pending decision before managing training."}</p>}
    <details><summary>{th?"เงินเพื่อการศึกษาและหนี้":"Education funding and debt"}</summary>
      <p>{th?"เงินกู้สะสม":"Principal borrowed"}: {totals.borrowed} · {th?"หนี้คงเหลือ":"Remaining debt"}: {totals.balance} · {th?"ชำระแล้ว":"Repaid"}: {totals.repaid}</p>
      <p>{th?"ชำระครั้งล่าสุด":"Last repayment"}: {f?.lastRepayment??0} {th?"เหรียญ":"coins"}</p>
      {f&&f.pauseReason!=="none"&&<p>{th?"พักชำระ":"Repayment paused"}: {f.pauseReason==="university"?(th?"กำลังเรียนมหาวิทยาลัย":"university attendance"):f.pauseReason==="ended"?(th?"ปิดภาระเมื่อสิ้นชีวิต":"obligations closed at death"):(th?"ไม่มีรายได้ส่วนเกินหลังปัจจัยจำเป็น":"no affordable surplus after necessities")}</p>}
      <p>{ew("policy",language)}</p>
    </details>
  </section>;
}
