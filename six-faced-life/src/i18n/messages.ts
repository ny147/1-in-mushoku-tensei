import type { Language } from "../game/types";
import { domainText } from "./world";

export const UI_TH: Record<string, string> = {
  "A second chance": "โอกาสครั้งที่สอง",
  "Your chronicle": "บันทึกชีวิต",
  "Your character": "ตัวตนของคุณ",
  "The world": "โลกกว้าง",
  "Past lives": "ชีวิตที่ผ่านมา",
  "The person you’re becoming.": "ตัวตนที่ค่อย ๆ เติบโต",
  "Beyond the familiar.": "พ้นจากสิ่งคุ้นเคย",
  "The lives you’ve lived.": "ชีวิตที่เคยใช้มา",
  "A little guidance.": "คำแนะนำเล็กน้อย",
  "Skip to your story": "ข้ามไปยังเรื่องราว",
  "Close navigation": "ปิดเมนู",
  "Open navigation": "เปิดเมนู",
  "Main navigation": "เมนูหลัก",
  "· Age": "· อายุ",
  "A reincarnated soul": "ดวงวิญญาณที่เกิดใหม่",
  "How to play": "วิธีเล่น",
  "In the world of": "ในโลกของ",
  "Mushoku Tensei": "มุโชคุ เทนเซย์",
  "An unofficial fan creation": "ผลงานแฟนสร้างอย่างไม่เป็นทางการ",
  "The Six-Faced World": "โลกหกหน้า",
  "THE SIX-FACED WORLD": "โลกหกหน้า",
  "N ↑": "เหนือ ↑",
  "Lives are stored only in this browser":
    "บันทึกชีวิตเก็บไว้ในเบราว์เซอร์นี้เท่านั้น",
  "Saved on this device": "บันทึกในอุปกรณ์นี้แล้ว",
  "Not saved": "ยังไม่ได้บันทึก",
  "New life": "ชีวิตใหม่",
  "Dismiss message": "ปิดข้อความ",
  "Your latest progress is saved on this device.":
    "บันทึกความคืบหน้าล่าสุดในอุปกรณ์นี้แล้ว",
  "Local storage is unavailable. You can play, but this browser will not keep your story when you close it.":
    "พื้นที่เก็บข้อมูลใช้ไม่ได้ คุณยังเล่นต่อได้ แต่เบราว์เซอร์นี้จะไม่เก็บเรื่องราวหลังปิดหน้า",
  "Your saved chronicle could not be opened. It has been left untouched. You can begin a new life, or try again in a browser with local storage enabled.":
    "เปิดบันทึกชีวิตไม่ได้ ข้อมูลเดิมยังไม่ถูกแก้ไข คุณเริ่มชีวิตใหม่ได้ หรือลองอีกครั้งเมื่อเบราว์เซอร์เปิดใช้พื้นที่เก็บข้อมูล",
  "Your progress has not been saved.": "ยังไม่ได้บันทึกความคืบหน้า",
  "Your existing save could not be opened.": "เปิดบันทึกเดิมไม่ได้",
  "Your current life is still open here. Keep this tab open and try saving again before you leave.":
    "ชีวิตปัจจุบันยังอยู่ในหน้านี้ โปรดเปิดแท็บไว้และลองบันทึกอีกครั้งก่อนออก",
  "Retry loading": "ลองโหลดอีกครั้ง",
  "Retry save": "ลองบันทึกอีกครั้ง",
  "A life worth remembering.": "ชีวิตที่ควรค่าแก่การจดจำ",
  "Your story begins here.": "เรื่องราวของคุณเริ่มที่นี่",
  "The gifts you were given. The choices you’ve made.":
    "พรสวรรค์ที่ได้รับ ทางเลือกที่เคยเลือก",
  "There is always something beyond the next horizon.":
    "ยังมีบางสิ่งรออยู่พ้นขอบฟ้าเสมอ",
  "Every ending is also a story worth keeping.":
    "ทุกจุดจบมีเรื่องราวที่ควรเก็บไว้",
  "One lifetime, one choice at a time.": "หนึ่งชีวิต ทีละทางเลือก",
  Age: "อายุ",
  "Age {age}": "อายุ {age}",
  years: "ปี",
  year: "ปี",
  "years old": "ปี",
  "years old ·": "ปี ·",
  "Time controls": "ควบคุมเวลา",
  "Watch mode is choosing for you": "โหมดเฝ้าดูกำลังเลือกให้คุณ",
  "A choice is waiting for you": "มีทางเลือกกำลังรอคุณ",
  "Time is moving": "เวลากำลังเดิน",
  "Time is paused": "เวลาหยุดอยู่",
  "An affordable option without a danger marker will be chosen automatically. Pause or turn Watch mode off to decide yourself.":
    "ระบบจะเลือกตัวเลือกที่จ่ายไหวและไม่มีสัญลักษณ์อันตรายโดยอัตโนมัติ หยุดเวลาหรือปิดโหมดเฝ้าดูเพื่อตัดสินใจเอง",
  "Choose an option in your story before time can move on.":
    "เลือกทางในเรื่องราวก่อนที่เวลาจะเดินต่อ",
  "Continue to the next decision, advance up to one year, or press Play to let time pass.":
    "ไปยังทางเลือกถัดไป เดินเวลาได้สูงสุดหนึ่งปี หรือกดเล่นเพื่อปล่อยเวลาให้ผ่านไป",
  "Review choices": "ดูทางเลือก",
  "Pause time": "หยุดเวลา",
  "Play time": "เดินเวลา",
  Pause: "หยุด",
  Play: "เล่น",
  "Playback speed": "ความเร็วเวลา",
  "% of this year": "% ของปีนี้",
  "Watch mode": "โหมดเฝ้าดู",
  "Advance up to one year; stop early if a choice appears":
    "เดินเวลาได้สูงสุดหนึ่งปี และหยุดก่อนหากมีทางเลือก",
  "+1 year": "+1 ปี",
  "Advance until the next choice, up to twelve years at a time":
    "เดินเวลาถึงทางเลือกถัดไป ครั้งละไม่เกินสิบสองปี",
  "Next decision": "ทางเลือกถัดไป",
  "Watch mode makes choices for you while time plays.":
    "โหมดเฝ้าดูตัดสินใจให้ขณะเวลาเดิน",
  "No two lives are quite the same.": "ไม่มีสองชีวิตใดเหมือนกันทั้งหมด",
  "An unofficial fan-made simulation":
    "เกมจำลองชีวิตที่แฟนสร้างอย่างไม่เป็นทางการ",
  "A name waiting for a story.": "ชื่อที่รอเรื่องราว",
  "Begin a life to discover the person you might become.":
    "เริ่มชีวิตเพื่อค้นพบว่าคุณอาจเติบโตเป็นใคร",
  "Begin a new life": "เริ่มชีวิตใหม่",
  "Back to your story": "กลับสู่เรื่องราว",
  "You have another chance at a life.": "คุณมีโอกาสใช้ชีวิตอีกครั้ง",
  "Your protagonist remembers a previous world. Their birthplace, family, race, and gifts shape the opportunities ahead—but your choices help decide what happens next.":
    "ตัวเอกจำโลกก่อนหน้าได้ บ้านเกิด ครอบครัว เผ่าพันธุ์ และพรสวรรค์หล่อหลอมโอกาสข้างหน้า แต่การเลือกของคุณมีส่วนกำหนดสิ่งที่จะเกิดขึ้น",
  "Let time move, or turn the page yourself.":
    "ปล่อยเวลาเดิน หรือพลิกหน้าด้วยตัวเอง",
  "Press Play to let years pass. Use the speed buttons to move faster, +1 year for a smaller step, or Next decision to reach the next choice. Time always stops for decisions. The space bar toggles play when you aren’t using a form or button.":
    "กดเล่นเพื่อให้ปีผ่านไป ปรับความเร็วเพื่อเดินเวลาเร็วขึ้น ใช้ +1 ปีเพื่อเดินช่วงสั้น หรือทางเลือกถัดไปเพื่อไปถึงการตัดสินใจ เวลาเห็นทางเลือกเวลาจะหยุดเสมอ กดแป้นเว้นวรรคเพื่อเล่นหรือหยุดเมื่อไม่ได้ใช้แบบฟอร์มหรือปุ่ม",
  "Decide what matters this year.": "เลือกสิ่งสำคัญของปีนี้",
  "Change your yearly focus to develop magic, train a sword style, study, earn silver, explore, rest, or spend time with others. More priorities open as you grow. Health, happiness, knowledge, and bonds all matter; becoming powerful is only one way to live well.":
    "เปลี่ยนเป้าหมายประจำปีเพื่อฝึกเวท ดาบ เรียน หาเงิน สำรวจ พัก หรืออยู่กับผู้คน เมื่อเติบโตจะมีเป้าหมายเพิ่ม สุขภาพ ความสุข ความรู้ และสายสัมพันธ์ล้วนสำคัญ ความแข็งแกร่งเป็นเพียงหนึ่งในหลายวิธีที่จะใช้ชีวิตได้ดี",
  "Learn from someone. Learn for yourself.":
    "เรียนจากผู้อื่น และเรียนด้วยตัวเอง",
  "Practice earns experience. Higher magic and sword ranks also need instruction or dedicated study. Choices show costs and tradeoffs. When a path carries danger, the outcome is uncertain; taking an unaffordable choice is never required.":
    "การฝึกเพิ่มประสบการณ์ ระดับเวทและดาบที่สูงขึ้นต้องมีการสอนหรือการศึกษาเฉพาะ ทางเลือกแสดงค่าใช้จ่ายและสิ่งที่ต้องแลก เส้นทางอันตรายมีผลลัพธ์ไม่แน่นอน และคุณไม่จำเป็นต้องเลือกสิ่งที่จ่ายไม่ไหว",
  "At eight, choose a magic discipline: water, fire, earth, wind, or healing. You can change your current study in the training panel. Practice develops that discipline, while spells in your other studies stay learned. Your character page keeps the whole spellbook, including the experience and instruction needed for each next spell.":
    "อายุแปดปีจะเลือกสาขาเวทได้ ได้แก่ น้ำ ไฟ ดิน ลม หรือรักษา เปลี่ยนสาขาปัจจุบันได้ในส่วนฝึกฝน การฝึกพัฒนาสาขานั้นโดยไม่ลืมเวทในสาขาอื่น หน้าตัวละครเก็บตำราเวททั้งหมด พร้อมประสบการณ์และระดับการสอนที่เวทถัดไปต้องใช้",
  "Let your work become a calling.": "ให้งานกลายเป็นเส้นทางชีวิต",
  "Adventurers, merchants, healers, guards, and teachers gain experience and reputation through their work. Promotion offers need the relevant skills too; your calling panel shows the requirements. Accepting a promotion brings a new title and higher yearly income, with more responsibility. Changing vocation starts a new career track while keeping your savings and learned magic.":
    "นักผจญภัย พ่อค้า ผู้รักษา ยาม และครูได้ประสบการณ์กับชื่อเสียงจากงาน การเลื่อนตำแหน่งต้องมีทักษะที่เกี่ยวข้องด้วย ดูข้อกำหนดได้ในส่วนอาชีพ การรับตำแหน่งให้ชื่อใหม่ รายได้ต่อปีที่สูงขึ้น และความรับผิดชอบมากขึ้น เปลี่ยนอาชีพจะเริ่มความก้าวหน้าสายใหม่ แต่คงเงินออมและเวทที่เรียนแล้ว",
  "Sometimes, you can simply watch.": "บางครั้ง คุณเพียงเฝ้าดูก็ได้",
  "Watch mode makes affordable, low-risk choices for you while time is playing. Turn it off whenever you want to decide for yourself. Long-lived races move through their later years faster, so a whole life stays manageable.":
    "โหมดเฝ้าดูเลือกทางที่จ่ายไหวและเสี่ยงต่ำให้ขณะเวลาเดิน ปิดได้ทุกเมื่อที่อยากเลือกเอง เผ่าอายุยืนเดินเวลาช่วงหลังเร็วขึ้น เพื่อให้เล่นจบชีวิตได้ในเวลาที่พอดี",
  "Your story stays on this device.": "เรื่องราวเก็บไว้ในอุปกรณ์นี้",
  "The game saves your progress in this browser, including the decision waiting for you. Time rests while the page is closed or hidden. Your last 20 completed lives remain in Past lives. Clearing browser data removes these local records.":
    "เกมบันทึกความคืบหน้าในเบราว์เซอร์นี้ รวมทางเลือกที่รออยู่ เวลาพักเมื่อปิดหรือซ่อนหน้า ชีวิตที่จบแล้ว 20 ชีวิตล่าสุดอยู่ในชีวิตที่ผ่านมา การล้างข้อมูลเบราว์เซอร์จะลบบันทึกในเครื่องเหล่านี้",
  "A familiar world, an original life.": "โลกที่คุ้นเคย ชีวิตที่เขียนขึ้นใหม่",
  "This is an unofficial fan creation inspired by Mushoku Tensei and the life-simulation structure of 1 in 8 Billion. The protagonist, stories, art, and game rules are original. Birth weights, lifespans, events, and outcomes are game balance; the illustrated map is a simplified guide.":
    "ผลงานแฟนสร้างอย่างไม่เป็นทางการ ได้แรงบันดาลใจจากมุโชคุ เทนเซย์และโครงสร้างเกมจำลองชีวิตวันอินเอทบิลเลียน ตัวเอก เรื่องราว ภาพ และกฎเกมสร้างขึ้นใหม่ น้ำหนักการเกิด อายุขัย เหตุการณ์ และผลลัพธ์เป็นการปรับสมดุลเกม แผนที่เป็นเพียงภาพแนะนำอย่างย่อ",
  "Back to past lives": "กลับสู่ชีวิตที่ผ่านมา",
  "Once, you were": "ครั้งหนึ่ง คุณคือ",
  "years in this world": "ปีในโลกนี้",
  "Not every day was remarkable. Not every choice was easy.":
    "ไม่ใช่ทุกวันที่พิเศษ และไม่ใช่ทุกทางเลือกที่ง่าย",
  "But this life was yours, and it mattered.":
    "แต่ชีวิตนี้เป็นของคุณ และมีความหมาย",
  "Your last home": "บ้านหลังสุดท้าย",
  "Magic rank": "ระดับเวทมนตร์",
  "Sword rank": "ระดับวิชาดาบ",
  "A parent": "ผู้เป็นพ่อแม่",
  "A partner": "คู่ชีวิต",
  "One part of your story": "ส่วนหนึ่งในเรื่องราวของคุณ",
  "This life is kept in your past lives.":
    "ชีวิตนี้เก็บไว้ในชีวิตที่ผ่านมาแล้ว",
  "Your latest progress is not yet saved. Keep this tab open and retry saving above.":
    "ยังไม่ได้บันทึกความคืบหน้าล่าสุด โปรดเปิดแท็บไว้และลองบันทึกอีกครั้งด้านบน",
  "Somewhere, begin again": "เริ่มต้นใหม่ ณ ที่แห่งหนึ่ง",
  "Every life leaves a story.": "ทุกชีวิตทิ้งเรื่องราวไว้",
  "Your completed lives will be kept here.": "ชีวิตที่จบแล้วจะเก็บไว้ที่นี่",
  "For now, there are still pages waiting to be written.":
    "ตอนนี้ยังมีหน้ากระดาษที่รอให้เขียนต่อ",
  "Return to your life": "กลับสู่ชีวิตปัจจุบัน",
  "Browser-local archive · up to 20 lives":
    "คลังบันทึกในเบราว์เซอร์ · สูงสุด 20 ชีวิต",
  "Saving unavailable · keep this tab open":
    "บันทึกไม่ได้ · โปรดเปิดแท็บนี้ไว้",
  "Different names, different paths. Every one of them, a life you lived.":
    "ต่างชื่อ ต่างเส้นทาง ทุกเรื่องคือชีวิตที่คุณเคยใช้",
  "Your most recent 20 completed lives are saved in this browser.":
    "ชีวิตที่จบแล้ว 20 ชีวิตล่าสุดเก็บไว้ในเบราว์เซอร์นี้",
  Health: "สุขภาพ",
  Happiness: "ความสุข",
  Knowledge: "ความรู้",
  Bonds: "สายสัมพันธ์",
  Mana: "มานา",
  "Sword skill": "ทักษะดาบ",
  Silver: "เงิน",
  silver: "เหรียญเงิน",
  "Magic experience": "ประสบการณ์เวท",
  "Sword experience": "ประสบการณ์ดาบ",
  Swordsmanship: "วิชาดาบ",
  "Career experience": "ประสบการณ์อาชีพ",
  "Guild experience": "ประสบการณ์กิลด์",
  "Healing experience": "ประสบการณ์รักษา",
  "Water experience": "ประสบการณ์เวทน้ำ",
  "Fire experience": "ประสบการณ์เวทไฟ",
  "Earth experience": "ประสบการณ์เวทดิน",
  "Wind experience": "ประสบการณ์เวทลม",
  "Magic and sword experience": "ประสบการณ์เวทและดาบ",
  Reputation: "ชื่อเสียง",
  "Your choice": "ทางเลือกของคุณ",
  "Your choice becomes part of your story.":
    "ทางเลือกกลายเป็นส่วนหนึ่งของเรื่องราว",
  "What changed": "สิ่งที่เปลี่ยนไป",
  "Continue to next decision": "ไปยังทางเลือกถัดไป",
  "Your choice is recorded in the chronicle below.":
    "บันทึกทางเลือกของคุณไว้ในเรื่องราวด้านล่างแล้ว",
  "Your condition": "สภาพของคุณ",
  "Your savings": "เงินออม",
  "The skills you carry": "ทักษะที่ติดตัว",
  experience: "ประสบการณ์",
  "Adventurers’ Guild": "กิลด์นักผจญภัย",
  Rank: "ระดับ",
  "The people beside you": "ผู้คนเคียงข้าง",
  " · Remembered": " · อยู่ในความทรงจำ",
  "This year’s focus": "เป้าหมายปีนี้",
  "Change anytime": "เปลี่ยนได้ทุกเมื่อ",
  "Choose this year's focus": "เลือกเป้าหมายของปีนี้",
  "More paths open as you grow.": "เมื่อเติบโตจะมีเส้นทางเพิ่มขึ้น",
  "A little time to live.": "ช่วงเวลาเล็กน้อยให้ใช้ชีวิต",
  "Choose your focus below, then continue to the next decision or press Play.":
    "เลือกเป้าหมายด้านล่าง แล้วไปยังทางเลือกถัดไปหรือกดเล่น",
  "A choice awaits": "มีทางเลือกกำลังรอ",
  "Watch mode will choose an affordable option without a danger marker. Pause to decide yourself.":
    "โหมดเฝ้าดูจะเลือกทางที่จ่ายไหวและไม่มีสัญลักษณ์อันตราย หยุดเวลาเพื่อเลือกเอง",
  "Time pauses while you decide. There is no need to rush.":
    "เวลาหยุดระหว่างตัดสินใจ ไม่ต้องรีบ",
  All: "ทั้งหมด",
  Memories: "ความทรงจำ",
  "Latest moment": "ช่วงเวลาล่าสุด",
  "Your memories of another life will find their way onto these pages.":
    "ความทรงจำจากอีกชีวิตจะค่อย ๆ ปรากฏบนหน้ากระดาษเหล่านี้",
  "Read earlier moments": "อ่านช่วงเวลาก่อนหน้า",
  "A lifetime, remembered": "หนึ่งชีวิตในความทรงจำ",
  "A lifetime, unfolding": "หนึ่งชีวิตที่ค่อย ๆ เผยออก",
  "One square, one year": "หนึ่งช่อง หนึ่งปี",
  " · A memory": " · ความทรงจำ",
  "The years you’ve lived": "ปีที่ใช้ชีวิตแล้ว",
  "The story still ahead": "เรื่องราวที่ยังรออยู่",
  "An imagined countryside of the Six-Faced World, painted in warm morning light":
    "ภาพชนบทสมมติในโลกหกหน้า อาบแสงเช้าอบอุ่น",
  "Scenario year": "ปีในฉากเรื่อง",
  "Everything is new. Except you.": "ทุกสิ่งเป็นสิ่งใหม่ ยกเว้นตัวคุณ",
  "A whole world to grow into.": "โลกทั้งใบรอให้เติบโต",
  "Make this life your own.": "ทำให้ชีวิตนี้เป็นของคุณ",
  "The things that stay with us.": "สิ่งที่ยังคงอยู่กับเรา",
  "Small hands. Old memories. Endless possibility.":
    "มือเล็ก ความทรงจำเก่า ความเป็นไปได้ไม่สิ้นสุด",
  "An imagined view of Asura": "ภาพอัสราในจินตนาการ",
  "Your corner of the world": "มุมโลกของคุณ",
  "“This time, I’ll live": "“ครั้งนี้ ฉันจะใช้ชีวิต",
  "without regrets.”": "โดยไม่เสียใจภายหลัง”",
  "A promise to yourself": "คำสัญญาต่อตัวเอง",
  "The life you were given": "ชีวิตที่ได้รับมา",
  "Born in": "เกิดที่",
  "Home now": "บ้านปัจจุบัน",
  "Family background": "ภูมิหลังครอบครัว",
  "Natural aptitude": "พรสวรรค์",
  Temperament: "นิสัยใจคอ",
  Calling: "อาชีพ",
  "Your people": "ผู้คนของคุณ",
  "What you remember": "สิ่งที่คุณจำได้",
  "You discovered that intention can shape a spell without an incantation.":
    "คุณค้นพบว่าเจตจำนงสร้างเวทได้โดยไม่ต้องร่ายคาถา",
  "You remember another world, another lifetime. These memories give you a different way of seeing.":
    "คุณจำอีกโลกและอีกชีวิตได้ ความทรงจำเหล่านี้มอบมุมมองที่ต่างออกไป",
  "You have trusted someone with your secret.":
    "คุณไว้ใจใครบางคนให้รู้ความลับแล้ว",
  "Early practice is helping your mana develop.":
    "การฝึกแต่เยาว์วัยกำลังช่วยพัฒนามานา",
  "An original painting of a sunlit fantasy village, golden fields, and distant mountains":
    "ภาพวาดต้นฉบับของหมู่บ้านแฟนตาซียามแดดส่อง ทุ่งสีทอง และภูเขาห่างไกล",
  "Somewhere in the Six-Faced World,": "ณ ที่แห่งหนึ่งในโลกหกหน้า",
  "a life is waiting to begin.": "มีชีวิตรอการเริ่มต้น",
  "An imagined corner of Asura": "มุมหนึ่งของอัสราในจินตนาการ",
  "A new world.": "โลกใบใหม่",
  "A second chance.": "โอกาสครั้งที่สอง",
  "You remember a life before this one.": "คุณจำชีวิตก่อนหน้านี้ได้",
  "What you do with this one is up to you.":
    "จะใช้ชีวิตนี้อย่างไร ขึ้นอยู่กับคุณ",
  "Your name": "ชื่อของคุณ",
  optional: "ไม่จำเป็นต้องกรอก",
  "Let this world name you": "ให้โลกนี้ตั้งชื่อให้",
  "Where your story begins": "จุดเริ่มต้นเรื่องราว",
  "Let fate decide": "ให้โชคชะตาเลือก",
  "Your family, race, and gifts are drawn by fate.":
    "ครอบครัว เผ่าพันธุ์ และพรสวรรค์ถูกกำหนดโดยโชคชะตา",
  "Beginning again replaces your unfinished life. Completed lives stay in your archive.":
    "การเริ่มใหม่จะแทนที่ชีวิตที่ยังไม่จบ ชีวิตที่จบแล้วจะยังอยู่ในคลังบันทึก",
  "Keep my current life": "เก็บชีวิตปัจจุบันไว้",
  "Leave this life and begin again": "จากชีวิตนี้แล้วเริ่มใหม่",
  "Return to your chronicle": "กลับสู่บันทึกชีวิต",
  "An entire lifetime, one choice at a time.": "ตลอดหนึ่งชีวิต ทีละทางเลือก",
  "Progress is saved only in this browser.":
    "ความคืบหน้าเก็บไว้ในเบราว์เซอร์นี้เท่านั้น",
  "Saving is unavailable. Keep this tab open to keep playing.":
    "บันทึกไม่ได้ โปรดเปิดแท็บนี้ไว้เพื่อเล่นต่อ",
  "A peaceful village in an original fantasy landscape":
    "หมู่บ้านสงบในภาพภูมิประเทศแฟนตาซีต้นฉบับ",
  "Welcome back to the world.": "ยินดีต้อนรับกลับสู่โลก",
  "A different sky. The same soul.": "ฟ้าที่เปลี่ยนไป ดวงวิญญาณเดิม",
  Race: "เผ่าพันธุ์",
  Birthplace: "บ้านเกิด",
  Family: "ครอบครัว",
  "A natural gift": "พรสวรรค์ติดตัว",
  "You carry memories of a previous life.": "คุณพกความทรงจำจากชีวิตก่อน",
  "Open my chronicle": "เปิดบันทึกชีวิต",
  "Magic discipline": "สาขาเวทมนตร์",
  "Choose your field of study at age eight.":
    "เลือกสาขาที่ศึกษาได้เมื่ออายุแปดปี",
  "Magic practice opens at age three.": "เริ่มฝึกเวทได้เมื่ออายุสามปี",
  "Choose Practice magic in this year’s focus to train this discipline.":
    "เลือกฝึกเวทมนตร์ในเป้าหมายปีนี้เพื่อฝึกสาขานี้",
  "Changing discipline keeps your previous experience and spells. Higher instruction comes through story opportunities as you grow.":
    "การเปลี่ยนสาขาไม่ทำให้ประสบการณ์และเวทเดิมหายไป การสอนขั้นสูงจะมาจากโอกาสในเรื่องราวเมื่อคุณเติบโต",
  "Open your full spellbook": "เปิดตำราเวทฉบับเต็ม",
  "Next:": "ถัดไป:",
  "You have learned every spell in this discipline.":
    "คุณเรียนรู้เวททุกบทในสาขานี้แล้ว",
  "Practice and instruction will fill these pages.":
    "การฝึกและการเรียนจะเติมเต็มหน้ากระดาษเหล่านี้",
  learned: "เรียนรู้แล้ว",
  earned: "สะสมแล้ว",
  "Your calling": "เส้นทางอาชีพ",
  "A foundation for the work ahead": "พื้นฐานสำหรับงานข้างหน้า",
  "Time for a quieter chapter": "ถึงเวลาของบทชีวิตที่สงบลง",
  "Your future is still taking shape": "อนาคตยังค่อย ๆ ก่อตัว",
  "Yearly income": "รายได้ต่อปี",
  "Before living costs and any work-focus bonus":
    "ก่อนหักค่าครองชีพและก่อนโบนัสจากเป้าหมายทำงาน",
  "Career experience toward next promotion": "ประสบการณ์อาชีพสู่ตำแหน่งถัดไป",
  "You are ready. A promotion offer can appear as time unfolds.":
    "คุณพร้อมแล้ว ข้อเสนอเลื่อนตำแหน่งอาจปรากฏเมื่อเวลาเดินต่อ",
  "Earn career experience through your work; Earn a living focus adds more. Bonds of 60 or higher build reputation faster. Meet the skill requirements above, then look for a promotion offer in your story.":
    "ทำงานเพื่อสะสมประสบการณ์อาชีพ เป้าหมายทำมาหากินช่วยเพิ่มให้มากขึ้น สายสัมพันธ์ตั้งแต่ 60 ทำให้ชื่อเสียงเติบโตเร็วขึ้น เมื่อมีทักษะครบตามด้านบน ให้รอข้อเสนอเลื่อนตำแหน่งในเรื่องราว",
  "Your experience has earned a place in the leadership of your profession. There is still room to learn, and to help others begin.":
    "ประสบการณ์ทำให้คุณก้าวสู่การเป็นผู้นำในอาชีพ ยังมีพื้นที่ให้เรียนรู้และช่วยผู้อื่นเริ่มต้น",
  "At fifteen, a choice of vocation opens. Your studies and the people you help can shape what comes after.":
    "เมื่ออายุสิบห้าจะมีทางเลือกอาชีพ การเรียนและผู้คนที่คุณช่วยอาจกำหนดสิ่งที่ตามมา",
  "Your spellbook": "ตำราเวทของคุณ",
  "Practice grows the discipline you choose. Advanced spells also need the right instruction.":
    "การฝึกพัฒนาสาขาที่เลือก เวทขั้นสูงยังต้องอาศัยการสอนที่เหมาะสม",
  "experience ·": "ประสบการณ์ ·",
  " · Current study": " · สาขาปัจจุบัน",
  "No spells learned yet.": "ยังไม่ได้เรียนเวทใด",
  "A simplified illustrated guide to the regions of the Six-Faced World":
    "ภาพแนะนำภูมิภาคต่าง ๆ ของโลกหกหน้าอย่างย่อ",
  "Six regions. Countless possible lives.":
    "หกภูมิภาค ชีวิตที่เป็นไปได้นับไม่ถ้วน",
  "Select a place to discover it": "เลือกสถานที่เพื่อทำความรู้จัก",
  "An illustrated regional guide. Geography is simplified; birth weights are game balance. Choose a region from the list below to read about it.":
    "ภาพแนะนำภูมิภาค ภูมิศาสตร์ย่อให้เข้าใจง่าย น้ำหนักการเกิดเป็นสมดุลเกม เลือกภูมิภาคจากรายการด้านล่างเพื่ออ่านข้อมูล",
  "World regions": "ภูมิภาคของโลก",
  You: "คุณ",
  "Your home": "บ้านของคุณ",
  "Known for": "โดดเด่นด้าน",
  "Possible beginnings": "การเริ่มต้นที่เป็นไปได้",
  "Random birth weight": "น้ำหนักสุ่มบ้านเกิด",
  "% of new lives": "% ของชีวิตใหม่",
  "A birthplace is a beginning, not a boundary. Travel opportunities can appear as your life unfolds.":
    "บ้านเกิดคือจุดเริ่มต้น ไม่ใช่ขอบเขต โอกาสเดินทางอาจปรากฏระหว่างชีวิต",
  "Language stays with this life. Existing lives keep their language.":
    "ภาษานี้จะอยู่กับชีวิตใหม่ตลอดไป ชีวิตเดิมยังใช้ภาษาเดิม",
};

const DESCRIPTION_TH: Record<string, string> = {
  "Applied magic": "เวทมนตร์ประยุกต์",
  "Magical assessment": "การประเมินเวทมนตร์",
  "Silent casting": "การร่ายเวทไร้เสียง",
  "Ranoa research": "งานวิจัยราโนอา",
  "Career progression": "ความก้าวหน้าทางอาชีพ",
  "A merchant’s life": "ชีวิตพ่อค้า",
  "A healer’s life": "ชีวิตผู้รักษา",
  "A guard’s life": "ชีวิตทหารยาม",
  "A teacher’s life": "ชีวิตครู",
  "An adventurer’s life": "ชีวิตนักผจญภัย",
  "A second chance": "โอกาสครั้งที่สอง",
  "Past-life memory": "ความทรงจำชาติก่อน",
  "A first discovery": "การค้นพบครั้งแรก",
  Training: "การฝึกฝน",
  Friendship: "มิตรภาพ",
  "An open door": "ประตูที่เปิดออก",
  "Coming of age": "ก้าวสู่วัยผู้ใหญ่",
  "A turning point": "จุดเปลี่ยน",
  "A shared life": "ชีวิตร่วมกัน",
  "A new perspective": "มุมมองใหม่",
  Magic: "เวทมนตร์",
  "Guild contract": "สัญญาจากกิลด์",
  Livelihood: "การทำมาหากิน",
  "Everyday life": "ชีวิตประจำวัน",
  Travel: "การเดินทาง",
  Wellbeing: "สุขภาวะ",
  Mastery: "ความเชี่ยวชาญ",
  Connection: "สายสัมพันธ์",
  Community: "ชุมชน",
  "A path of study": "เส้นทางการศึกษา",
  Mentorship: "การชี้แนะ",
  "Asura countryside": "ชนบทอัสรา",
  "The next generation": "คนรุ่นถัดไป",
  "A later chapter": "บทชีวิตช่วงหลัง",
  "A remembered invention": "สิ่งประดิษฐ์จากความทรงจำ",
  Homecoming: "กลับบ้าน",
  "Magical perspective": "มุมมองเวทมนตร์",
  "A change of calling": "เปลี่ยนเส้นทางอาชีพ",
  "a quiet beginning": "จุดเริ่มต้นอันเงียบสงบ",
  "early magical instruction": "เรียนเวทแต่เยาว์วัย",
  "Try silent casting": "ลองร่ายเวทไร้เสียง",
  "a chance for proper lessons": "โอกาสเรียนอย่างเป็นระบบ",
  "Swift, direct offense": "จู่โจมรวดเร็วตรงเป้า",
  "Defense and timing": "ป้องกันและจับจังหวะ",
  "Adaptability and survival": "ปรับตัวและเอาตัวรอด",
  "unlock Advanced magic": "เปิดการเรียนเวทชั้นสูง",
  "unlock Advanced swordsmanship": "เปิดวิชาดาบชั้นสูง",
  "slower, independent progress": "ก้าวหน้าช้ากว่าแต่เป็นอิสระ",
  "move to Ranoa": "ย้ายไปราโนอา",
  "unlock Saint-level study": "เปิดการศึกษาขั้นศักดิ์สิทธิ์",
  "Begin at rank F": "เริ่มระดับ F",
  "learn the roads": "เรียนรู้เส้นทาง",
  "learn healing magic": "เรียนเวทรักษา",
  "practical sword training": "ฝึกดาบใช้งานจริง",
  "new connections": "รู้จักผู้คนใหม่",
  "A risky journey": "การเดินทางเสี่ยงภัย",
  "possible growth, possible injury": "อาจเติบโตหรือบาดเจ็บ",
  "An adult partnership": "ความสัมพันธ์ของผู้ใหญ่",
  "room for a different future": "พื้นที่ให้อนาคตแบบอื่น",
  "time for your own calling": "เวลาให้เส้นทางของตัวเอง",
  Vulnerability: "เปิดเผยด้านเปราะบาง",
  "a private kind of peace": "ความสงบส่วนตัว",
  "Become a teacher": "เป็นครู",
  "share your experience": "แบ่งปันประสบการณ์",
  Retire: "เกษียณ",
  "Advanced study": "การศึกษาขั้นสูง",
  "Become an adventurer": "เป็นนักผจญภัย",
  "unlock guild work": "เปิดงานกิลด์",
  "Become a healer": "เป็นผู้รักษา",
  "modest risk": "เสี่ยงเล็กน้อย",
  "moderate risk": "เสี่ยงปานกลาง",
  "high risk": "เสี่ยงสูง",
  "a safe day’s work": "งานที่ปลอดภัย",
  "some risk": "มีความเสี่ยง",
  "a new responsibility": "ความรับผิดชอบใหม่",
  "a new home": "บ้านใหม่",
  "earn no extra silver today": "วันนี้ไม่มีรายได้พิเศษ",
  "open the next magic rank": "เปิดเวทระดับถัดไป",
  "open the next sword rank": "เปิดดาบระดับถัดไป",
  "a broader perspective": "มุมมองที่กว้างขึ้น",
  "room for your own questions": "พื้นที่ให้คำถามของตัวเอง",
  "a future trade opportunity": "โอกาสการค้าในอนาคต",
  "keep your resources": "เก็บทรัพยากรไว้",
  "no fee": "ไม่มีค่าธรรมเนียม",
  "opens a research story": "เปิดเรื่องราววิจัย",
  "precise research": "วิจัยอย่างแม่นยำ",
  "practical research": "วิจัยเชิงปฏิบัติ",
  "a scholarly legacy": "มรดกทางวิชาการ",
  "Advance your role and annual income": "เพิ่มตำแหน่งและรายได้ต่อปี",
  "a considered boundary": "ขอบเขตที่ไตร่ตรองแล้ว",
  "change vocation": "เปลี่ยนอาชีพ",
  "begin a new career track": "เริ่มความก้าวหน้าอาชีพใหม่",
  "keep your skills and savings": "คงทักษะและเงินออม",
  "a teaching legacy": "มรดกการสอน",
  "community legacy": "มรดกแก่ชุมชน",
  "begin with 12 experience": "เริ่มด้วยประสบการณ์ 12",
};

const folded = new Map(
  Object.entries({ ...DESCRIPTION_TH, ...UI_TH }).map(([key, value]) => [
    key.toLowerCase(),
    value,
  ]),
);
/** Complete sentence templates. Captured domain values are translated independently. */
const templates: readonly [RegExp, (...parts: string[]) => string][] = [
  [/^Costs (\d+) silver$/i, (n) => `ใช้ ${n} เหรียญเงิน`],
  [/^(?:Earn|returns) (\d+) silver$/i, (n) => `ได้รับ ${n} เหรียญเงิน`],
  [/^Income (\d+) silver\/year$/i, (n) => `รายได้ ${n} เหรียญเงินต่อปี`],
  [
    /^Needs (\d+) (.+) experience$/i,
    (n, s) => `ต้องมี${tr(s + " experience")} ${n}`,
  ],
  [
    /^requires (\d+) knowledge and (\d+) discipline experience$/i,
    (k, x) => `ต้องมีความรู้ ${k} และประสบการณ์สาขา ${x}`,
  ],
  [/^([\w ]+) ([+−-]\d+(?:\.\d+)?)$/, (s, n) => `${tr(s)} ${n}`],
  [/^(.+ magic) experience$/i, (s) => `ประสบการณ์${tr(s)}`],
  [/^Study (.+)$/, (s) => `ศึกษา${tr(s)}`],
  [/^Put your (.+) to work$/, (s) => `ใช้${tr(s)}ช่วยงาน`],
  [/^Train toward (.+)-rank magic$/, (s) => `ฝึกสู่เวทระดับ${tr(s)}`],
  [/^Become (.+)$/, (s) => `รับตำแหน่ง${tr(s)}`],
  [/^Stay with your work as (.+)$/, (s) => `ทำงานเป็น${tr(s)}ต่อไป`],
  [/^Learn the foundations of (.+)$/, (s) => `เรียนพื้นฐาน${tr(s)}`],
  [/^Settle in (.+)$/, (s) => `ตั้งถิ่นฐานใน${tr(s)}`],
  [
    /^You unpack in (.+)\. The first morning is strange; the second is a little less so\.$/,
    (s) =>
      `คุณเก็บของเข้าที่ใน${tr(s)} เช้าแรกแปลกหน้า เช้าที่สองเริ่มคุ้นขึ้นเล็กน้อย`,
  ],
  [
    /^You copy the first exercises into your own notebook\. (.+) becomes the focus of your deliberate practice\.$/,
    (s) =>
      `คุณคัดแบบฝึกแรกลงสมุด ${tr(s)}กลายเป็นจุดมุ่งหมายของการฝึกอย่างตั้งใจ`,
  ],
  [
    /^You take up the responsibilities of (.+)\. The better pay is welcome; earning the trust will be the real work\.$/,
    (s) =>
      `คุณรับความรับผิดชอบของ${tr(s)} ค่าจ้างที่ดีขึ้นน่ายินดี แต่งานที่แท้จริงคือการสร้างความไว้วางใจ`,
  ],
  [/^Age (\d+)(.*)$/, (n, tail) => `อายุ ${n}${tr(tail)}`],
  [/^(\d+) career experience$/, (n) => `ประสบการณ์อาชีพ ${n}`],
  [/^(\d+) reputation$/, (n) => `ชื่อเสียง ${n}`],
  [
    /^(\d+) (sword|guild|healing|magic|water|fire|earth|wind) experience$/,
    (n, s) => `${tr(s + " experience")} ${n}`,
  ],
  [
    /^(\d+) (year|years) of experience in this career$/,
    (n) => `ประสบการณ์ในอาชีพนี้ ${n} ปี`,
  ],
  [/^(.+) style$/, (s) => `วิชา${tr(s)}`],
  [/^Explore (.+)$/, (s) => `สำรวจ${tr(s)}`],
  [/^ · (\d+) years old$/, (n) => ` · อายุ ${n} ปี`],
  [/^ · Need (\d+) more silver$/, (n) => ` · ต้องมีเงินเพิ่มอีก ${n} เหรียญ`],
  [/^ · (\d+) for next rank$/, (n) => ` · อีก ${n} สู่ระดับถัดไป`],
  [/^ · (.+) instruction needed$/, (s) => ` · ต้องมีการสอนระดับ${tr(s)}`],
  [/^ · (\d+) to learn$/, (n) => ` · ต้องฝึกอีก ${n}`],
  [
    /^(.+) Try loading again when browser storage is available\.$/,
    (s) => `${tr(s)} ลองโหลดอีกครั้งเมื่อพื้นที่เก็บข้อมูลใช้งานได้`,
  ],
];

function tr(source: string): string {
  if (Object.hasOwn(UI_TH, source)) return UI_TH[source];
  const direct = folded.get(source.toLowerCase());
  if (direct) return direct;
  const domain = domainText("th", source);
  if (domain !== source) return domain;
  if (source.includes(" · ") && !source.startsWith(" · "))
    return source.split(" · ").map(tr).join(" · ");
  for (const [pattern, render] of templates) {
    const match = source.match(pattern);
    if (match) return render(...match.slice(1));
  }
  return source;
}

export function translate(
  language: Language,
  key: string,
  params?: Record<string, string | number>,
  fallback?: string,
): string {
  const message =
    language === "en"
      ? (fallback ?? key)
      : tr(key) === key
        ? (fallback ?? key)
        : tr(key);
  return params
    ? message.replace(/\{(\w+)\}/g, (token, name: string) =>
        Object.hasOwn(params, name) ? String(params[name]) : token,
      )
    : message;
}
