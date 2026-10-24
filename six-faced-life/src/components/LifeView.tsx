import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Compass,
  Feather,
  Heart,
  Leaf,
  MapPin,
  Shield,
  Sparkles,
  Sprout,
  Swords,
  Users,
  Wallet,
  Wind,
} from "lucide-react";
import { useState } from "react";
import { getDecision } from "../game/engine";
import {
  FOCUSES,
  RACES,
  REGIONS,
  RANK_XP,
  guildRank,
  lifeStage,
  rankFor,
} from "../game/world";
import type { Entry, Focus, Life, MagicSchool, Stat } from "../game/types";
import { WorldMap } from "./WorldMap";
import {
  careerTitle,
  getProgression,
  MAGIC_SCHOOLS,
} from "../game/progression";
import { CareerProgress, Spellbook, StudyFocus } from "./Progression";
import { ChoiceOutcome, type ChoiceResult } from "./ChoiceOutcome";
import { Landscape } from "./Landscape";

const statMeta: {
  id: Stat;
  label: string;
  icon: typeof Heart;
  color: string;
}[] = [
  { id: "health", label: "Health", icon: Heart, color: "health" },
  { id: "happiness", label: "Happiness", icon: Sprout, color: "happy" },
  { id: "knowledge", label: "Knowledge", icon: BookOpen, color: "knowledge" },
  { id: "bonds", label: "Bonds", icon: Users, color: "bonds" },
];
export const focusIcons: Record<Focus, typeof Heart> = {
  balanced: Leaf,
  magic: Sparkles,
  sword: Swords,
  study: BookOpen,
  work: BriefcaseBusiness,
  bonds: Users,
  explore: Compass,
  rest: Wind,
};

export function CharacterStats({ life }: { life: Life }) {
  return (
    <section className="rail-section">
      <h2>
        Your condition<span>0–100</span>
      </h2>
      <div className="stat-list">
        {statMeta.map(({ id, label, icon: Icon, color }) => (
          <div className={`stat ${color}`} key={id}>
            <div>
              <span>
                <Icon size={15} strokeWidth={1.6} />
                {label}
              </span>
              <strong>{Math.round(life.stats[id])}</strong>
            </div>
            <div
              className="stat-track"
              role="meter"
              aria-label={label}
              aria-valuenow={Math.round(life.stats[id])}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${life.stats[id]}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="money-row">
        <Wallet size={17} />
        <span>Your savings</span>
        <strong>
          {life.coins.toLocaleString()} <small>silver</small>
        </strong>
      </div>
    </section>
  );
}
export function Training({
  life,
  onStudyChange,
  onSpellbook,
}: {
  life: Life;
  onStudyChange?: (school: MagicSchool) => void;
  onSpellbook?: () => void;
}) {
  const studies = getProgression(life);
  const tracks = [
    {
      label: MAGIC_SCHOOLS[studies.specialization].name,
      xp: studies.magic[studies.specialization].xp,
      cap: life.training.magicCap,
      icon: Sparkles,
      className: "magic",
    },
    {
      label:
        life.training.school === "Not yet chosen"
          ? "Swordsmanship"
          : `${life.training.school} style`,
      xp: life.training.swordXp,
      cap: life.training.swordCap,
      icon: Swords,
      className: "sword",
    },
  ];
  return (
    <section className="rail-section training-section">
      <h2>The skills you carry</h2>
      {tracks.map(({ label, xp, cap, icon: Icon, className }) => {
        const tier = Math.min(cap, RANK_XP.filter((n) => xp >= n).length - 1);
        const next = RANK_XP[tier + 1];
        const progress = next
          ? Math.min(100, ((xp - RANK_XP[tier]) / (next - RANK_XP[tier])) * 100)
          : 100;
        return (
          <div className={`training-track ${className}`} key={className}>
            <div className="training-icon">
              <Icon size={20} strokeWidth={1.4} />
            </div>
            <div className="training-info">
              <div>
                <h3>{label}</h3>
                <span>{rankFor(xp, cap)}</span>
              </div>
              <div className="skill-progress">
                <span style={{ width: `${progress}%` }} />
              </div>
              <p>
                {Math.round(xp)} experience
                {xp >= (next ?? Infinity)
                  ? " · seek a mentor to progress"
                  : next
                    ? ` · ${next} for next rank`
                    : " · mastery"}
              </p>
            </div>
          </div>
        );
      })}
      <StudyFocus
        life={life}
        onChange={onStudyChange}
        onSpellbook={onSpellbook}
      />
      {life.flags.guildMember && (
        <div className="guild-line">
          <Shield size={16} />
          <span>Adventurers’ Guild</span>
          <strong>Rank {guildRank(life.training.guildXp)}</strong>
        </div>
      )}
    </section>
  );
}
export function Family({ life }: { life: Life }) {
  return (
    <section className="rail-section family-section">
      <h2>The people beside you</h2>
      {life.family.map((p) => (
        <div className="family-person" key={p.id}>
          <span
            className={`person-avatar ${p.role === "Mother" || p.role === "Partner" ? "warm" : ""}`}
          >
            {p.name.charAt(0)}
          </span>
          <div>
            <strong>{p.name}</strong>
            <span>
              {p.role}
              {life.flags[`farewell-${p.id}`]
                ? " · Remembered"
                : ` · ${life.age - p.bornAt} years old`}
            </span>
          </div>
          {!life.flags[`farewell-${p.id}`] && (
            <Heart size={13} className="family-heart" />
          )}
        </div>
      ))}
    </section>
  );
}
export function FocusPicker({
  life,
  onFocus,
}: {
  life: Life;
  onFocus: (focus: Focus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = focusIcons[life.focus];
  return (
    <section className="focus-panel">
      <div className="section-topline">
        <h2>This year’s focus</h2>
        <span>Change anytime</span>
      </div>
      <button
        className="focus-current"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="focus-current-icon">
          <Icon size={22} strokeWidth={1.4} />
        </span>
        <span>
          <strong>{FOCUSES[life.focus].name}</strong>
          <small>{FOCUSES[life.focus].description}</small>
        </span>
        <ChevronDown size={16} className={expanded ? "rotated" : ""} />
      </button>
      {expanded && (
        <div
          className="focus-options"
          role="group"
          aria-label="Choose this year's focus"
        >
          {Object.entries(FOCUSES)
            .filter(([, f]) => life.age >= f.minAge)
            .map(([id, focus]) => {
              const OptionIcon = focusIcons[id as Focus];
              return (
                <button
                  className={id === life.focus ? "selected" : ""}
                  aria-pressed={id === life.focus}
                  key={id}
                  onClick={() => {
                    onFocus(id as Focus);
                    setExpanded(false);
                  }}
                >
                  <OptionIcon size={17} />
                  <span>
                    <strong>{focus.name}</strong>
                    <small>{focus.description}</small>
                  </span>
                  {id === life.focus && <Check size={16} />}
                </button>
              );
            })}
        </div>
      )}
      {life.age < 5 && (
        <p className="focus-hint">More paths open as you grow.</p>
      )}
    </section>
  );
}
export function DecisionPanel({
  life,
  onChoose,
  onAdvance,
  outcome,
  automatic = false,
}: {
  life: Life;
  onAdvance: () => void;
  onChoose: (id: string) => void;
  outcome?: ChoiceResult | null;
  automatic?: boolean;
}) {
  const decision = getDecision(life);
  if (!decision && outcome)
    return <ChoiceOutcome result={outcome} onContinue={onAdvance} />;
  if (!decision)
    return (
      <section className="quiet-moment">
        <Feather size={23} strokeWidth={1.2} />
        <div>
          <h2 id="decision-heading" tabIndex={-1}>
            A little time to live.
          </h2>
          <p>
            Choose your focus below, then continue to the next decision or press
            Play.
          </p>
          <button className="text-button" onClick={onAdvance}>
            Continue to next decision <ArrowRight size={15} />
          </button>
        </div>
      </section>
    );
  return (
    <section className="decision-panel" aria-labelledby="decision-heading">
      <div className="decision-heading">
        <span>
          <Sparkles size={17} />A choice awaits
        </span>
        <span>{decision.kind}</span>
      </div>
      <h2 id="decision-heading" tabIndex={-1}>
        {decision.title}
      </h2>
      <p className="decision-narrative">{decision.text}</p>
      <div className="choices">
        {decision.choices.map((choice) => {
          const cost = choice.cost ?? 0;
          const disabled = choice.disabled || cost > life.coins;
          return (
            <button
              className="choice"
              disabled={disabled}
              key={choice.id}
              onClick={() => onChoose(choice.id)}
            >
              <span className="choice-dot" />
              <span>
                <strong>{choice.label}</strong>
                <small>
                  {choice.description}
                  {cost > life.coins
                    ? ` · Need ${cost - life.coins} more silver`
                    : ""}
                </small>
              </span>
              <ArrowRight size={17} />
            </button>
          );
        })}
      </div>
      <p className="decision-note">
        <span className="tiny-dot" />
        {automatic
          ? "Watch mode will choose an affordable option without a danger marker. Pause to decide yourself."
          : "Time pauses while you decide. There is no need to rush."}
      </p>
    </section>
  );
}
const entryIcons: Record<Entry["kind"], typeof Heart> = {
  birth: Sprout,
  memory: Sparkles,
  training: Swords,
  life: Leaf,
  world: Compass,
  choice: Feather,
  ending: Leaf,
};
export function LifeRecord({
  life,
  all = false,
}: {
  life: Life;
  all?: boolean;
}) {
  const [count, setCount] = useState(all ? 1000 : 5);
  const [filter, setFilter] = useState("all");
  const entries = [...life.history]
    .reverse()
    .filter((e) => filter !== "memories" || e.kind === "memory");
  return (
    <section className="life-record">
      <div className="section-topline">
        <h2>
          Your chronicle
          <span>
            {life.history.length}{" "}
            {life.history.length === 1 ? "moment" : "moments"}
          </span>
        </h2>
        <div className="record-filters">
          <button
            onClick={() => setFilter("all")}
            className={filter === "all" ? "active" : ""}
          >
            All
          </button>
          <button
            onClick={() => setFilter("memories")}
            className={filter === "memories" ? "active" : ""}
          >
            Memories
          </button>
        </div>
      </div>
      <div className="record-entries">
        {entries.slice(0, count).map((entry, i) => {
          const Icon = entryIcons[entry.kind];
          return (
            <article className={`record-entry ${entry.kind}`} key={entry.id}>
              <span className="record-marker">
                <Icon size={15} strokeWidth={1.5} />
              </span>
              <div className="record-entry-content">
                <div>
                  <h3>{entry.title}</h3>
                  <span>Age {entry.age}</span>
                </div>
                <p>{entry.text}</p>
                {i === 0 && life.phase === "alive" && (
                  <span className="latest-label">Latest moment</span>
                )}
              </div>
            </article>
          );
        })}
        {!entries.length && (
          <p className="empty-copy">
            Your memories of another life will find their way onto these pages.
          </p>
        )}
      </div>
      {entries.length > count && (
        <button
          className="text-button show-earlier"
          onClick={() => setCount((n) => n + 12)}
        >
          Read earlier moments
          <ArrowDown size={14} />
        </button>
      )}
    </section>
  );
}
export function LifeTimeline({ life }: { life: Life }) {
  const ended = life.phase === "ended";
  const max = ended
    ? life.age + 1
    : Math.max(100, Math.ceil((life.age + 1) / 25) * 25);
  return (
    <section className="life-timeline">
      <div className="section-topline">
        <h2>{ended ? "A lifetime, remembered" : "A lifetime, unfolding"}</h2>
        <span>One square, one year</span>
      </div>
      <div className="year-grid">
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            title={
              i <= life.age
                ? `Age ${i}${life.history.some((e) => e.age === i && e.kind === "memory") ? " · A memory" : ""}`
                : `Age ${i} · Unwritten`
            }
            className={`${i < life.age ? "lived" : ""} ${i === life.age ? "current" : ""} ${life.history.some((e) => e.age === i && e.kind === "memory") ? "remembered" : ""}`}
          />
        ))}
      </div>
      <div className="timeline-key">
        <span>
          <i />
          The years you’ve lived
        </span>
        {!ended && (
          <span>
            <i />
            The story still ahead
          </span>
        )}
      </div>
    </section>
  );
}
export function LifeView({
  life,
  onFocus,
  onChoose,
  onAdvance,
  onStudyChange,
  outcome,
  automatic,
  onSpellbook,
}: {
  life: Life;
  onFocus: (focus: Focus) => void;
  onChoose: (id: string) => void;
  onAdvance: () => void;
  onStudyChange: (school: MagicSchool) => void;
  outcome?: ChoiceResult | null;
  automatic?: boolean;
  onSpellbook?: () => void;
}) {
  return (
    <div
      className={`life-columns page-enter ${life.pending ? "has-decision" : ""}`}
    >
      <div className="story-column">
        <section className="scene">
          <Landscape alt="An imagined countryside of the Six-Faced World, painted in warm morning light" />
          <div className="scene-shade" />
          <div className="scene-top">
            <span>
              <MapPin size={13} />
              {REGIONS[life.region].name}
            </span>
            <span>Scenario year {life.age + 1}</span>
          </div>
          <div className="scene-caption">
            <span>{lifeStage(life.age, life.race)}</span>
            <h2>
              {life.age < 3
                ? "Everything is new. Except you."
                : life.age < 15
                  ? "A whole world to grow into."
                  : life.age < 45
                    ? "Make this life your own."
                    : "The things that stay with us."}
            </h2>
            <p>
              {life.age < 3
                ? "Small hands. Old memories. Endless possibility."
                : careerTitle(life) + " · " + REGIONS[life.region].short}
            </p>
          </div>
          <span className="scene-art-note">An imagined view of Asura</span>
        </section>
        <DecisionPanel
          life={life}
          onChoose={onChoose}
          onAdvance={onAdvance}
          outcome={outcome}
          automatic={automatic}
        />
        <FocusPicker life={life} onFocus={onFocus} />
        <LifeRecord life={life} />
        <LifeTimeline life={life} />
      </div>
      <aside className="character-rail">
        <CharacterStats life={life} />
        <Training
          life={life}
          onStudyChange={onStudyChange}
          onSpellbook={onSpellbook}
        />
        <CareerProgress life={life} />
        <Family life={life} />
        <section className="rail-section location-section">
          <div className="section-topline">
            <h2>Your corner of the world</h2>
            <Compass size={16} />
          </div>
          <WorldMap selected={life.region} compact />
          <p>
            <MapPin size={13} />
            {REGIONS[life.region].name}
          </p>
        </section>
        <div className="rail-quote">
          <Leaf size={20} strokeWidth={1.2} />
          <p>
            “This time, I’ll live
            <br />
            without regrets.”
          </p>
          <span>A promise to yourself</span>
        </div>
      </aside>
    </div>
  );
}

export function CharacterView({
  life,
  onStudyChange,
}: {
  life: Life;
  onStudyChange: (school: MagicSchool) => void;
}) {
  return (
    <div className="character-page page-enter">
      <div className="character-passport">
        <div className="portrait-seal">
          <span>{life.name.charAt(0)}</span>
          <Leaf size={24} />
        </div>
        <div>
          <h2>
            {life.name} {life.surname}
          </h2>
          <p>
            {RACES[life.race].name} · {life.age} years old ·{" "}
            {lifeStage(life.age, life.race)}
          </p>
          <span className="subtle-tag">
            <Sparkles size={13} />A reincarnated soul
          </span>
        </div>
      </div>
      <div className="character-detail-grid">
        <section>
          <h2>The life you were given</h2>
          <dl className="detail-list">
            <div>
              <dt>Born in</dt>
              <dd>{REGIONS[life.birthRegion].name}</dd>
            </div>
            <div>
              <dt>Home now</dt>
              <dd>{REGIONS[life.region].name}</dd>
            </div>
            <div>
              <dt>Family background</dt>
              <dd>{life.background}</dd>
            </div>
            <div>
              <dt>Natural aptitude</dt>
              <dd>{life.aptitude}</dd>
            </div>
            <div>
              <dt>Temperament</dt>
              <dd>{life.personality}</dd>
            </div>
            <div>
              <dt>Calling</dt>
              <dd>{careerTitle(life)}</dd>
            </div>
            <div>
              <dt>Your people</dt>
              <dd>{RACES[life.race].description}</dd>
            </div>
          </dl>
          <div className="memory-summary">
            <Sparkles size={20} />
            <h3>What you remember</h3>
            <p>
              {life.flags.silentCasting
                ? "You discovered that intention can shape a spell without an incantation."
                : "You remember another world, another lifetime. These memories give you a different way of seeing."}
            </p>
            {life.flags.sharedSecret && (
              <p>You have trusted someone with your secret.</p>
            )}
            {life.flags.earlyMana && (
              <p>Early practice is helping your mana develop.</p>
            )}
          </div>
          <Spellbook life={life} />
        </section>
        <aside>
          <CharacterStats life={life} />
          <Training life={life} onStudyChange={onStudyChange} />
          <CareerProgress life={life} />
          <Family life={life} />
        </aside>
      </div>
    </div>
  );
}
