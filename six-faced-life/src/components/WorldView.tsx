import { useI18n } from "../i18n/context";
import { Compass, MapPin, Mountain, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Life, RegionId } from "../game/types";
import { RACES, REGIONS } from "../game/world";
import { WorldMap } from "./WorldMap";

export function WorldView({ life }: { life: Life | null }) {
  const { t } = useI18n();

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
                  [...new Set(region.races)]
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
    </div>
  );
}
