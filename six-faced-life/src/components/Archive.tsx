import { useI18n } from "../i18n/context";
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
import { languageOf } from "../i18n/locale";
import { translate } from "../i18n/messages";
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
  const { t } = useI18n();

  return (
    <div className="ending-page page-enter">
      {onBack && (
        <button className="text-button" onClick={onBack}>
          <ArrowLeft size={15} />
          {t("Back to past lives")}
        </button>
      )}
      <section className="ending-letter">
        <Flower2 size={36} strokeWidth={1} />
        <h2 id="retrospective-heading" tabIndex={-1}>
          {t("Once, you were")}
          <br />
          {life.name} {life.surname}
          {t(".")}
        </h2>
        <p className="ending-years">
          {t(RACES[life.race].name)} {t(" · ")}
          {life.age} {t(" years in this world")}
        </p>
        <div className="letter-rule" />
        <p className="ending-cause">{t(life.ending?.cause)}</p>
        <blockquote>{t(life.ending?.legacy)}</blockquote>
        <p className="ending-reflection">
          {t("Not every day was remarkable. Not every choice was easy.")}
          <br />
          {t("But this life was yours, and it mattered.")}
        </p>
        <div className="legacy-grid">
          <div>
            <MapPin size={18} />
            <strong>{t(REGIONS[life.region].short)}</strong>
            <span>{t("Your last home")}</span>
          </div>
          <div>
            <Sparkles size={18} />
            <strong>
              {t(rankFor(life.training.magicXp, life.training.magicCap))}
            </strong>
            <span>{t("Magic rank")}</span>
          </div>
          <div>
            <Swords size={18} />
            <strong>
              {t(rankFor(life.training.swordXp, life.training.swordCap))}
            </strong>
            <span>{t("Sword rank")}</span>
          </div>
          <div>
            <Heart size={18} />
            <strong>
              {t(
                life.flags.parent
                  ? "A parent"
                  : life.flags.partnered
                    ? "A partner"
                    : CAREERS[life.career].name,
              )}
            </strong>
            <span>{t("One part of your story")}</span>
          </div>
        </div>
        <span className="ending-saved">
          <BookOpen size={14} />
          {t(
            saved
              ? "This life is kept in your past lives."
              : "Your latest progress is not yet saved. Keep this tab open and retry saving above.",
          )}
        </span>
        <button className="button primary" onClick={onNew}>
          {t("Somewhere, begin again")}
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
  const { t } = useI18n();

  if (!lives.length)
    return (
      <section className="empty-archive page-enter">
        <BookOpen size={42} strokeWidth={1} />
        <h2>{t("Every life leaves a story.")}</h2>
        <p>
          {t("Your completed lives will be kept here.")}
          <br />
          {t("For now, there are still pages waiting to be written.")}
        </p>
        <button className="button primary" onClick={onNew}>
          {t(hasActive ? "Return to your life" : "Begin a new life")}
          <ArrowRight size={17} />
        </button>
        <span>
          {t(
            saved
              ? "Browser-local archive · up to 20 lives"
              : "Saving unavailable · keep this tab open",
          )}
        </span>
      </section>
    );
  return (
    <div className="archive-list page-enter">
      <p className="archive-intro">
        {t(
          "Different names, different paths. Every one of them, a life you lived.",
        )}
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
              {t(RACES[life.race].name)} {t(" · ")}
              {t(REGIONS[life.birthRegion].short)} {t(" ·")}
              {t(" ")}
              {life.age} {t(" years")}
            </small>
            <span lang={languageOf(life)}>
              {translate(languageOf(life), life.ending?.legacy ?? "")}
            </span>
            <small className="archive-language" lang={languageOf(life)}>
              {languageOf(life) === "th" ? "ไทย" : "English"}
            </small>
          </span>
          <ArrowRight size={20} />
        </button>
      ))}
      <p className="local-note">
        {t(
          saved
            ? "Your most recent 20 completed lives are saved in this browser."
            : "Your latest progress is not yet saved. Keep this tab open and retry saving above.",
        )}
      </p>
    </div>
  );
}
