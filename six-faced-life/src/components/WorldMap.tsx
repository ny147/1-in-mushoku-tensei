import { MapPin } from "lucide-react";
import { REGIONS } from "../game/world";
import type { RegionId } from "../game/types";

export function WorldMap({
  selected,
  onSelect,
  compact = false,
}: {
  selected: RegionId;
  onSelect?: (id: RegionId) => void;
  compact?: boolean;
}) {
  return (
    <div className={`world-map ${compact ? "compact-map" : ""}`}>
      <svg
        viewBox="0 0 800 480"
        role="img"
        aria-label="A simplified illustrated guide to the regions of the Six-Faced World"
      >
        <defs>
          <pattern
            id="map-water"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M1 14q7-5 14 0t14 0"
              fill="none"
              stroke="#c9d4cb"
              strokeWidth=".6"
            />
          </pattern>
        </defs>
        <rect width="800" height="480" fill="#e7eae0" />
        <rect width="800" height="480" fill="url(#map-water)" />
        <g
          fill="#d0d5bb"
          stroke="#a9b49b"
          strokeWidth="1.4"
          strokeLinejoin="round"
        >
          <path d="m112 96 37-31 53 7 28-30 66 10 25 25 36-3 28 42-24 25 18 30-23 44-30-2-16 44-43 11-30-27-52 16-39-32-45-11 12-42-22-32z" />
          <path d="m370 229 41-20 39 18 17-25 43 17 12 45 39 16-9 40-39 2-20 40-41 20-14-26-44-7-27-41-21-33z" />
          <path d="m529 89 43-25 39 9 31-26 46 8 12 32 42 18-15 38-31 14-5 38-38 12-24-25-46 13-27-23-38-10 10-35z" />
          <path d="m154 332 32-32 45 5 15-17 34 12 5 36 28 23-19 42-41 21-30-18-45 9-23-37z" />
          <path d="m613 337 22-13 18 14 10 25-20 13-25-14z" />
        </g>
        <g stroke="#a7ae96" strokeWidth="1" fill="none" opacity=".8">
          <path d="m182 112 12-19 13 18 12-23 17 21M274 106l11-21 16 23 12-13 13 16M402 275l13-22 16 24 17-30 18 29M593 113l16-21 15 20 14-17 16 21" />
          <path
            d="M153 180q70-16 127 22t57-60M406 290q42 15 72-16"
            stroke="#a2bfc0"
            strokeWidth="2"
          />
        </g>
        <path
          d="M242 200Q276 120 289 115M294 145Q395 162 441 281M451 268Q554 232 622 143M216 218Q222 288 221 350"
          fill="none"
          stroke="#b9b29a"
          strokeDasharray="5 6"
        />
        {!compact && (
          <g
            fill="#6b796c"
            fontFamily="Georgia,serif"
            fontSize="12"
            letterSpacing="3"
          >
            <text x="79" y="440">
              THE SIX-FACED WORLD
            </text>
            <text x="668" y="430">
              N ↑
            </text>
          </g>
        )}
      </svg>
      {Object.entries(REGIONS).map(([id, region]) =>
        compact ? (
          id === selected && (
            <span
              key={id}
              className="map-dot"
              style={{ left: `${region.x}%`, top: `${region.y}%` }}
            >
              <MapPin size={19} />
            </span>
          )
        ) : (
          <button
            key={id}
            type="button"
            className={`map-location ${selected === id ? "selected" : ""}`}
            style={{ left: `${region.x}%`, top: `${region.y}%` }}
            onClick={() => onSelect?.(id as RegionId)}
            aria-label={`Explore ${region.name}`}
            aria-pressed={selected === id}
          >
            <span className="map-location-dot" />
            {region.short}
          </button>
        ),
      )}
    </div>
  );
}
