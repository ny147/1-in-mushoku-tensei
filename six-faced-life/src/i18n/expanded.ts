import type { Decision, Entry, Language } from "../game/types";
import { REGIONS } from "../game/world";
import { domainText } from "./world";
export type Pair = readonly [string, string];
type EventCopy = {
  title: Pair;
  text: Pair;
  choices: Record<string, readonly [string, string, string, string]>;
};
const event = (
  title: Pair,
  text: Pair,
  choices: EventCopy["choices"],
): EventCopy => ({ title, text, choices });
const later = [
  "Continue without committing",
  "ดำเนินต่อโดยยังไม่ผูกมัด",
  "You leave this opportunity for another time.",
  "คุณเก็บโอกาสนี้ไว้พิจารณาในวันหน้า",
] as const;
export const EXPANDED_COPY: Record<string, EventCopy> = {
  memory: event(
    ["A memory from another life", "ความทรงจำจากอีกชีวิต"],
    [
      "You remember another world. How will you meet this one?",
      "คุณจดจำอีกโลกหนึ่งได้ แล้วคุณจะเริ่มต้นชีวิตในโลกนี้อย่างไร",
    ],
    {
      observe: [
        "Observe your new home",
        "สังเกตบ้านใหม่",
        "You listen, learn and begin to belong.",
        "คุณฟัง เรียนรู้ และค่อย ๆ ผูกพันกับบ้านใหม่",
      ],
      practice: [
        "Seek the shape of mana",
        "สัมผัสรูปร่างของมานา",
        "Curiosity becomes a small daily practice.",
        "ความอยากรู้กลายเป็นการฝึกเล็ก ๆ ในแต่ละวัน",
      ],
    },
  ),
  reading: event(
    ["Letters become a doorway", "ตัวอักษรเปิดประตู"],
    [
      "A patient reader offers to teach you without payment.",
      "ผู้มีความรู้คนหนึ่งยินดีสอนคุณอ่านโดยไม่คิดค่าใช้จ่าย",
    ],
    {
      learn: [
        "Learn to read",
        "เรียนอ่านหนังสือ",
        "A free lesson opens a path to study.",
        "บทเรียนที่ไม่ต้องเสียเงินเปิดทางสู่การศึกษา",
      ],
      home: [
        "Stay close to home",
        "อยู่กับครอบครัว",
        "You spend this season with your family.",
        "คุณใช้เวลาฤดูนี้ร่วมกับครอบครัว",
      ],
    },
  ),
  practice: event(
    ["The first deliberate practice", "เริ่มฝึกอย่างตั้งใจ"],
    [
      "Skill needs time, instruction and a safe place to learn.",
      "ทักษะต้องอาศัยเวลา คำแนะนำ และสถานที่เรียนรู้ที่ปลอดภัย",
    ],
    {
      magic: [
        "Practice magic",
        "ฝึกเวทมนตร์",
        "You learn through repetition.",
        "คุณเรียนรู้ผ่านการฝึกซ้ำอย่างสม่ำเสมอ",
      ],
      sword: [
        "Practice footwork",
        "ฝึกย่างเท้า",
        "Careful footwork lays a foundation.",
        "การย่างเท้าอย่างรอบคอบวางรากฐานให้การฝึกดาบ",
      ],
    },
  ),
  assessment: event(
    ["A free talent assessment", "การประเมินพรสวรรค์โดยไม่เสียเงิน"],
    [
      "A local teacher offers a practical assessment. Poverty alone is not scholarship eligibility.",
      "ครูในชุมชนเสนอตรวจความสามารถจากการปฏิบัติจริง ความยากจนเพียงอย่างเดียวไม่ใช่คุณสมบัติรับทุน",
    ],
    {
      take: [
        "Take the assessment",
        "เข้ารับการประเมิน",
        "Your demonstrated learning is recorded.",
        "ผลการเรียนรู้ที่คุณแสดงให้เห็นได้รับการบันทึก",
      ],
      later,
    },
  ),
  university: event(
    ["A place at university", "โอกาสเรียนมหาวิทยาลัย"],
    [
      "Admission requires readiness and full funding. Exceptional demonstrated talent can earn tuition, living and travel support.",
      "การเข้าเรียนต้องมีความพร้อมและทุนเพียงพอ ผู้มีพรสวรรค์โดดเด่นที่พิสูจน์ความสามารถแล้วอาจได้รับทุนค่าเรียน ค่าครองชีพ และค่าเดินทาง",
    ],
    {
      enroll: [
        "Accept a funded place",
        "รับโอกาสเรียนที่มีทุนพร้อม",
        "You begin university with the necessary costs reserved.",
        "คุณเริ่มเรียนมหาวิทยาลัยโดยจัดเตรียมค่าใช้จ่ายที่จำเป็นไว้แล้ว",
      ],
      later,
    },
  ),
  "school-year": event(
    ["Your course of study", "ปีแห่งการศึกษา"],
    [
      "Study or magic practice and measurable progress are necessary. One failed year brings probation; another ends attendance.",
      "คุณต้องมุ่งเรียนหรือฝึกเวทพร้อมแสดงความก้าวหน้า ปีที่ไม่ผ่านครั้งแรกเป็นช่วงภาคทัณฑ์ หากไม่ผ่านอีกครั้งจะต้องยุติการเรียน",
    ],
    {
      study: [
        "Commit this year to study",
        "ทุ่มเทปีนี้ให้การเรียน",
        "You make study your yearly focus.",
        "คุณกำหนดให้การเรียนเป็นเป้าหมายประจำปี",
      ],
      later,
    },
  ),
  work: event(
    ["A first livelihood", "เริ่มหาเลี้ยงชีพ"],
    [
      "Ordinary work is a complete path. Pay must still cover food, shelter and care.",
      "งานธรรมดาก็เป็นเส้นทางชีวิตที่สมบูรณ์ได้ แต่รายได้ยังต้องเพียงพอสำหรับอาหาร ที่พัก และการรักษา",
    ],
    {
      farmer: [
        "Take local farm work",
        "รับงานเกษตรในชุมชน",
        "You begin earning a modest living from farm work.",
        "คุณเริ่มหาเลี้ยงชีพด้วยงานเกษตรที่ให้รายได้พอประมาณ",
      ],
      laborer: [
        "Take household or local work",
        "รับงานเบาหรืองานในชุมชน",
        "You take work suited to your circumstances.",
        "คุณรับงานที่เหมาะกับสภาพร่างกายและชีวิตของตน",
      ],
      later,
    },
  ),
  career: event(
    ["An available appointment", "ตำแหน่งงานที่เปิดรับ"],
    [
      "Qualifications and an actual opening are both required. A new appointment replaces your primary paid occupation.",
      "คุณต้องมีคุณสมบัติและมีตำแหน่งว่างจริง การรับงานใหม่จะแทนที่อาชีพหลักที่รับค่าจ้างอยู่",
    ],
    {
      promote: [
        "Accept earned promotion",
        "รับการเลื่อนตำแหน่งที่มีคุณสมบัติครบ",
        "Your work and earned standing are recognized.",
        "ผลงานและความน่าเชื่อถือของคุณได้รับการยอมรับ",
      ],
      later,
    },
  ),
  opportunity: event(
    ["A season of opportunities", "ฤดูกาลแห่งโอกาส"],
    [
      "Choose one use for your time. Costs and requirements are shown before you commit.",
      "เลือกว่าจะใช้เวลาเพื่อสิ่งใด ค่าใช้จ่ายและเงื่อนไขจะแสดงก่อนตัดสินใจ",
    ],
    {
      assessment: [
        "Seek a free assessment",
        "ขอรับการประเมินฟรี",
        "You arrange to meet a teacher.",
        "คุณนัดพบครูเพื่อรับการประเมิน",
      ],
      university: [
        "Consider university",
        "พิจารณาเรียนมหาวิทยาลัย",
        "You review admission and funding.",
        "คุณพิจารณาเงื่อนไขการรับเข้าและทุนการศึกษา",
      ],
      career: [
        "Seek a new appointment",
        "มองหาตำแหน่งงานใหม่",
        "You look for work that matches your qualifications.",
        "คุณมองหางานที่ตรงกับความสามารถ",
      ],
      instruction: [
        "Seek instruction",
        "หาผู้สอน",
        "You ask about structured training.",
        "คุณสอบถามเรื่องการฝึกอย่างมีแบบแผน",
      ],
      courtship: [
        "Meet someone",
        "ทำความรู้จักใครสักคน",
        "You make time for a new relationship.",
        "คุณแบ่งเวลาให้ความสัมพันธ์ครั้งใหม่",
      ],
      travel: [
        "Plan a move",
        "วางแผนย้ายถิ่น",
        "You consider the cost and danger of moving.",
        "คุณพิจารณาค่าใช้จ่ายและอันตรายของการย้ายถิ่น",
      ],
      aid: [
        "Arrange household aid",
        "จัดหาความช่วยเหลือให้ครัวเรือน",
        "You consider support for necessities.",
        "คุณพิจารณาความช่วยเหลือด้านปัจจัยจำเป็น",
      ],
      protection: [
        "Seek community protection",
        "ขอความคุ้มครองจากชุมชน",
        "You seek safer conditions through community service.",
        "คุณขอสภาพแวดล้อมที่ปลอดภัยขึ้นด้วยการช่วยงานชุมชน",
      ],
      later,
    },
  ),
  instruction: event(
    ["Instruction and discipline", "การเรียนกับผู้สอน"],
    [
      "Eight coins buy a year of instruction. Readiness still limits the rank you can learn.",
      "ค่าเรียนแปดเหรียญช่วยให้คุณฝึกกับผู้สอนหนึ่งปี แต่ระดับที่เรียนได้ยังขึ้นอยู่กับความพร้อม",
    ],
    {
      magic: [
        "Pay for magical instruction",
        "จ่ายค่าเรียนเวทมนตร์",
        "A teacher opens the next stage of magical instruction.",
        "ผู้สอนช่วยให้คุณก้าวสู่การเรียนเวทมนตร์ขั้นต่อไป",
      ],
      sword: [
        "Pay for sword instruction",
        "จ่ายค่าเรียนดาบ",
        "You train under a sword instructor.",
        "คุณฝึกภายใต้คำแนะนำของครูดาบ",
      ],
      later,
    },
  ),
  aid: event(
    ["Keeping the household fed", "ดูแลปากท้องครอบครัว"],
    [
      "Eight coins secure two years of twelve additional household resources. This does not guarantee survival.",
      "แปดเหรียญช่วยเพิ่มทรัพยากรครัวเรือนปีละสิบสองหน่วยเป็นเวลาสองปี แต่ไม่ได้รับประกันการรอดชีวิต",
    ],
    {
      accept: [
        "Arrange the support",
        "จัดเตรียมความช่วยเหลือ",
        "The household receives a limited period of practical support.",
        "ครัวเรือนได้รับความช่วยเหลือด้านปัจจัยจำเป็นในช่วงเวลาจำกัด",
      ],
      later,
    },
  ),
  protection: event(
    ["A place within the community", "ที่พักพิงในชุมชน"],
    [
      "Serving the community takes time and strengthens protection for three years. Persecution and other dangers remain possible.",
      "การช่วยงานชุมชนต้องใช้เวลาและช่วยให้ได้รับความคุ้มครองสามปี แต่การกดขี่และอันตรายอื่นยังอาจเกิดขึ้นได้",
    ],
    {
      accept: [
        "Serve and seek protection",
        "ช่วยงานและขอความคุ้มครอง",
        "You spend time building practical community protection.",
        "คุณใช้เวลาสร้างความคุ้มครองผ่านความร่วมมือในชุมชน",
      ],
      later,
    },
  ),
  travel: event(
    ["A home beyond the horizon", "บ้านที่อยู่เลยขอบฟ้า"],
    [
      "Moving costs money and exposes the household to a year of travel danger. Locality changes with the destination.",
      "การย้ายถิ่นมีค่าใช้จ่ายและทำให้ครัวเรือนเผชิญอันตรายระหว่างเดินทางหนึ่งปี สถานที่อยู่อาศัยจะเปลี่ยนตามจุดหมาย",
    ],
    { later },
  ),
  calamity: event(
    ["The Mana Calamity — K417", "ภัยพิบัติมานา — ปี K417"],
    [
      "The teleportation disaster has a fixed place in history. Your recorded exposure distinguishes displacement from distant news.",
      "ภัยพิบัติการเคลื่อนย้ายเกิดขึ้นตามประวัติศาสตร์ บันทึกของคุณแยกการพลัดถิ่นจริงออกจากการรับข่าวจากแดนไกล",
    ],
    {
      shelter: [
        "Seek safety with the community",
        "หาที่ปลอดภัยร่วมกับชุมชน",
        "You respond as your actual circumstances allow.",
        "คุณรับมือตามสถานการณ์ที่เผชิญอยู่จริง",
      ],
      aid: [
        "Offer local relief",
        "ช่วยบรรเทาทุกข์ในพื้นที่",
        "Your contribution is recorded as support, not military service.",
        "ความช่วยเหลือของคุณถูกบันทึกเป็นการบรรเทาทุกข์ ไม่ใช่การรับราชการทหาร",
      ],
    },
  ),
  succession: event(
    ["The Asura succession conflict", "ความขัดแย้งสืบราชบัลลังก์อัสรา"],
    [
      "The struggle brings political danger and displacement. Ariel becomes ruler in K425 regardless of your personal choices.",
      "ความขัดแย้งนำมาซึ่งอันตรายทางการเมืองและการพลัดถิ่น แอเรียลจะขึ้นครองบัลลังก์ในปี K425 ไม่ว่าคุณเลือกเส้นทางใด",
    ],
    {
      neutral: [
        "Protect your household and remain neutral",
        "ดูแลครอบครัวและวางตัวเป็นกลาง",
        "You remain a civilian.",
        "คุณยังคงเป็นพลเรือน",
      ],
      aid: [
        "Help displaced people",
        "ช่วยเหลือผู้พลัดถิ่น",
        "You contribute to relief work.",
        "คุณร่วมช่วยงานบรรเทาทุกข์",
      ],
      service: [
        "Consider recognized service",
        "พิจารณางานรับใช้ที่ได้รับการรับรอง",
        "You review the responsibilities and danger.",
        "คุณพิจารณาหน้าที่และอันตรายอย่างรอบคอบ",
      ],
    },
  ),
  conflict: event(
    ["An original regional conflict", "ความขัดแย้งในภูมิภาคที่แต่งขึ้น"],
    [
      "This local conflict is authored game history. Shelter, relief and voluntary service have different consequences.",
      "ความขัดแย้งในพื้นที่นี้เป็นประวัติศาสตร์ที่แต่งขึ้นสำหรับเกม การหาที่พักพิง การบรรเทาทุกข์ และการอาสารับใช้ให้ผลต่างกัน",
    ],
    {
      neutral: [
        "Seek shelter",
        "หาที่พักพิง",
        "You seek civilian protection.",
        "คุณขอความคุ้มครองในฐานะพลเรือน",
      ],
      aid: [
        "Help with relief",
        "ช่วยงานบรรเทาทุกข์",
        "Your relief work supports the community.",
        "งานบรรเทาทุกข์ของคุณช่วยพยุงชุมชน",
      ],
      service: [
        "Consider voluntary service",
        "พิจารณาอาสารับใช้",
        "You review a dangerous service offer.",
        "คุณพิจารณาข้อเสนอทำงานที่มีอันตราย",
      ],
    },
  ),
  service: event(
    ["A consequential service offer", "ข้อเสนองานรับใช้ที่มีความเสี่ยง"],
    [
      "Voluntary military service pays thirty coins but carries a ten percent immediate fatal risk and may endanger dependants. You must decide manually.",
      "งานทหารโดยสมัครใจให้ค่าจ้างสามสิบเหรียญ แต่มีโอกาสเสียชีวิตทันทีสิบเปอร์เซ็นต์และอาจทำให้ผู้พึ่งพาเดือดร้อน คุณต้องตัดสินใจด้วยตนเอง",
    ],
    {
      accept: [
        "Accept dangerous service",
        "รับงานอันตราย",
        "Your service, reward and actual consequences are recorded.",
        "งานรับใช้ ค่าตอบแทน และผลที่เกิดขึ้นจริงได้รับการบันทึก",
      ],
      later,
    },
  ),
  orsted: event(
    ["An offer from Orsted’s organization", "ข้อเสนอจากองค์กรของออร์สเตด"],
    [
      "A contact offers paid assignments and demands trust, secrecy and service. Membership can expose your family to danger. Refusal is allowed.",
      "ผู้ติดต่อเสนองานมีค่าตอบแทน โดยต้องการความไว้ใจ การรักษาความลับ และการรับใช้ การเข้าร่วมอาจทำให้ครอบครัวเผชิญอันตราย คุณมีสิทธิ์ปฏิเสธ",
    ],
    {
      accept: [
        "Accept the allegiance",
        "ยอมรับการเข้าร่วม",
        "You knowingly accept obligations to Orsted’s organization.",
        "คุณยอมรับหน้าที่ผูกพันต่อองค์กรของออร์สเตดอย่างรับรู้",
      ],
      refuse: [
        "Decline the offer",
        "ปฏิเสธข้อเสนอ",
        "You decline without becoming a member.",
        "คุณปฏิเสธโดยไม่ได้กลายเป็นสมาชิก",
      ],
    },
  ),
  hitogami: event(
    ["Advice with a price", "คำแนะนำที่มีราคาต้องจ่าย"],
    [
      "Hitogami offers guidance tied to future obligations. Advice can create dependency and dangerous consequences. Refusal is allowed.",
      "ฮิโตงามิเสนอคำแนะนำที่ผูกกับหน้าที่ในอนาคต คำแนะนำอาจสร้างการพึ่งพาและผลอันตราย คุณมีสิทธิ์ปฏิเสธ",
    ],
    {
      accept: [
        "Accept the allegiance",
        "ยอมรับการเข้าร่วม",
        "You knowingly accept the obligations of an apostle.",
        "คุณยอมรับหน้าที่ผูกพันของสาวกอย่างรับรู้",
      ],
      refuse: [
        "Refuse the advice",
        "ปฏิเสธคำแนะนำ",
        "You refuse without becoming an apostle.",
        "คุณปฏิเสธโดยไม่ได้กลายเป็นสาวก",
      ],
    },
  ),
  assignment: event(
    ["An obligation comes due", "ถึงเวลาทำหน้าที่"],
    [
      "An authored assignment pays twenty coins, but carries a five percent fatal risk. Unfulfilled obligations erode trust.",
      "ภารกิจที่แต่งขึ้นนี้ให้ค่าจ้างยี่สิบเหรียญ แต่มีโอกาสเสียชีวิตห้าเปอร์เซ็นต์ การละเลยหน้าที่ทำให้ความไว้ใจลดลง",
    ],
    {
      accept: [
        "Carry out the assignment",
        "ทำภารกิจตามที่รับไว้",
        "You undertake the assignment with its stated danger.",
        "คุณรับภารกิจพร้อมอันตรายตามที่แจ้งไว้",
      ],
      later,
    },
  ),
  defect: event(
    ["Breaking an allegiance", "ถอนตัวจากพันธะ"],
    [
      "Defection ends membership, destroys faction trust and creates three years of possible pursuit.",
      "การถอนตัวทำให้สมาชิกภาพสิ้นสุด สูญเสียความไว้ใจของฝ่าย และเสี่ยงถูกไล่ล่าสามปี",
    ],
    {
      accept: [
        "Defect and accept the consequences",
        "ถอนตัวและยอมรับผลตามมา",
        "Your former allegiance may pursue you.",
        "ฝ่ายเดิมอาจออกตามล่าคุณ",
      ],
      later,
    },
  ),
  challenge: event(
    ["A challenge among the Seven Great Powers", "ท้าชิงตำแหน่งเจ็ดมหาอำนาจ"],
    [
      "Only positions five to seven are attainable, after K430. Mastery and renown permit a dangerous challenge; they never guarantee victory.",
      "หลังปี K430 คุณอาจท้าชิงได้เฉพาะอันดับห้าถึงเจ็ด ความเชี่ยวชาญและชื่อเสียงเปิดโอกาสให้ท้าประลองที่อันตราย แต่ไม่รับประกันชัยชนะ",
    ],
    { later },
  ),
  defense: event(
    ["A title must be defended", "ตำแหน่งที่ต้องรักษา"],
    [
      "An authored contender challenges your title. Defeat or withdrawal can end your current title without erasing its history.",
      "ผู้ท้าชิงที่แต่งขึ้นต้องการประลองกับคุณ ความพ่ายแพ้หรือการถอนตัวอาจทำให้เสียตำแหน่ง แต่ไม่ลบประวัติที่เคยได้รับ",
    ],
    {
      accept: [
        "Defend the title",
        "ป้องกันตำแหน่ง",
        "You face the risks of defending your standing.",
        "คุณเผชิญความเสี่ยงเพื่อรักษาตำแหน่ง",
      ],
      yield: [
        "Yield the title",
        "สละตำแหน่ง",
        "The title is lost; the earlier achievement remains.",
        "คุณเสียตำแหน่ง แต่ความสำเร็จเดิมยังอยู่ในบันทึก",
      ],
    },
  ),
  courtship: event(
    ["A new relationship", "ความสัมพันธ์ครั้งใหม่"],
    [
      "Both people must be adults. Shared time can deepen trust, but meeting is not marriage.",
      "ทั้งสองฝ่ายต้องเป็นผู้ใหญ่ เวลาที่ใช้ร่วมกันอาจเพิ่มความไว้วางใจ แต่การพบกันไม่ได้หมายถึงการสมรส",
    ],
    {
      meet: [
        "Make time to meet",
        "แบ่งเวลาเพื่อทำความรู้จัก",
        "You meet another adult and begin to know them.",
        "คุณพบผู้ใหญ่อีกคนหนึ่งและเริ่มทำความรู้จัก",
      ],
      later,
    },
  ),
  marriage: event(
    ["A marriage by mutual agreement", "การสมรสด้วยความยินยอมร่วมกัน"],
    [
      "Millis recognizes one current spouse. Elsewhere, another marriage requires the acceptance of existing partners. Household support costs increase.",
      "มิลิสยอมรับคู่สมรสปัจจุบันเพียงคนเดียว ในพื้นที่อื่น การสมรสเพิ่มต้องได้รับการยอมรับจากคู่เดิม ภาระค่าเลี้ยงดูจะเพิ่มขึ้น",
    ],
    { later },
  ),
  child: event(
    ["A decision to grow the family", "ตัดสินใจขยายครอบครัว"],
    [
      "An adult, consenting spouse and household resources matter. Each child becomes an individual with their own future. The simulation records at most twelve direct children.",
      "การมีคู่สมรสผู้ใหญ่ที่ยินยอมและทรัพยากรครัวเรือนเป็นสิ่งสำคัญ เด็กแต่ละคนจะมีอนาคตของตนเอง ระบบบันทึกบุตรโดยตรงได้สูงสุดสิบสองคน",
    ],
    {
      accept: [
        "Welcome a child together",
        "ต้อนรับลูกด้วยกัน",
        "A child is born into the family’s actual home.",
        "เด็กคนหนึ่งเกิดในถิ่นที่ครอบครัวอาศัยอยู่จริง",
      ],
      later,
    },
  ),
  family: event(
    ["The people beside you", "ผู้คนข้างกาย"],
    [
      "Family members study, work, form relationships and grow older independently. Their recorded lives are shown in the family details.",
      "สมาชิกครอบครัวเรียน ทำงาน สร้างความสัมพันธ์ และเติบโตอย่างเป็นอิสระ เรื่องราวที่บันทึกไว้แสดงในรายละเอียดครอบครัว",
    ],
    {
      friend: [
        "Develop a friendship",
        "สร้างมิตรภาพ",
        "You build an individual friendship and a new social contact.",
        "คุณสร้างมิตรภาพกับคนคนหนึ่งและได้รู้จักผู้ติดต่อใหม่",
      ],
      rival: [
        "Accept a respectful rivalry",
        "ยอมรับการแข่งขันอย่างให้เกียรติ",
        "A named rival becomes part of your social life.",
        "คู่แข่งคนหนึ่งเข้ามาเป็นส่วนหนึ่งของชีวิตในสังคม",
      ],
      separate: ['Agree to a separation','ตกลงแยกทาง','You end the current marriage and retain its history.','คุณยุติการสมรสปัจจุบันโดยเก็บประวัติเดิมไว้'],
      care: [
        "Spend time and care",
        "แบ่งเวลาและความเอาใจใส่",
        "You make relationships your yearly focus.",
        "คุณเลือกให้ความสัมพันธ์เป็นเป้าหมายประจำปี",
      ],
      later,
    },
  ),
  discovery: event(
    ["Understanding an observed sign", "ทำความเข้าใจสัญญาณที่สังเกตพบ"],
    [
      "Assessment can explain observed signs. Appearance alone, including Superd features, is never a diagnosis.",
      "การประเมินอาจอธิบายสัญญาณที่สังเกตพบได้ รูปลักษณ์เพียงอย่างเดียว รวมถึงลักษณะของเผ่าสเปิร์ด ไม่ใช่ข้อวินิจฉัย",
    ],
    {
      assess: [
        "Seek an assessment",
        "ขอรับการประเมิน",
        "Only an established discovery enters your personal record.",
        "เฉพาะสิ่งที่ตรวจพบจริงเท่านั้นจะเข้าสู่บันทึกส่วนตัว",
      ],
      later,
    },
  ),
  grant: event(
    ["Recognition for exceptional service", "เกียรติจากการรับใช้อย่างโดดเด่น"],
    [
      "A recognized grant can confer noble status, with obligations. It does not change your occupation or grant combat skill.",
      "การพระราชทานฐานันดรอาจทำให้คุณเป็นขุนนางพร้อมภาระหน้าที่ โดยไม่เปลี่ยนอาชีพหรือมอบทักษะต่อสู้",
    ],
    {
      accept: [
        "Accept status and obligations",
        "รับฐานันดรพร้อมหน้าที่",
        "Your social standing changes through recognized service.",
        "ฐานะทางสังคมเปลี่ยนไปจากงานรับใช้ที่ได้รับการยอมรับ",
      ],
      later,
    },
  ),
  retire: event(
    ["Another pace of life", "จังหวะชีวิตบทใหม่"],
    [
      "Retirement ends your current wages. Savings, family and recorded work remain. No pension is invented.",
      "การเกษียณทำให้ค่าจ้างปัจจุบันสิ้นสุด เงินออม ครอบครัว และประวัติการทำงานยังคงอยู่ โดยไม่มีบำนาญที่ไม่ได้บันทึกไว้",
    ],
    {
      accept: [
        "Retire from paid work",
        "เกษียณจากงานรับค่าจ้าง",
        "You leave the appointment and its wages.",
        "คุณออกจากตำแหน่งพร้อมยุติการรับค่าจ้าง",
      ],
      later,
    },
  ),
  research: event(
    ["A contribution to knowledge", "ร่วมสร้างองค์ความรู้"],
    [
      "Research needs a completed degree, subject mastery and patient work.",
      "การวิจัยต้องอาศัยปริญญา ความเชี่ยวชาญในวิชา และความพยายามอย่างอดทน",
    ],
    {
      accept: [
        "Complete a research project",
        "ทำโครงการวิจัยให้สำเร็จ",
        "Your original contribution joins the research record.",
        "ผลงานของคุณเข้าสู่บันทึกการวิจัย",
      ],
      later,
    },
  ),
};
export const EXPANDED_LABELS: Record<string, Pair> = {
  child: ["Child", "เด็ก"],
  student: ["Student", "นักเรียน"],
  laborer: ["Local worker", "คนทำงานในชุมชน"],
  farmer: ["Farmer", "เกษตรกร"],
  merchant: ["Merchant", "พ่อค้า"],
  guard: ["Guard", "ยาม"],
  adventurer: ["Adventurer", "นักผจญภัย"],
  swordsman: ["Swordsman", "นักดาบ"],
  mage: ["Mage", "จอมเวท"],
  healer: ["Healer", "ผู้รักษา"],
  cleric: ["Cleric", "นักบวช"],
  knight: ["Knight", "อัศวิน"],
  teacher: ["Teacher", "ครู"],
  professor: ["Professor", "ศาสตราจารย์"],
  retired: ["Retired", "ผู้เกษียณ"],
  poor: ["Poor", "ยากจน"],
  modest: ["Modest", "พอมีพอกิน"],
  comfortable: ["Comfortable", "มีฐานะมั่นคง"],
  extreme: ["Extremely wealthy", "ร่ำรวยมาก"],
  noble: ["Noble", "ขุนนาง"],
  commoner: ["Commoner", "สามัญชน"],
  none: ["Not recorded", "ยังไม่มีบันทึก"],
  basic: ["Basic schooling", "การศึกษาขั้นพื้นฐาน"],
  university: ["University attendance", "กำลังเรียนมหาวิทยาลัย"],
  graduated: ["Graduated", "สำเร็จการศึกษา"],
  withdrawn: ["Study interrupted", "ยุติการศึกษา"],
  illness: ["Illness without adequate recovery", "เจ็บป่วยจนไม่อาจฟื้นตัว"],
  malnutrition: [
    "Malnutrition and unmet food needs",
    "ขาดสารอาหารและอาหารไม่เพียงพอ",
  ],
  "unsafe-work": ["A fatal work accident", "อุบัติเหตุร้ายแรงจากงาน"],
  violence: [
    "Violence and exposed living conditions",
    "ความรุนแรงและสภาพชีวิตที่เสี่ยงภัย",
  ],
  travel: ["A fatal journey", "เสียชีวิตระหว่างเดินทาง"],
  aging: ["Old age", "ชราภาพ"],
  service: ["Dangerous military service", "งานทหารที่อันตราย"],
  assignment: ["A dangerous faction assignment", "ภารกิจอันตรายของฝ่าย"],
  duel: ["A fatal title challenge", "การประลองท้าชิงตำแหน่งถึงตาย"],
  age: ["Age", "อายุ"],
  knowledge: ["Knowledge", "ความรู้"],
  readiness: ["Demonstrated readiness", "ความพร้อมที่พิสูจน์แล้ว"],
  funding: ["Complete funding", "ทุนค่าใช้จ่ายทั้งหมด"],
  appointment: ["Appointment", "การรับตำแหน่ง"],
  health: ["Health", "สุขภาพ"],
  capital: ["Available coins", "เงินที่ใช้ได้"],
  sword: ["Sword experience", "ประสบการณ์ดาบ"],
  skill: ["Relevant experience", "ประสบการณ์ที่เกี่ยวข้อง"],
  instruction: ["Instruction rank", "ระดับการเรียนกับครู"],
  magic: ["Discipline experience", "ประสบการณ์สายเวท"],
  healing: ["Healing experience", "ประสบการณ์เวทรักษา"],
  trust: ["Institutional trust", "ความไว้ใจจากสถาบัน"],
  patron: ["Patron or recognized merit", "ผู้อุปถัมภ์หรือผลงานที่ยอมรับ"],
  equipment: ["Equipment funding", "ทุนซื้ออุปกรณ์"],
  reputation: ["Reputation", "ชื่อเสียง"],
  degree: ["Completed degree", "ปริญญาที่สำเร็จแล้ว"],
  research: ["Research contributions", "ผลงานวิจัย"],
  teaching: ["Years teaching", "ปีที่สอน"],
  food: [
    "Food is insufficient. Seek household aid or paid work.",
    "อาหารไม่เพียงพอ ควรขอความช่วยเหลือให้ครัวเรือนหรือหางานรับค่าจ้าง",
  ],
  shelter: [
    "Shelter needs are unmet. Support or protection can help.",
    "ที่พักยังไม่เพียงพอ ความช่วยเหลือหรือความคุ้มครองอาจช่วยได้",
  ],
  care: [
    "Care is insufficient. Resources and recovery matter.",
    "การรักษายังไม่เพียงพอ ทรัพยากรและการพักฟื้นเป็นสิ่งสำคัญ",
  ],
  identity: ["Identity and ending", "ตัวตนและจุดจบ"],
  childhood: ["Childhood and opportunity", "วัยเด็กและโอกาส"],
  work: ["Work and education", "งานและการศึกษา"],
  public: ["Public life and history", "ชีวิตในสังคมและประวัติศาสตร์"],
  family: ["Family and relationships", "ครอบครัวและความสัมพันธ์"],
  legacy: ["Material legacy", "มรดกที่ทิ้งไว้"],
  parent: ["Parent", "พ่อหรือแม่"],
  spouse: ["Spouse or prospective partner", "คู่สมรสหรือผู้ที่กำลังรู้จัก"],
  descendant: ["Descendant", "ผู้สืบสกุล"],
  inlaw: ["Relative by marriage", "ญาติทางการสมรส"],
  friend: ["Friend", "มิตร"],
  rival: ["Rival", "คู่แข่ง"],
  enemy: ["Enemy", "ศัตรู"],
  civilian: ["Affected civilian", "พลเรือนที่ได้รับผลกระทบ"],
  participant: ["Participant", "ผู้เข้าร่วม"],
  support: ["Relief or support", "ผู้ช่วยบรรเทาทุกข์"],
  news: ["Distant news", "ผู้รับข่าวจากแดนไกล"],
  orsted: ["Orsted’s organization", "องค์กรของออร์สเตด"],
  hitogami: ["Hitogami’s apostles", "สาวกของฮิโตงามิ"],
  fittoa: ["Fittoa", "ฟิตโตอา"],
  "capital-city": ["Capital", "เมืองหลวง"],
  countryside: ["Countryside", "ชนบท"],
  settlement: ["Local settlement", "ชุมชนในพื้นที่"],
  displaced: ["Displaced settlement", "ถิ่นพักพิงหลังพลัดถิ่น"],
};
export function expandedLabel(key: string, language: Language = "en"): string {
  return EXPANDED_LABELS[key]?.[language === "th" ? 1 : 0] ?? key;
}
export function expandedRecordLabel(
  key: string,
  language: Language = "en",
): string {
  const i = language === "th" ? 1 : 0;
  const names: Record<string, Pair> = {
    calamity: ["Mana Calamity", "ภัยพิบัติมานา"],
    "asura-succession": ["Asura succession", "การสืบราชบัลลังก์อัสรา"],
    "ariel-accession": ["Ariel’s accession", "แอเรียลขึ้นครองบัลลังก์"],
    "authored-conflict": [
      "Authored regional conflict",
      "ความขัดแย้งในภูมิภาคที่แต่งขึ้น",
    ],
    assessment: ["Talent assessment", "การประเมินความสามารถ"],
    scholarship: ["Scholarship awarded", "ได้รับทุนการศึกษา"],
    enrolled: ["University enrollment", "เข้าเรียนมหาวิทยาลัย"],
    probation: ["Study probation", "ภาคทัณฑ์การศึกษา"],
    withdrawn: ["Study interrupted", "ยุติการศึกษา"],
    graduated: ["Graduated", "สำเร็จการศึกษา"],
    research: ["Research contribution", "ผลงานวิจัย"],
    factor: ["Discovered Laplace Factor", "ตรวจพบปัจจัยลาปลาซ"],
    mana: ["Mana potential", "ศักยภาพมานา"],
    physical: ["Physical potential", "ศักยภาพร่างกาย"],
    appearance: ["Observed appearance", "รูปลักษณ์ที่สังเกตพบ"],
    "noble-grant": ["Recognized noble grant", "ได้รับฐานันดรที่รับรอง"],
    "title-won": ["Title won", "ได้รับตำแหน่ง"],
    "title-lost": ["Title lost", "สูญเสียตำแหน่ง"],
    defected: ["Defection", "ถอนตัวจากฝ่าย"],
    "unfulfilled-obligations": [
      "Unfulfilled obligations",
      "หน้าที่ที่ไม่ได้ทำ",
    ],
    service: ["Recognized service", "งานรับใช้ที่รับรอง"],
    assignment: ["Faction assignment", "ภารกิจของฝ่าย"],
  };
  if (key.startsWith("joined-"))
    return `${i ? "เข้าร่วม" : "Joined"} ${expandedLabel(key.slice(7), language)}`;
  if (key.startsWith("refused-"))
    return `${i ? "ปฏิเสธ" : "Declined"} ${expandedLabel(key.slice(8), language)}`;
  return names[key]?.[i] ?? expandedLabel(key, language);
}
export function expandedDecisionText(
  d: Decision,
  language: Language,
): Decision {
  const key = d.id.slice(9),
    copy = EXPANDED_COPY[key];
  if (!copy || language === "en") return d;
  return {
    ...d,
    title: copy.title[1],
    text: copy.text[1],
    kind: "ชีวิต",
    choices: d.choices.map((c) => {
      const action = c.id.split(".")[2],
        text = copy.choices[action];
      const dynamic = action?.startsWith("job-")
        ? expandedLabel(action.slice(4), language)
        : action?.startsWith("move-")
          ? domainText(
              language,
              REGIONS[action.slice(5) as keyof typeof REGIONS]?.name ?? "",
            )
          : action?.startsWith("rank-")
            ? `อันดับ ${action.slice(5)}`
            : action?.startsWith("marry-")
              ? c.label
              : null;
      return {
        ...c,
        label: text?.[1] ?? dynamic ?? c.label,
        description: text?.[3] ?? "พิจารณาค่าใช้จ่ายและเงื่อนไขก่อนตัดสินใจ",
        outcome: text?.[3] ?? "การตัดสินใจและผลที่เกิดขึ้นจริงได้รับการบันทึก",
      };
    }),
  };
}
export function expandedEntryText(
  entry: Entry,
  language: Language,
): { title: string; text: string } | null {
  const key = entry.message?.key;
  if (!key?.startsWith("expanded.")) return null;
  if (key === "expanded.fatal-choice")
    return {
      title:
        language === "th" ? "ผลร้ายแรงของการตัดสินใจ" : "A fatal consequence",
      text:
        language === "th"
          ? `ชีวิตนี้สิ้นสุดจาก${expandedLabel(String(entry.message?.params?.cause ?? ""), language)}`
          : entry.text,
    };
  const suffix = key.slice(9),
    [eventId, action] = suffix.split("."),
    copy = EXPANDED_COPY[eventId],
    i = language === "th" ? 1 : 0;
  if (copy && action) {
    const c = copy.choices[action];
    if (c) return { title: c[i], text: c[2 + i] };
  }
  if (language === "en") return { title: entry.title, text: entry.text };
  if (suffix === "birth")
    return {
      title: "ชีวิตบทใหม่ในกระแสประวัติศาสตร์",
      text: "ชีวิตใหม่เริ่มขึ้นพร้อมความทรงจำจากอีกโลกหนึ่ง ชาติกำเนิด ทรัพยากร และยุคสมัยจะส่งผลต่อโอกาสของคุณ",
    };
  if (suffix === "year")
    return {
      title: "หนึ่งปีแห่งความเปลี่ยนแปลง",
      text: "อีกปีผ่านไปพร้อมการฝึก งาน และเวลาที่แบ่งให้ผู้คนรอบตัว",
    };
  if (suffix === "ending")
    return {
      title: "หน้าสุดท้ายของชีวิต",
      text: expandedLabel(entry.text, language),
    };
  return {
    title: copy?.title[i] ?? "บันทึกการตัดสินใจ",
    text:
      copy?.text[i] ??
      "การตัดสินใจและผลที่เกิดขึ้นจริงได้รับการบันทึกไว้ในรายละเอียดชีวิต",
  };
}
