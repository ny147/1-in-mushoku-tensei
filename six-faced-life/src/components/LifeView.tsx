import { useI18n } from "../i18n/context";
import { ExpandedDetails, ExpandedFamily } from "./ExpandedDetails";
import { careerTitle } from "../game/simulation";
import { expandedLabel } from "../i18n/expanded";
import { decisionText, entryText } from "../i18n/story";
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
import { getProgression, MAGIC_SCHOOLS } from "../game/progression";
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
  const { t } = useI18n();

  return (
    <section className="rail-section">
      <h2>
        {t("Your condition")}
        <span>{t("0–100")}</span>
      </h2>
      <div className="stat-list">
        {statMeta.map(({ id, label, icon: Icon, color }) => (
          <div className={`stat ${color}`} key={id}>
            <div>
              <span>
                <Icon size={15} strokeWidth={1.6} />
                {t(label)}
              </span>
              <strong>{Math.round(life.stats[id])}</strong>
            </div>
            <div
              className="stat-track"
              role="meter"
              aria-label={t(label)}
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
        <span>{t("Your savings")}</span>
        <strong>
          {t(life.coins.toLocaleString())} <small>{t("silver")}</small>
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
  const { t } = useI18n();

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
      <h2>{t("The skills you carry")}</h2>
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
                <h3>{t(label)}</h3>
                <span>{t(rankFor(xp, cap))}</span>
              </div>
              <div className="skill-progress">
                <span style={{ width: `${progress}%` }} />
              </div>
              <p>
                {Math.round(xp)} {t(" experience")}
                {t(
                  xp >= (next ?? Infinity)
                    ? " · seek a mentor to progress"
                    : next
                      ? ` · ${next} for next rank`
                      : " · mastery",
                )}
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
          <span>{t("Adventurers’ Guild")}</span>
          <strong>
            {t("Rank ")}
            {t(guildRank(life.training.guildXp))}
          </strong>
        </div>
      )}
    </section>
  );
}
export function Family({ life }: { life: Life }) {
  const { t } = useI18n();
  if (life.ruleset === "expanded-1") return <ExpandedFamily life={life} />;

  return (
    <section className="rail-section family-section">
      <h2>{t("The people beside you")}</h2>
      {life.family.map((p) => (
        <div className="family-person" key={p.id}>
          <span
            className={`person-avatar ${p.role === "Mother" || p.role === "Partner" ? "warm" : ""}`}
          >
            {p.name.charAt(0)}
          </span>
          <div>
            <strong>{t(p.name)}</strong>
            <span>
              {t(p.role)}
              {t(
                life.flags[`farewell-${p.id}`]
                  ? " · Remembered"
                  : ` · ${life.age - p.bornAt} years old`,
              )}
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
  const { t } = useI18n();

  const [expanded, setExpanded] = useState(false);
  const Icon = focusIcons[life.focus];
  return (
    <section className="focus-panel">
      <div className="section-topline">
        <h2>{t("This year’s focus")}</h2>
        <span>{t("Change anytime")}</span>
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
          <strong>{t(FOCUSES[life.focus].name)}</strong>
          <small>{t(FOCUSES[life.focus].description)}</small>
        </span>
        <ChevronDown size={16} className={expanded ? "rotated" : ""} />
      </button>
      {expanded && (
        <div
          className="focus-options"
          role="group"
          aria-label={t("Choose this year's focus")}
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
                    <strong>{t(focus.name)}</strong>
                    <small>{t(focus.description)}</small>
                  </span>
                  {id === life.focus && <Check size={16} />}
                </button>
              );
            })}
        </div>
      )}
      {life.age < 5 && (
        <p className="focus-hint">{t("More paths open as you grow.")}</p>
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
  const { t } = useI18n();

  const canonicalDecision = getDecision(life);
  const decision = canonicalDecision
    ? decisionText(canonicalDecision, life, life.language ?? "en")
    : null;
  if (!decision && outcome)
    return <ChoiceOutcome result={outcome} onContinue={onAdvance} />;
  if (!decision)
    return (
      <section className="quiet-moment">
        <Feather size={23} strokeWidth={1.2} />
        <div>
          <h2 id="decision-heading" tabIndex={-1}>
            {t("A little time to live.")}
          </h2>
          <p>
            {t(
              "Choose your focus below, then continue to the next decision or press Play.",
            )}
          </p>
          <button className="text-button" onClick={onAdvance}>
            {t("Continue to next decision ")}
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
    );
  return (
    <section className="decision-panel" aria-labelledby="decision-heading">
      <div className="decision-heading">
        <span>
          <Sparkles size={17} />
          {t("A choice awaits")}
        </span>
        <span>{t(decision.kind)}</span>
      </div>
      <h2 id="decision-heading" tabIndex={-1}>
        {t(decision.title)}
      </h2>
      <p className="decision-narrative">{t(decision.text)}</p>
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
                <strong>{t(choice.label)}</strong>
                <small>
                  {t(choice.description)}
                  {t(
                    cost > life.coins
                      ? ` · Need ${cost - life.coins} more silver`
                      : "",
                  )}
                </small>
              </span>
              <ArrowRight size={17} />
            </button>
          );
        })}
      </div>
      <p className="decision-note">
        <span className="tiny-dot" />
        {t(
          automatic
            ? "Watch mode will choose an affordable option without a danger marker. Pause to decide yourself."
            : "Time pauses while you decide. There is no need to rush.",
        )}
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
  const { t } = useI18n();

  const [count, setCount] = useState(all ? 1000 : 5);
  const [filter, setFilter] = useState("all");
  const entries = [...life.history]
    .reverse()
    .filter((e) => filter !== "memories" || e.kind === "memory");
  return (
    <section className="life-record">
      <div className="section-topline">
        <h2>
          {t("Your chronicle")}
          <span>
            {life.history.length}
            {t(" ")}
            {t(life.history.length === 1 ? "moment" : "moments")}
          </span>
        </h2>
        <div className="record-filters">
          <button
            onClick={() => setFilter("all")}
            className={filter === "all" ? "active" : ""}
          >
            {t("All")}
          </button>
          <button
            onClick={() => setFilter("memories")}
            className={filter === "memories" ? "active" : ""}
          >
            {t("Memories")}
          </button>
        </div>
      </div>
      <div className="record-entries">
        {entries.slice(0, count).map((entry, i) => {
          const Icon = entryIcons[entry.kind];
          const localized = entryText(entry, life.language ?? "en");
          return (
            <article className={`record-entry ${entry.kind}`} key={entry.id}>
              <span className="record-marker">
                <Icon size={15} strokeWidth={1.5} />
              </span>
              <div className="record-entry-content">
                <div>
                  <h3>{localized.title}</h3>
                  <span>
                    {t("Age ")}
                    {entry.age}
                  </span>
                </div>
                <p>{localized.text}</p>
                {i === 0 && life.phase === "alive" && (
                  <span className="latest-label">{t("Latest moment")}</span>
                )}
              </div>
            </article>
          );
        })}
        {!entries.length && (
          <p className="empty-copy">
            {t(
              "Your memories of another life will find their way onto these pages.",
            )}
          </p>
        )}
      </div>
      {entries.length > count && (
        <button
          className="text-button show-earlier"
          onClick={() => setCount((n) => n + 12)}
        >
          {t("Read earlier moments")}
          <ArrowDown size={14} />
        </button>
      )}
    </section>
  );
}
export function LifeTimeline({ life }: { life: Life }) {
  const { t } = useI18n();

  const ended = life.phase === "ended";
  const max = ended
    ? life.age + 1
    : Math.max(100, Math.ceil((life.age + 1) / 25) * 25);
  return (
    <section className="life-timeline">
      <div className="section-topline">
        <h2>{t(ended ? "A lifetime, remembered" : "A lifetime, unfolding")}</h2>
        <span>{t("One square, one year")}</span>
      </div>
      <div className="year-grid">
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            title={t(
              i <= life.age
                ? `Age ${i}${life.history.some((e) => e.age === i && e.kind === "memory") ? " · A memory" : ""}`
                : `Age ${i} · Unwritten`,
            )}
            className={`${i < life.age ? "lived" : ""} ${i === life.age ? "current" : ""} ${life.history.some((e) => e.age === i && e.kind === "memory") ? "remembered" : ""}`}
          />
        ))}
      </div>
      <div className="timeline-key">
        <span>
          <i />
          {t("The years you’ve lived")}
        </span>
        {!ended && (
          <span>
            <i />
            {t("The story still ahead")}
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
  const { t } = useI18n();

  return (
    <div
      className={`life-columns page-enter ${life.pending ? "has-decision" : ""}`}
    >
      <div className="story-column">
        <section className="scene">
          <Landscape
            alt={t(
              "An imagined countryside of the Six-Faced World, painted in warm morning light",
            )}
          />
          <div className="scene-shade" />
          <div className="scene-top">
            <span>
              <MapPin size={13} />
              {t(REGIONS[life.region].name)}
            </span>
            <span>
              {life.ruleset === "expanded-1"
                ? `K${life.expansion.birthYear + life.age} · `
                : t("Scenario year ")}
              {life.ruleset === "expanded-1"
                ? `${t("Age")} ${life.age}`
                : life.age + 1}
            </span>
          </div>
          <div className="scene-caption">
            <span>{t(lifeStage(life.age, life.race))}</span>
            <h2>
              {t(
                life.age < 3
                  ? "Everything is new. Except you."
                  : life.age < 15
                    ? "A whole world to grow into."
                    : life.age < 45
                      ? "Make this life your own."
                      : "The things that stay with us.",
              )}
            </h2>
            <p>
              {t(
                life.age < 3
                  ? "Small hands. Old memories. Endless possibility."
                  : careerTitle(life) + " · " + REGIONS[life.region].short,
              )}
            </p>
          </div>
          <span className="scene-art-note">
            {t("An imagined view of Asura")}
          </span>
        </section>
        <DecisionPanel
          life={life}
          onChoose={onChoose}
          onAdvance={onAdvance}
          outcome={outcome}
          automatic={automatic}
        />
        <FocusPicker life={life} onFocus={onFocus} />
        {life.ruleset === "expanded-1" && <ExpandedDetails life={life} />}
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
            <h2>{t("Your corner of the world")}</h2>
            <Compass size={16} />
          </div>
          <WorldMap selected={life.region} compact />
          <p>
            <MapPin size={13} />
            {t(REGIONS[life.region].name)}
          </p>
        </section>
        <div className="rail-quote">
          <Leaf size={20} strokeWidth={1.2} />
          <p>
            {t("“This time, I’ll live")}
            <br />
            {t("without regrets.”")}
          </p>
          <span>{t("A promise to yourself")}</span>
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
  const { t } = useI18n();

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
            {t(RACES[life.race].name)} {t(" · ")}
            {life.age} {t(" years old ·")}
            {t(" ")}
            {t(lifeStage(life.age, life.race))}
          </p>
          <span className="subtle-tag">
            <Sparkles size={13} />
            {t("A reincarnated soul")}
          </span>
        </div>
      </div>
      <div className="character-detail-grid">
        {life.ruleset === "expanded-1" && <ExpandedDetails life={life} />}
        <section>
          <h2>{t("The life you were given")}</h2>
          <dl className="detail-list">
            <div>
              <dt>{t("Born in")}</dt>
              <dd>{t(REGIONS[life.birthRegion].name)}</dd>
            </div>
            <div>
              <dt>{t("Home now")}</dt>
              <dd>{t(REGIONS[life.region].name)}</dd>
            </div>
            <div>
              <dt>{t("Family background")}</dt>
              <dd>
                {life.ruleset === "expanded-1"
                  ? expandedLabel(
                      life.expansion.origin.wealth,
                      life.language ?? "en",
                    )
                  : t(life.background)}
              </dd>
            </div>
            <div>
              <dt>{t("Natural aptitude")}</dt>
              <dd>
                {life.ruleset === "expanded-1"
                  ? life.language === "th"
                    ? "ดูผลประเมินและการค้นพบในรายละเอียดชีวิต"
                    : "See recorded assessments and discoveries below"
                  : t(life.aptitude)}
              </dd>
            </div>
            <div>
              <dt>{t("Temperament")}</dt>
              <dd>{t(life.personality)}</dd>
            </div>
            <div>
              <dt>{t("Calling")}</dt>
              <dd>{t(careerTitle(life))}</dd>
            </div>
            <div>
              <dt>{t("Your people")}</dt>
              <dd>{t(RACES[life.race].description)}</dd>
            </div>
          </dl>
          <div className="memory-summary">
            <Sparkles size={20} />
            <h3>{t("What you remember")}</h3>
            <p>
              {t(
                life.flags.silentCasting
                  ? "You discovered that intention can shape a spell without an incantation."
                  : "You remember another world, another lifetime. These memories give you a different way of seeing.",
              )}
            </p>
            {life.flags.sharedSecret && (
              <p>{t("You have trusted someone with your secret.")}</p>
            )}
            {life.flags.earlyMana && (
              <p>{t("Early practice is helping your mana develop.")}</p>
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
