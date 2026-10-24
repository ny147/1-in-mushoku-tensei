import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Flower2,
  Heart,
  MapPin,
  Sparkles,
  Swords,
} from "lucide-react";
import type { Life } from "../game/types";
import { CAREERS, RACES, REGIONS, rankFor } from "../game/world";
import { LifeRecord, LifeTimeline } from "./LifeView";

export function Ending({
  life,
  onNew,
  onBack,
  saved = true,
}: {
  life: Life;
  onNew: () => void;
  onBack?: () => void;
  saved?: boolean;
}) {
  return (
    <div className="ending-page page-enter">
      {onBack && (
        <button className="text-button" onClick={onBack}>
          <ArrowLeft size={15} />
          Back to past lives
        </button>
      )}
      <section className="ending-letter">
        <Flower2 size={36} strokeWidth={1} />
        <h2 id="retrospective-heading" tabIndex={-1}>
          Once, you were
          <br />
          {life.name} {life.surname}.
        </h2>
        <p className="ending-years">
          {RACES[life.race].name} · {life.age} years in this world
        </p>
        <div className="letter-rule" />
        <p className="ending-cause">{life.ending?.cause}</p>
        <blockquote>{life.ending?.legacy}</blockquote>
        <p className="ending-reflection">
          Not every day was remarkable. Not every choice was easy.
          <br />
          But this life was yours, and it mattered.
        </p>
        <div className="legacy-grid">
          <div>
            <MapPin size={18} />
            <strong>{REGIONS[life.region].short}</strong>
            <span>Your last home</span>
          </div>
          <div>
            <Sparkles size={18} />
            <strong>
              {rankFor(life.training.magicXp, life.training.magicCap)}
            </strong>
            <span>Magic rank</span>
          </div>
          <div>
            <Swords size={18} />
            <strong>
              {rankFor(life.training.swordXp, life.training.swordCap)}
            </strong>
            <span>Sword rank</span>
          </div>
          <div>
            <Heart size={18} />
            <strong>
              {life.flags.parent
                ? "A parent"
                : life.flags.partnered
                  ? "A partner"
                  : CAREERS[life.career].name}
            </strong>
            <span>One part of your story</span>
          </div>
        </div>
        <span className="ending-saved">
          <BookOpen size={14} />
          {saved
            ? "This life is kept in your past lives."
            : "Your latest progress is not yet saved. Keep this tab open and retry saving above."}
        </span>
        <button className="button primary" onClick={onNew}>
          Somewhere, begin again
          <ArrowRight size={17} />
        </button>
      </section>
      <LifeTimeline life={life} />
      <LifeRecord life={life} all />
    </div>
  );
}

export function Archive({
  lives,
  onRead,
  onNew,
  hasActive = false,
  saved = true,
}: {
  lives: Life[];
  onRead: (life: Life) => void;
  onNew: () => void;
  hasActive?: boolean;
  saved?: boolean;
}) {
  if (!lives.length)
    return (
      <section className="empty-archive page-enter">
        <BookOpen size={42} strokeWidth={1} />
        <h2>Every life leaves a story.</h2>
        <p>
          Your completed lives will be kept here.
          <br />
          For now, there are still pages waiting to be written.
        </p>
        <button className="button primary" onClick={onNew}>
          {hasActive ? "Return to your life" : "Begin a new life"}
          <ArrowRight size={17} />
        </button>
        <span>
          {saved
            ? "Browser-local archive · up to 20 lives"
            : "Saving unavailable · keep this tab open"}
        </span>
      </section>
    );
  return (
    <div className="archive-list page-enter">
      <p className="archive-intro">
        Different names, different paths. Every one of them, a life you lived.
      </p>
      {lives.map((life) => (
        <button
          className="archived-life"
          key={life.id}
          onClick={() => onRead(life)}
        >
          <span className="archive-seal">{life.name.charAt(0)}</span>
          <span>
            <strong>
              {life.name} {life.surname}
            </strong>
            <small>
              {RACES[life.race].name} · {REGIONS[life.birthRegion].short} ·{" "}
              {life.age} years
            </small>
            <span>{life.ending?.legacy}</span>
          </span>
          <ArrowRight size={20} />
        </button>
      ))}
      <p className="local-note">
        {saved
          ? "Your most recent 20 completed lives are saved in this browser."
          : "Your latest progress is not yet saved. Keep this tab open and retry saving above."}
      </p>
    </div>
  );
}
