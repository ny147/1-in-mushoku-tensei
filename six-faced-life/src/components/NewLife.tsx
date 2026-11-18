import { useI18n } from "../i18n/context";
import { ExpandedDetails, OriginWarnings } from "./ExpandedDetails";
import { expandedLabel } from "../i18n/expanded";
import {
  ArrowRight,
  Dices,
  Leaf,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import type { Language, Life, RegionId } from "../game/types";
import { RACES, REGIONS } from "../game/world";
import { Landscape } from "./Landscape";

export function NewLife({
  onCreate,
  activeName,
  onCancel,
  saved = true,
  language = "en",
  onLanguageChange,
}: {
  onCreate: (name: string, region?: RegionId, language?: Language) => void;
  activeName?: string;
  onCancel: () => void;
  saved?: boolean;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
}) {
  const { t } = useI18n();
  const hasActive = activeName !== undefined;

  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [replace, setReplace] = useState(false);
  return (
    <div className="new-life page-enter">
      <div className="opening-art">
        <Landscape
          alt={t(
            "An original painting of a sunlit fantasy village, golden fields, and distant mountains",
          )}
        />
        <div className="opening-shade" />
        <div className="opening-art-copy">
          <Leaf size={26} strokeWidth={1.3} />
          <p>
            {t("Somewhere in the Six-Faced World,")}
            <br />
            {t("a life is waiting to begin.")}
          </p>
        </div>
        <span className="art-credit">{t("An imagined corner of Asura")}</span>
      </div>
      <div className="opening-copy">
        <h1 id="page-title" tabIndex={-1}>
          {t("A new world.")}
          <br />
          {t("A second chance.")}
        </h1>
        <p className="opening-description">
          {t("You remember a life before this one.")}
          <br />
          {t("What you do with this one is up to you.")}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (hasActive && !replace) {
              setReplace(true);
              return;
            }
            onCreate(name, region ? (region as RegionId) : undefined, language);
          }}
        >
          <label htmlFor="life-language">Language / ภาษา</label>
          <select
            id="life-language"
            value={language}
            aria-describedby="life-language-help"
            onChange={(event) =>
              onLanguageChange?.(event.target.value as Language)
            }
          >
            <option value="en" lang="en">
              English
            </option>
            <option value="th" lang="th">
              ไทย
            </option>
          </select>
          <p id="life-language-help" className="language-help">
            {t(
              "Language stays with this life. Existing lives keep their language.",
            )}
          </p>
          <label htmlFor="name">
            {t("Your name ")}
            <span>{t("optional")}</span>
          </label>
          <input
            id="name"
            maxLength={32}
            autoComplete="off"
            placeholder={t("Let this world name you")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="birthplace">{t("Where your story begins")}</label>
          <div className="select-wrap">
            <MapPin size={16} />
            <select
              id="birthplace"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">{t("Let fate decide")}</option>
              {Object.entries(REGIONS).map(([id, r]) => (
                <option value={id} key={id}>
                  {t(r.name)}
                </option>
              ))}
            </select>
          </div>
          <p className="fate-note">
            <Dices size={16} />{" "}
            {t(" Your family, race, and gifts are drawn by fate.")}
          </p>
          {saved && (
            <p className="setup-save-note">
              {activeName
                ? t("{name} is saved in this browser.", { name: activeName })
                : t(hasActive
                  ? "Your unfinished life is saved in this browser."
                  : "Your life will be saved in this browser.")}
            </p>
          )}
          {replace && (
            <div className="inline-warning" role="alert">
              {t(
                "Beginning again replaces your unfinished life. Completed lives stay in your archive.",
              )}
              <button type="button" className="text-button" onClick={onCancel}>
                {t("Keep my current life")}
              </button>
            </div>
          )}
          <button className="button primary begin-button" type="submit">
            {t(
              replace ? "Leave this life and begin again" : "Begin a new life",
            )}
            <ArrowRight size={18} />
          </button>
          {hasActive && !replace && (
            <button
              type="button"
              className="button quiet return-button"
              onClick={onCancel}
            >
              {t("Return to your chronicle")}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export function BirthRecord({
  life,
  onBegin,
}: {
  life: Life;
  onBegin: () => void;
}) {
  const { t, language } = useI18n();
  const region = t(REGIONS[life.birthRegion].name);
  const birthplace = language === "en" ? `the ${region.replace(/^The /, "")}` : region;

  return (
    <section className="birth-record page-enter">
      <div className="birth-illustration">
        <Landscape
          alt={t("A peaceful village in an original fantasy landscape")}
        />
      </div>
      <div className="birth-paper">
        <Sparkles className="birth-spark" size={26} strokeWidth={1.2} />
        <h1 id="page-title" tabIndex={-1}>
          {t("Welcome back to the world.")}
        </h1>
        <p className="birth-subtitle">{t("A different sky. The same soul.")}</p>
        <div className="birth-name">
          {life.name} {life.surname}
        </div>
        <p>
          {t("You are born in {region}.", {
            region: birthplace,
          })}
        </p>
        <div className="memory-seal">
          <Sparkles size={17} aria-hidden="true" />
          <span>{t("You carry memories of a previous life.")}</span>
        </div>
        <dl className="birth-details">
          <div>
            <dt>{t("Race")}</dt>
            <dd>{t(RACES[life.race].name)}</dd>
          </div>
          {life.ruleset === "expanded-1" && (
            <div>
              <dt>{t("Family resources")}</dt>
              <dd>{expandedLabel(life.expansion.origin.wealth, language)}</dd>
            </div>
          )}
          <div>
            <dt>{t("A natural gift")}</dt>
            <dd>
              {life.ruleset === "expanded-1"
                ? t("Not assessed")
                : t(life.aptitude)}
            </dd>
          </div>
        </dl>
        {life.ruleset === "expanded-1" && <OriginWarnings life={life} birth />}
        <button className="button primary" type="button" onClick={onBegin}>
          {t("Open my chronicle")}
          <ArrowRight size={18} />
        </button>
        <details className="birth-origins">
          <summary>{t("Origins and household")}</summary>
          {life.ruleset === "expanded-1" ? (
            <ExpandedDetails life={life} birth />
          ) : (
            <dl className="expanded-facts">
              <div>
                <dt>{t("Family")}</dt>
                <dd>{t(life.background.replace("A ", ""))}</dd>
              </div>
            </dl>
          )}
        </details>
      </div>
    </section>
  );
}
