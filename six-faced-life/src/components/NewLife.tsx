import { useI18n } from "../i18n/context";
import { ExpandedDetails } from "./ExpandedDetails";
import { expandedLabel } from "../i18n/expanded";
import {
  ArrowRight,
  BookOpen,
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
  hasActive,
  onCancel,
  saved = true,
  language = "en",
  onLanguageChange,
}: {
  onCreate: (name: string, region?: RegionId, language?: Language) => void;
  hasActive: boolean;
  onCancel: () => void;
  saved?: boolean;
  language?: Language;
  onLanguageChange?: (language: Language) => void;
}) {
  const { t } = useI18n();

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
        <div className="opening-note">
          <BookOpen size={18} />
          <p>
            {t("An entire lifetime, one choice at a time.")}
            <br />
            <span>
              {t(
                saved
                  ? "Progress is saved only in this browser."
                  : "Saving is unavailable. Keep this tab open to keep playing.",
              )}
            </span>
          </p>
        </div>
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
  const { t } = useI18n();

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
          {t(
            "You are born in {region}, into {background}. Beyond a small window, a whole world carries on. You have been here before. Just not here.",
            {
              region: t(REGIONS[life.birthRegion].name),
              background:
                life.ruleset === "expanded-1"
                  ? expandedLabel(
                      life.expansion.origin.wealth,
                      life.language ?? "en",
                    )
                  : t(life.background.toLowerCase()),
            },
          )}
        </p>
        <dl className="birth-details">
          <div>
            <dt>{t("Race")}</dt>
            <dd>{t(RACES[life.race].name)}</dd>
          </div>
          <div>
            <dt>{t("Birthplace")}</dt>
            <dd>{t(REGIONS[life.birthRegion].short)}</dd>
          </div>
          <div>
            <dt>{t("Family")}</dt>
            <dd>
              {life.ruleset === "expanded-1"
                ? expandedLabel(
                    life.expansion.origin.wealth,
                    life.language ?? "en",
                  )
                : t(life.background.replace("A ", ""))}
            </dd>
          </div>
          <div>
            <dt>{t("A natural gift")}</dt>
            <dd>
              {life.ruleset === "expanded-1"
                ? life.language === "th"
                  ? "ยังไม่ได้ประเมิน"
                  : "Not assessed"
                : t(life.aptitude)}
            </dd>
          </div>
        </dl>
        {life.ruleset === "expanded-1" && <ExpandedDetails life={life} birth />}
        <div className="memory-seal">
          <Sparkles size={17} />
          <span>{t("You carry memories of a previous life.")}</span>
        </div>
        <button className="button primary" onClick={onBegin}>
          {t("Open my chronicle")}
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
