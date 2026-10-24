import { Compass, MapPin, Mountain, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Life, RegionId } from "../game/types";
import { RACES, REGIONS } from "../game/world";
import { WorldMap } from "./WorldMap";

export function WorldView({ life }: { life: Life | null }) {
  const [selected, setSelected] = useState<RegionId>(life?.region ?? "asura");
  const region = REGIONS[selected];
  return (
    <div className="world-page page-enter">
      <div className="world-intro">
        <p>Six regions. Countless possible lives.</p>
        <span>
          <Compass size={15} />
          Select a place to discover it
        </span>
      </div>
      <WorldMap selected={selected} onSelect={setSelected} />
      <p className="map-caption">
        An illustrated regional guide. Geography is simplified; birth weights
        are game balance.
      </p>
      <div className="world-below">
        <nav className="region-list" aria-label="World regions">
          {Object.entries(REGIONS).map(([id, r]) => (
            <button
              key={id}
              className={id === selected ? "active" : ""}
              onClick={() => setSelected(id as RegionId)}
              aria-pressed={id === selected}
            >
              <MapPin size={16} />
              <span>{r.name}</span>
              {life?.region === id && <span className="you-tag">You</span>}
            </button>
          ))}
        </nav>
        <section className="region-detail">
          <div className="region-title">
            <Mountain size={25} strokeWidth={1.2} />
            <h2>{region.name}</h2>
            {life?.region === selected && (
              <span className="subtle-tag">Your home</span>
            )}
          </div>
          <p>{region.description}</p>
          <dl>
            <div>
              <dt>
                <Sparkles size={14} />
                Known for
              </dt>
              <dd>{region.opportunity}</dd>
            </div>
            <div>
              <dt>Possible beginnings</dt>
              <dd>
                {[...new Set(region.races)]
                  .map((id) => RACES[id].name)
                  .join(", ")}
              </dd>
            </div>
            <div>
              <dt>Random birth weight</dt>
              <dd>{region.weight}% of new lives</dd>
            </div>
          </dl>
          <p className="region-travel-note">
            A birthplace is a beginning, not a boundary. Travel opportunities
            can appear as your life unfolds.
          </p>
        </section>
      </div>
    </div>
  );
}
