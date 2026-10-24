import {
  Award,
  BookOpen,
  Check,
  Circle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useId } from "react";
import type { Life, MagicSchool } from "../game/types";
import { RANKS, rankFor } from "../game/world";
import {
  canPromote,
  CAREER_TITLES,
  careerIncome,
  careerTitle,
  getProgression,
  MAGIC_SCHOOLS,
  PROMOTION_XP,
  promotionSkill,
  SCHOOL_IDS,
} from "../game/progression";

export function StudyFocus({
  life,
  onChange,
  onSpellbook,
}: {
  life: Life;
  onChange?: (school: MagicSchool) => void;
  onSpellbook?: () => void;
}) {
  const id = useId();
  const p = getProgression(life);
  const school = MAGIC_SCHOOLS[p.specialization];
  const track = p.magic[p.specialization];
  const next = school.spells.find((s) => !track.spells.includes(s.id));
  return (
    <div className="study-focus">
      {life.age >= 8 && onChange ? (
        <>
          <label htmlFor={id}>Magic discipline</label>
          <select
            id={id}
            value={p.specialization}
            onChange={(event) => onChange(event.target.value as MagicSchool)}
          >
            {SCHOOL_IDS.map((key) => (
              <option key={key} value={key}>
                {MAGIC_SCHOOLS[key].name}
              </option>
            ))}
          </select>
        </>
      ) : (
        <p className="study-unlock">Choose your field of study at age eight.</p>
      )}
      <p className="study-guidance">
        {life.age < 3
          ? "Magic practice opens at age three."
          : "Choose Practice magic in this year’s focus to train this discipline."}{" "}
        Changing discipline keeps your previous experience and spells. Higher
        instruction comes through story opportunities as you grow.
      </p>
      {onSpellbook && (
        <button className="text-button spellbook-link" onClick={onSpellbook}>
          Open your full spellbook <BookOpen size={14} />
        </button>
      )}
      <p className="next-spell">
        <BookOpen size={13} />
        <span>
          {next ? (
            <>
              Next: <strong>{next.name}</strong>
              <small>
                {next.xp} experience
                {life.training.magicCap < next.rank
                  ? ` · ${RANKS[next.rank]} instruction needed`
                  : ` · ${Math.max(0, Math.ceil(next.xp - track.xp))} to learn`}
              </small>
            </>
          ) : (
            "You have learned every spell in this discipline."
          )}
        </span>
      </p>
      <details className="known-spells">
        <summary>
          {track.spells.length} {track.spells.length === 1 ? "spell" : "spells"}{" "}
          learned
        </summary>
        {track.spells.length ? (
          <ul>
            {school.spells
              .filter((s) => track.spells.includes(s.id))
              .map((s) => (
                <li key={s.id}>
                  <Check size={11} />
                  <span>{s.name}</span>
                </li>
              ))}
          </ul>
        ) : (
          <p>Practice and instruction will fill these pages.</p>
        )}
      </details>
    </div>
  );
}

export function CareerProgress({ life }: { life: Life }) {
  const p = getProgression(life);
  const c = p.career;
  const ladder = CAREER_TITLES[life.career];
  const skill = promotionSkill(life);
  const target = ladder && c.level < 3 ? PROMOTION_XP[c.level] : null;
  const repTarget = [15, 30, 50][Math.min(c.level, 2)];
  const conditions =
    target === null
      ? []
      : [
          {
            label: `${target} career experience`,
            current: Math.round(c.experience),
            target,
          },
          {
            label: `${skill.required} ${skill.label}`,
            current: Math.round(skill.current),
            target: skill.required,
          },
          {
            label: `${repTarget} reputation`,
            current: Math.round(c.reputation),
            target: repTarget,
          },
        ];
  return (
    <section className="rail-section career-section">
      <h2>
        Your calling
        <TrendingUp size={16} />
      </h2>
      <div className="career-title">
        <span className="career-icon">
          <Award size={21} strokeWidth={1.4} />
        </span>
        <div>
          <h3>{careerTitle(life)}</h3>
          <p>
            {ladder
              ? `${c.years} ${c.years === 1 ? "year" : "years"} of experience in this career`
              : life.career === "student"
                ? "A foundation for the work ahead"
                : life.career === "retired"
                  ? "Time for a quieter chapter"
                  : "Your future is still taking shape"}
          </p>
        </div>
      </div>
      {life.age >= 15 && (
        <div className="career-income">
          <span>Yearly income</span>
          <strong>{careerIncome(life)} silver</strong>
          <small>Before living costs and any work-focus bonus</small>
        </div>
      )}
      {target !== null && (
        <div className="promotion-plan">
          <h4>Next: {ladder![c.level + 1]}</h4>
          <div
            className="skill-progress"
            role="meter"
            aria-label="Career experience toward next promotion"
            aria-valuemin={0}
            aria-valuemax={target}
            aria-valuenow={Math.min(target, c.experience)}
          >
            <span
              style={{
                width: `${Math.min(100, (c.experience / target) * 100)}%`,
              }}
            />
          </div>
          <ul>
            {conditions.map((item) => (
              <li
                key={item.label}
                className={item.current >= item.target ? "met" : ""}
              >
                {item.current >= item.target ? (
                  <Check size={12} />
                ) : (
                  <Circle size={10} />
                )}
                <span>
                  {item.label}
                  <small>{item.current} earned</small>
                </span>
              </li>
            ))}
          </ul>
          <p>
            {canPromote(life)
              ? "You are ready. A promotion offer can appear as time unfolds."
              : "Earn career experience through your work; Earn a living focus adds more. Bonds of 60 or higher build reputation faster. Meet the skill requirements above, then look for a promotion offer in your story."}
          </p>
        </div>
      )}
      {ladder && c.level === 3 && (
        <p className="career-established">
          Your experience has earned a place in the leadership of your
          profession. There is still room to learn, and to help others begin.
        </p>
      )}
      {life.age < 15 && (
        <p className="career-established">
          At fifteen, a choice of vocation opens. Your studies and the people
          you help can shape what comes after.
        </p>
      )}
    </section>
  );
}

export function Spellbook({ life }: { life: Life }) {
  const p = getProgression(life);
  return (
    <section className="spellbook">
      <h2 id="spellbook-heading" tabIndex={-1}>
        Your spellbook
      </h2>
      <p>
        Practice grows the discipline you choose. Advanced spells also need the
        right instruction.
      </p>
      <div className="spellbook-studies">
        {SCHOOL_IDS.map((id) => {
          const school = MAGIC_SCHOOLS[id];
          const track = p.magic[id];
          const learned = school.spells.filter((s) =>
            track.spells.includes(s.id),
          );
          const next = school.spells.find((s) => !track.spells.includes(s.id));
          return (
            <article
              key={id}
              className={id === p.specialization ? "current-study" : ""}
            >
              <header>
                <Sparkles size={17} strokeWidth={1.4} />
                <div>
                  <h3>{school.name}</h3>
                  <p>
                    {Math.round(track.xp)} experience ·{" "}
                    {rankFor(track.xp, life.training.magicCap)}
                    {id === p.specialization ? " · Current study" : ""}
                  </p>
                </div>
              </header>
              <p className="school-description">{school.description}</p>
              {learned.length ? (
                <ul>
                  {learned.map((s) => (
                    <li key={s.id}>
                      <Check size={13} />
                      <span>
                        <strong>{s.name}</strong>
                        <small>{s.description}</small>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="unwritten-spells">No spells learned yet.</p>
              )}
              {next && (
                <div className="spellbook-next">
                  <BookOpen size={13} />
                  <p>
                    Next: {next.name}
                    <span>
                      {next.xp} experience
                      {life.training.magicCap < next.rank
                        ? ` · ${RANKS[next.rank]} instruction needed`
                        : ` · ${Math.max(0, Math.ceil(next.xp - track.xp))} to learn`}
                    </span>
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
