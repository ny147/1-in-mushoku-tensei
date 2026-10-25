import type { Language } from "../game/types";

export const WORLD_TH: Record<string, string> = {
  Human: "มนุษย์",
  Elf: "เอลฟ์",
  Beastfolk: "เผ่าสัตว์",
  Migurd: "เผ่ามิกุรด์",
  Dwarf: "คนแคระ",
  "A brief life, with room for extraordinary things.":
    "ชีวิตแสนสั้นที่ยังมีที่ว่างให้สิ่งพิเศษเกิดขึ้น",
  "The seasons turn slowly for your people.":
    "ฤดูกาลผันผ่านอย่างเชื่องช้าสำหรับเผ่าพันธุ์ของคุณ",
  "Keen senses and a deep connection to your kin.":
    "ประสาทสัมผัสเฉียบคมและสายสัมพันธ์อันลึกซึ้งกับพวกพ้อง",
  "A long-lived demon people of the Demon Continent.":
    "ชนเผ่าปีศาจอายุยืนแห่งทวีปปีศาจ",
  "Patient hands, enduring spirit, and a gift for craft.":
    "มือที่ประณีต จิตใจอดทน และพรสวรรค์ด้านงานช่าง",
  "Asura Kingdom": "อาณาจักรอัสรา",
  Asura: "อัสรา",
  "Ranoa Kingdom": "อาณาจักรราโนอา",
  Ranoa: "ราโนอา",
  "Holy Country of Millis": "ศาสนจักรมิลิส",
  Millis: "มิลิส",
  "The Great Forest": "มหาพงไพร",
  "Great Forest": "มหาพงไพร",
  "Demon Continent": "ทวีปปีศาจ",
  "Begaritt Continent": "ทวีปเบการิตต์",
  Begaritt: "เบการิตต์",
  "a village in the Asura countryside": "หมู่บ้านในชนบทของอัสรา",
  "the outskirts of Sharia": "ชานเมืองชาเรีย",
  "a town outside Millishion": "เมืองใกล้มิลิชิออน",
  "a settlement beneath the Great Forest canopy": "ชุมชนใต้ร่มไม้แห่งมหาพงไพร",
  "a settlement near Rikarisu": "ชุมชนใกล้ริคาริส",
  "an oasis settlement near Rapan": "ชุมชนโอเอซิสใกล้ราปัน",
  "Golden fields, busy trade roads, and the long shadow of the nobility. Opportunity and inequality grow side by side.":
    "ทุ่งสีทอง เส้นทางการค้าคึกคัก และเงาอำนาจของขุนนาง โอกาสและความเหลื่อมล้ำเติบโตเคียงข้างกัน",
  "Snow on the rooftops and magic in the lecture halls. The northern lands reward curious minds and stubborn resolve.":
    "หิมะคลุมหลังคาและเวทมนตร์อยู่ในห้องเรียน ดินแดนเหนือให้รางวัลแก่ความใฝ่รู้และความมุ่งมั่น",
  "Cathedral bells ring over white stone streets. Healers, merchants, and faithful travelers find a home here.":
    "ระฆังวิหารกังวานเหนือถนนหินขาว ผู้รักษา พ่อค้า และผู้เดินทางที่เปี่ยมศรัทธาพบที่พักพิงที่นี่",
  "Ancient trees shelter close-knit communities. The forest gives generously to those who learn to listen.":
    "ไม้เก่าแก่ปกป้องชุมชนที่ผูกพันกันแน่นแฟ้น ป่ามอบสิ่งมากมายแก่ผู้ที่เรียนรู้จะรับฟัง",
  "Rugged earth, strange skies, and formidable monsters. The people here know the value of trust and a shared meal.":
    "ผืนดินขรุขระ ฟ้าแปลกตา และอสูรร้าย ผู้คนที่นี่รู้คุณค่าของความไว้วางใจและอาหารที่แบ่งปันกัน",
  "Caravans cross the desert between ancient labyrinths. Every journey begins with water, preparation, and a little courage.":
    "กองคาราวานข้ามทะเลทรายระหว่างเขาวงกตโบราณ ทุกการเดินทางเริ่มด้วยน้ำ การเตรียมตัว และความกล้าอีกเล็กน้อย",
  "Trade & swordsmanship": "การค้าและวิชาดาบ",
  "Magic & scholarship": "เวทมนตร์และวิชาการ",
  "Healing & community": "การรักษาและชุมชน",
  "Kinship & exploration": "สายสัมพันธ์และการสำรวจ",
  "Adventuring & resilience": "การผจญภัยและความทรหด",
  "Trade & labyrinths": "การค้าและเขาวงกต",
  "Take it all in": "เปิดรับทุกสิ่ง",
  "A little learning, a little living.": "เรียนรู้บ้าง ใช้ชีวิตบ้าง",
  "Practice magic": "ฝึกเวทมนตร์",
  "Develop mana and magical skill.": "พัฒนามานาและทักษะเวทมนตร์",
  "Train with a sword": "ฝึกดาบ",
  "Build technique and resilience.": "ฝึกเทคนิคและความอดทน",
  "Read & learn": "อ่านและเรียนรู้",
  "Turn old memories into new knowledge.":
    "เปลี่ยนความทรงจำเก่าให้เป็นความรู้ใหม่",
  "Earn a living": "ทำมาหากิน",
  "More silver, less time for yourself.":
    "มีเงินเพิ่มขึ้น แต่มีเวลาให้ตัวเองน้อยลง",
  "Family & friends": "ครอบครัวและมิตรสหาย",
  "Make this life a shared one.": "แบ่งปันชีวิตนี้กับคนรอบข้าง",
  "Explore the world": "สำรวจโลก",
  "Find stories beyond the familiar.": "ค้นหาเรื่องราวนอกพื้นที่คุ้นเคย",
  "Slow down": "ผ่อนจังหวะชีวิต",
  "Look after your body and mind.": "ดูแลร่างกายและจิตใจ",
  "A new beginning": "การเริ่มต้นใหม่",
  "Magic student": "นักเรียนเวทมนตร์",
  "Guild adventurer": "นักผจญภัยประจำกิลด์",
  Merchant: "พ่อค้า",
  "Town healer": "ผู้รักษาประจำเมือง",
  "Town guard": "ทหารยามประจำเมือง",
  Teacher: "ครู",
  "A quieter chapter": "บทชีวิตที่สงบลง",
  Beginner: "ชั้นต้น",
  Intermediate: "ชั้นกลาง",
  Advanced: "ชั้นสูง",
  Saint: "ขั้นศักดิ์สิทธิ์",
  King: "ขั้นราชา",
  Emperor: "ขั้นจักรพรรดิ",
  God: "ขั้นเทพ",
  Infancy: "วัยทารก",
  Childhood: "วัยเด็ก",
  Youth: "วัยเยาว์",
  Adulthood: "วัยผู้ใหญ่",
  "Later years": "บั้นปลายชีวิต",
  "Water magic": "เวทน้ำ",
  "Fire magic": "เวทไฟ",
  "Earth magic": "เวทดิน",
  "Wind magic": "เวทลม",
  "Healing magic": "เวทรักษา",
  "Control, precision, and the movement of water.":
    "การควบคุม ความแม่นยำ และการเคลื่อนไหวของน้ำ",
  "Temperature, restraint, and controlled release.":
    "อุณหภูมิ ความยับยั้งชั่งใจ และการปลดปล่อยพลังอย่างควบคุม",
  "Structure, craftsmanship, and enduring defenses.":
    "โครงสร้าง งานช่าง และการป้องกันที่มั่นคง",
  "Pressure, movement, and reading the air.":
    "แรงดัน การเคลื่อนไหว และการอ่านกระแสอากาศ",
  "Care, anatomy, and learning when magic is not enough.":
    "การดูแล กายวิภาค และการรู้ว่าเมื่อใดเวทมนตร์เพียงอย่างเดียวไม่พอ",
  "Gather water": "รวบรวมน้ำ",
  "Draw a small amount of water from mana.": "สร้างน้ำปริมาณเล็กน้อยจากมานา",
  "Water Ball": "ลูกบอลน้ำ",
  "Shape and direct a stable sphere of water.":
    "สร้างทรงกลมน้ำที่คงรูปและบังคับทิศทาง",
  "Water Lance": "หอกน้ำ",
  "Maintain a precise, pressurized stream.": "คงกระแสน้ำแรงดันสูงอย่างแม่นยำ",
  Raincalling: "เรียกฝน",
  "Coordinate water over a broad area.": "ควบคุมน้ำครอบคลุมพื้นที่กว้าง",
  "River Ward": "ปราการสายน้ำ",
  "Sustain a powerful protective current.": "รักษากระแสน้ำป้องกันอันทรงพลัง",
  "Tidal Sanctuary": "อาณาเขตวารี",
  "Balance a vast, moving field of water.":
    "รักษาสมดุลของมวลน้ำที่เคลื่อนตัวในพื้นที่กว้างใหญ่",
  Ember: "ถ่านคุ",
  "Kindle a steady flame.": "จุดเปลวไฟที่ลุกอย่างสม่ำเสมอ",
  Fireball: "ลูกไฟ",
  "Direct flame without losing control.": "บังคับเปลวไฟโดยไม่สูญเสียการควบคุม",
  "Flame Lance": "หอกเพลิง",
  "Concentrate heat into a narrow point.": "รวมความร้อนไว้ที่จุดเล็กจุดเดียว",
  Firestorm: "พายุเพลิง",
  "Control many flames without burning beyond their bounds.":
    "ควบคุมเปลวไฟหลายสายโดยไม่ให้ลุกลามนอกขอบเขต",
  "Hearth Ward": "เขตคุ้มครองไออุ่น",
  "Regulate a large field of heat.": "ควบคุมอุณหภูมิในพื้นที่ขนาดใหญ่",
  Sunforge: "เตาหลอมสุริยะ",
  "Sustain extraordinary heat with disciplined precision.":
    "คงความร้อนมหาศาลด้วยความแม่นยำและวินัย",
  "Earth Shaping": "ปั้นดิน",
  "Give a handful of earth a new form.": "เปลี่ยนรูปดินหนึ่งกำมือ",
  "Stone Cannon": "ปืนใหญ่ศิลา",
  "Shape and launch a reliable stone projectile.":
    "สร้างและยิงก้อนหินได้อย่างมั่นคง",
  "Stone Wall": "กำแพงหิน",
  "Raise a stable defensive structure.": "สร้างโครงสร้างป้องกันที่มั่นคง",
  "Earth Rampart": "เชิงเทินปฐพี",
  "Build complex, reinforced earthworks.":
    "สร้างแนวป้องกันดินที่ซับซ้อนและแข็งแรง",
  "Living Foundation": "รากฐานเชื่อมประสาน",
  "Strengthen a network of interconnected structures.":
    "เสริมความแข็งแกร่งให้โครงสร้างที่เชื่อมถึงกัน",
  "Mountain Keep": "ป้อมขุนเขา",
  "Sustain massive protective earthworks.": "รักษาปราการดินขนาดมหึมา",
  Breeze: "สายลม",
  "Guide a gentle current of air.": "นำทางกระแสลมอ่อน",
  "Wind Blade": "คมดาบวายุ",
  "Shape a directed cutting current.": "สร้างกระแสลมคมกริบและบังคับทิศทาง",
  "Storm Step": "ก้าวพายุ",
  "Coordinate precise bursts of moving air.":
    "ประสานแรงลมเป็นจังหวะอย่างแม่นยำ",
  "Storm Ward": "ปราการพายุ",
  "Maintain a broad protective circulation.":
    "รักษาวงกระแสลมป้องกันในพื้นที่กว้าง",
  "Sky Passage": "เส้นทางนภา",
  "Stabilize complex currents over distance.":
    "รักษาสมดุลกระแสลมที่ซับซ้อนในระยะไกล",
  "Tempest Weave": "สายสานวายุ",
  "Coordinate many powerful, interlocking air currents.":
    "ประสานกระแสลมทรงพลังหลายสายเข้าด้วยกัน",
  "First Aid": "ปฐมพยาบาล",
  "Support the treatment of small injuries.": "ช่วยรักษาบาดแผลเล็กน้อย",
  "Healing Touch": "สัมผัสเยียวยา",
  "Guide focused healing through careful contact.":
    "นำพลังรักษาอย่างเจาะจงผ่านการสัมผัสที่ระมัดระวัง",
  "Mending Circle": "วงแหวนสมานแผล",
  "Sustain a more demanding course of treatment.":
    "ประคองการรักษาที่ต้องใช้พลังมากขึ้น",
  Restoration: "ฟื้นฟู",
  "Coordinate complex healing under supervision.":
    "ประสานการรักษาที่ซับซ้อนภายใต้การดูแล",
  Sanctuary: "เขตพักพิง",
  "Support a team through prolonged, difficult treatment.":
    "สนับสนุนทีมในการรักษาที่ยาวนานและยากลำบาก",
  Lifeward: "พิทักษ์ชีวิต",
  "Apply exceptional precision to the protection of life.":
    "ใช้ความแม่นยำขั้นสูงเพื่อปกป้องชีวิต",
  "Seasoned adventurer": "นักผจญภัยชำนาญการ",
  "Party leader": "หัวหน้าคณะผจญภัย",
  "Guild veteran": "นักผจญภัยอาวุโส",
  "Established trader": "พ่อค้าที่ตั้งตัวได้",
  "Caravan master": "หัวหน้าคาราวาน",
  "Guild factor": "ตัวแทนการค้าของกิลด์",
  "Senior healer": "ผู้รักษาอาวุโส",
  "Clinic lead": "หัวหน้าสถานพยาบาล",
  "Master healer": "ปรมาจารย์การรักษา",
  "Senior guard": "ทหารยามอาวุโส",
  "Watch sergeant": "นายหมู่ยาม",
  "Watch captain": "ผู้บัญชาการยาม",
  "Senior instructor": "ครูอาวุโส",
  "Department tutor": "อาจารย์ประจำสาขา",
  "Head instructor": "หัวหน้าผู้สอน",
  "A farming family": "ครอบครัวชาวไร่",
  "A family of craftspeople": "ครอบครัวช่างฝีมือ",
  "A traveling merchant family": "ครอบครัวพ่อค้าเร่",
  "A modest household": "ครอบครัวธรรมดา",
  "A well-established family": "ครอบครัวที่มีฐานะมั่นคง",
  "A feel for water magic": "สัมผัสพิเศษต่อเวทน้ำ",
  "A quick, curious mind": "หัวไวและใฝ่รู้",
  "An instinct for the sword": "สัญชาตญาณด้านดาบ",
  "A gift for connecting with people": "พรสวรรค์ในการผูกมิตร",
  "Quietly curious": "ช่างสงสัยอย่างเงียบ ๆ",
  "Warm-hearted": "ใจอบอุ่น",
  Resolute: "แน่วแน่",
  Thoughtful: "ช่างคิด",
  "Restlessly hopeful": "เปี่ยมหวังและไม่อยู่นิ่ง",
  "Elemental magic": "เวทธาตุ",
  "Not yet chosen": "ยังไม่ได้เลือก",
  "Sword God": "เทพดาบ",
  "Water God": "เทพวารี",
  "North God": "เทพอุดร",
  "Water & earth": "น้ำและดิน",
  Healing: "การรักษา",
  Mother: "แม่",
  Father: "พ่อ",
  Partner: "คู่ชีวิต",
  Child: "ลูก",
  "Ranoa University": "มหาวิทยาลัยราโนอา",
};

const folded = new Map(
  Object.entries(WORLD_TH).map(([key, value]) => [key.toLowerCase(), value]),
);
for (const [key, value] of Object.entries(WORLD_TH))
  if (key.startsWith("A ")) folded.set(key.slice(2).toLowerCase(), value);
export function domainText(language: Language, value: string): string {
  return language === "en" ? value : (folded.get(value.toLowerCase()) ?? value);
}
