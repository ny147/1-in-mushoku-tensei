import type { Language } from "../game/types";

// Exact matches keep additional requirements and dynamic quotes intact.
const summaries: Record<Language, Map<string, string>> = {
  en: new Map([
    ["Eight silver buy a year of instruction. Readiness still limits the rank you can learn.", "One year costs 8 silver. Readiness limits your rank."],
    ["Eight silver secure two years of twelve additional household resources. This does not guarantee survival.", "8 silver adds 12 household resources per year for 2 years. Survival is uncertain."],
    ["An authored assignment pays twenty silver, but carries a five percent fatal risk. Unfulfilled obligations erode trust.", "Earn 20 silver at a 5% risk of death. Unmet obligations reduce trust."],
    ["You open your eyes to wooden beams and a language you do not understand. Your hands are impossibly small. But behind them is a mind that remembers another life. This time, where will you begin?", "You remember your past life. How will you begin this one?"],
    ["A book lies open on the table. Its letters are strange, but you remember how learning works. Your family has begun to notice how carefully you watch.", "A book in an unfamiliar script catches your eye. How will you learn to read?"],
    ["You have watched a traveling mage call water from thin air. Alone in the garden, you feel that same current inside yourself. A memory from your old life whispers: try to understand it, not just repeat it.", "Alone in the garden, you sense the current a traveling mage used to summon water."],
    ["A retired guard offers lessons to the village children. You know that talent alone is never enough. The first swing is clumsy; the second is a little better.", "A retired guard offers sword lessons to village children."],
    ["Keep your memories close and learn the language around you.", "Keep your secret and learn the language."],
    ["You remember another world. How will you meet this one?", "How will you begin your second life?"],
    ["Voluntary military service pays thirty silver but carries a ten percent immediate fatal risk and may endanger dependants. You must decide manually.", "Volunteer for 30 silver at a 10% risk of immediate death and possible danger to dependants. Choose manually."],
  ]),
  th: new Map([
    ["ค่าเรียนแปดเหรียญเงินช่วยให้คุณฝึกกับผู้สอนหนึ่งปี แต่ระดับที่เรียนได้ยังขึ้นอยู่กับความพร้อม", "ฝึก 1 ปีจ่าย 8 เหรียญเงิน ระดับที่เรียนได้ขึ้นอยู่กับความพร้อม"],
    ["แปดเหรียญเงินช่วยเพิ่มทรัพยากรครัวเรือนปีละสิบสองหน่วยเป็นเวลาสองปี แต่ไม่ได้รับประกันการรอดชีวิต", "จ่าย 8 เหรียญเงิน เพิ่มทรัพยากรครัวเรือนปีละ 12 หน่วยเป็นเวลา 2 ปี ยังเสี่ยงเสียชีวิต"],
    ["ภารกิจที่แต่งขึ้นนี้ให้ค่าจ้างยี่สิบเหรียญเงิน แต่มีโอกาสเสียชีวิตห้าเปอร์เซ็นต์ การละเลยหน้าที่ทำให้ความไว้ใจลดลง", "รับ 20 เหรียญเงิน เสี่ยงเสียชีวิต 5% หากละเลยหน้าที่ ความไว้ใจจะลดลง"],
    ["คุณลืมตาขึ้นเห็นคานไม้และได้ยินภาษาที่ไม่เข้าใจ มือของคุณเล็กจนน่าเหลือเชื่อ แต่ข้างในกลับมีจิตใจที่จดจำชีวิตก่อนหน้านี้ได้ ครั้งนี้ คุณจะเริ่มต้นจากตรงไหน?", "คุณยังจำชีวิตก่อนได้ จะเริ่มชีวิตใหม่นี้อย่างไร"],
    ["หนังสือเปิดค้างอยู่บนโต๊ะ ตัวอักษรดูแปลกตา แต่คุณยังจำวิธีเรียนรู้ได้ ครอบครัวเริ่มสังเกตว่าคุณมองทุกสิ่งอย่างตั้งใจเพียงใด", "คุณพบหนังสือที่ใช้ตัวอักษรไม่คุ้นตา จะเรียนอ่านอย่างไร"],
    ["คุณเคยเห็นจอมเวทพเนจรเรียกน้ำจากความว่างเปล่า เมื่ออยู่ตามลำพังในสวน คุณสัมผัสกระแสเดียวกันภายในตัว ความทรงจำจากชีวิตก่อนกระซิบว่า จงลองทำความเข้าใจ แทนที่จะเพียงทำตาม", "ในสวน คุณสัมผัสถึงกระแสเวทเดียวกับที่จอมเวทใช้เสกน้ำ"],
    ["ทหารยามเกษียณคนหนึ่งเปิดสอนเด็กในหมู่บ้าน คุณรู้ดีว่าพรสวรรค์อย่างเดียวไม่เคยพอ การฟันครั้งแรกเก้กัง แต่ครั้งที่สองดีขึ้นอีกนิด", "อดีตทหารยามเปิดสอนดาบให้เด็กในหมู่บ้าน"],
    ["เก็บความทรงจำไว้ในใจ แล้วเรียนรู้ภาษาของผู้คนรอบตัว", "เก็บความลับไว้และเรียนรู้ภาษา"],
    ["คุณจดจำอีกโลกหนึ่งได้ แล้วคุณจะเริ่มต้นชีวิตในโลกนี้อย่างไร", "คุณจะเริ่มชีวิตใหม่นี้อย่างไร"],
    ["งานทหารโดยสมัครใจให้ค่าจ้างสามสิบเหรียญเงิน แต่มีโอกาสเสียชีวิตทันทีสิบเปอร์เซ็นต์และอาจทำให้ผู้พึ่งพาเดือดร้อน คุณต้องตัดสินใจด้วยตนเอง", "อาสารับ 30 เหรียญเงิน เสี่ยงเสียชีวิตทันที 10% และอาจเป็นอันตรายต่อผู้พึ่งพา ต้องเลือกเอง"],
  ]),
};

export function shortDecisionText(full: string, language: Language): string {
  return summaries[language].get(full) ?? full;
}
