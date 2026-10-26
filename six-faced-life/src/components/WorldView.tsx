import { useI18n } from "../i18n/context";
import { Compass, MapPin, Mountain, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Life, RegionId } from "../game/types";
import { RACES, REGIONS } from "../game/world";
import { WorldMap } from "./WorldMap";

export function WorldView({ life }: { life: Life | null }) {
  const { t, language } = useI18n();

  const [selected, setSelected] = useState<RegionId>(life?.region ?? "asura");
  const region = REGIONS[selected];
  return (
    <div className="world-page page-enter">
      <div className="world-intro">
        <p>{t("Six regions. Countless possible lives.")}</p>
        <span>
          <Compass size={15} />
          {t("Select a place to discover it")}
        </span>
      </div>
      <WorldMap selected={selected} onSelect={setSelected} />
      <p className="map-caption">
        {t(
          "An illustrated regional guide. Geography is simplified; birth weights are game balance. Choose a region from the list below to read about it.",
        )}
      </p>
      <div className="world-below">
        <nav className="region-list" aria-label={t("World regions")}>
          {Object.entries(REGIONS).map(([id, r]) => (
            <button
              key={id}
              className={id === selected ? "active" : ""}
              onClick={() => setSelected(id as RegionId)}
              aria-pressed={id === selected}
            >
              <MapPin size={16} />
              <span>{t(r.name)}</span>
              {life?.region === id && (
                <span className="you-tag">{t("You")}</span>
              )}
            </button>
          ))}
        </nav>
        <section className="region-detail">
          <div className="region-title">
            <Mountain size={25} strokeWidth={1.2} />
            <h2>{t(region.name)}</h2>
            {life?.region === selected && (
              <span className="subtle-tag">{t("Your home")}</span>
            )}
          </div>
          <p>{t(region.description)}</p>
          <dl>
            <div>
              <dt>
                <Sparkles size={14} />
                {t("Known for")}
              </dt>
              <dd>{t(region.opportunity)}</dd>
            </div>
            <div>
              <dt>{t("Possible beginnings")}</dt>
              <dd>
                {t(
                  [
                    ...new Set(
                      life?.ruleset === "expanded-1" && selected === "demon"
                        ? [...region.races, "superd" as const]
                        : region.races,
                    ),
                  ]
                    .map((id) => t(RACES[id].name))
                    .join(", "),
                )}
              </dd>
            </div>
            <div>
              <dt>{t("Random birth weight")}</dt>
              <dd>
                {region.weight}
                {t("% of new lives")}
              </dd>
            </div>
          </dl>
          <p className="region-travel-note">
            {t(
              "A birthplace is a beginning, not a boundary. Travel opportunities can appear as your life unfolds.",
            )}
          </p>
        </section>
      </div>
      {life?.ruleset === "expanded-1" && (
        <section className="expanded-details">
          <h2>
            {language === "th"
              ? "ยุคสมัยและขอบเขตประวัติศาสตร์"
              : "Era and historical boundaries"}
          </h2>
          <p>
            {language === "th"
              ? "ชีวิตใหม่เกิดอย่างสุ่มในปี K397–K427 ภัยพิบัติมานาเกิดใน K417 ความขัดแย้งสืบราชบัลลังก์อัสราสิ้นสุดด้วยแอเรียลขึ้นครองบัลลังก์ใน K425 ตัวเลขปีใช้ลำดับเหตุการณ์จากแหล่งข้อมูลรอง ไม่ใช่ผลตรวจสอบต้นฉบับครบถ้วน"
              : "New lives are born uniformly in K397–K427. The Mana Calamity occurs in K417; the Asura succession ends with Ariel’s accession in K425. These year anchors use a secondary chronology, rather than a complete primary-text audit."}
          </p>
          <p>
            {language === "th"
              ? "มิกุรด์และสเปิร์ดเกิดบนทวีปปีศาจ ส่วนที่อื่นยังมีเผ่าพันธุ์ตามพื้นที่ ความขัดแย้งในภูมิภาคและเหตุการณ์หลัง K430 เป็นเรื่องแต่งสำหรับเกม การท้าชิงเจ็ดมหาอำนาจเปิดเฉพาะอันดับ 5–7 หลัง K430 เท่านั้น ผลทางประวัติศาสตร์หลักยังคงเดิม"
              : "Migurd and Superd protagonists begin on the Demon Continent. Regional conflicts and continuation after K430 are authored game material. Seven Great Powers challenges permit only positions 5–7, after K430; fixed historical outcomes remain unchanged."}
          </p>
          <p>
            {language === "th"
              ? "ความยากจน การเสียชีวิต พรสวรรค์ ค่าเรียน และการสืบทอดเป็นสมดุลเกม ไม่ใช่สถิติหรือพันธุศาสตร์จากต้นฉบับ"
              : "Poverty weights, mortality, talents, school costs and inheritance probabilities are authored game balance, rather than canon statistics or biological genetics."}
          </p>
        </section>
      )}
    </div>
  );
}
