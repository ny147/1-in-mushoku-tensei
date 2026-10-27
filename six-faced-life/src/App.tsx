import { LanguageProvider, useI18n } from "./i18n/context";
import { translate } from "./i18n/messages";
import {
  languageOf,
  readLanguagePreference,
  writeLanguagePreference,
} from "./i18n/locale";
/*
 * DIRECTION: An intimate fantasy chronicle: cream paper, green ink, an original
 * painted landscape, and a continuous life record. Experience mode; the player
 * should see a consequential choice and the person making it in one viewport.
 * Approved by the user in docs/superpowers/specs/2026-10-23-six-faced-life-design.md.
 * FORM: Chronicle with fixed navigation and a story/character spread. User-pinned
 * direction overrides concept seed 0783097b.
 * FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Compass,
  Feather,
  Leaf,
  Menu,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  Sparkles,
  UserRound,
  VolumeX,
  X,
} from "lucide-react";
import type {
  Focus,
  Language,
  Life,
  MagicSchool,
  RegionId,
  SaveData,
} from "./game/types";
import { setSpecialization, canAutoChoose } from "./game/simulation";
import {
  advance,
  beginLife,
  choose,
  createLife,
  getDecision,
  setFocus,
  openActivity,
} from "./game/engine";
import { archiveLife, loadGame, saveGame } from "./game/storage";
import { RACES, REGIONS, lifeStage } from "./game/world";
import { BirthRecord, NewLife } from "./components/NewLife";
import { CharacterView, LifeView } from "./components/LifeView";
import { Archive, Ending } from "./components/Archive";
import { WorldView } from "./components/WorldView";
import { describeChoice, type ChoiceResult } from "./components/ChoiceOutcome";

type Page = "chronicle" | "character" | "world" | "archive" | "new" | "help";
function focusContent(id: string) {
  const target = document.getElementById(id);
  if (!target) return false;
  target.focus({ preventScroll: true });
  if (id !== "page-title")
    target.scrollIntoView?.({ block: "start", behavior: "instant" });
  return true;
}
function readInitial() {
  try {
    return loadGame(window.localStorage);
  } catch {
    return {
      data: { version: 1 as const, active: null, archive: [] },
      error:
        "Local storage is unavailable. You can play, but this browser will not keep your story when you close it.",
    };
  }
}
function Brand() {
  const { t } = useI18n();

  return (
    <div className="brand">
      <svg viewBox="0 0 40 44" aria-hidden="true">
        <path d="m20 3 16 9v20l-16 9L4 32V12Zm0 0v38M4 12l16 10 16-10M4 32l16-10 16 10" />
        <path d="m12 8 16 28M28 8 12 36" opacity=".4" />
      </svg>
      <div>
        <strong>{t("Six-Faced Life")}</strong>
        <span>{t("A second chance")}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [initial] = useState(readInitial);
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(() => {
    try {
      return readLanguagePreference(window.localStorage);
    } catch {
      return "en";
    }
  });
  const [draftLanguage, setDraftLanguage] = useState(preferredLanguage);
  const [data, setData] = useState<SaveData>(initial.data);
  const [notice, setNotice] = useState(initial.error);
  const [saved, setSaved] = useState(!initial.error);
  const [page, setPage] = useState<Page>(
    initial.data.active ? "chronicle" : "new",
  );
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [auto, setAuto] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState<Life | null>(null);
  const [outcome, setOutcome] = useState<ChoiceResult | null>(null);
  const [focusTarget, setFocusTarget] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [loadFailed, setLoadFailed] = useState(!!initial.error);
  const menuButton = useRef<HTMLButtonElement>(null);
  const dirty = useRef(false);
  const lastSave = useRef(0);
  const previousLife = useRef<Life | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const life = data.active;
  const language =
    page === "new"
      ? draftLanguage
      : page === "archive" && preview
        ? languageOf(preview)
        : life
          ? languageOf(life)
          : draftLanguage;
  const t = useCallback(
    (
      key: string | null | undefined,
      params?: Record<string, string | number>,
    ) => translate(language, key ?? "", params),
    [language],
  );
  useEffect(() => {
    document.documentElement.lang = language;
    document.title =
      language === "th"
        ? "Six-Faced Life — บันทึกชีวิต"
        : "Six-Faced Life — A second chance";
  }, [language]);

  function persistLatest() {
    let ok = false;
    try {
      ok = saveGame(window.localStorage, dataRef.current);
    } catch {
      /* Browser storage is blocked. */
    }
    setSaved(ok);
    if (ok && loadFailed) {
      setLoadFailed(false);
      setNotice(null);
    }
    lastSave.current = Date.now();
    previousLife.current = dataRef.current.active;
    return ok;
  }

  function retryStorage() {
    if (loadFailed && !dirty.current) {
      const result = readInitial();
      setNotice(result.error);
      if (result.error) return;
      setData(result.data);
      setLoadFailed(false);
      setSaved(true);
      setPlaying(false);
      navigate(result.data.active ? "chronicle" : "new");
      return;
    }
    if (persistLatest()) {
      setLoadFailed(false);
      setNotice(null);
      setAnnouncement(t("Your latest progress is saved on this device."));
    }
  }

  const updateLife = useCallback(
    (updater: (current: Life | null) => Life | null) => {
      dirty.current = true;
      setData((previous) => {
        const next = updater(previous.active);
        if (!next || next === previous.active) return previous;
        return next.phase === "ended"
          ? archiveLife(previous, next)
          : { ...previous, active: next };
      });
    },
    [],
  );

  useEffect(() => {
    if (!dirty.current) return;
    const important =
      life?.id !== previousLife.current?.id ||
      life?.age !== previousLife.current?.age ||
      life?.pending !== previousLife.current?.pending ||
      life?.phase !== previousLife.current?.phase ||
      life?.focus !== previousLife.current?.focus ||
      life?.history.at(-1)?.id !== previousLife.current?.history.at(-1)?.id ||
      life?.progression?.specialization !==
        previousLife.current?.progression?.specialization;
    if (important || Date.now() - lastSave.current >= 1500) {
      persistLatest();
    }
  }, [data, life]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page, life?.phase]);
  useEffect(() => {
    if (!focusTarget) return;
    if (focusContent(focusTarget)) setFocusTarget(null);
  }, [focusTarget, page, life?.phase, life?.pending, preview?.id, outcome]);
  useEffect(() => {
    if (life?.pending || (outcome && outcome.lifeId !== life?.id))
      setOutcome(null);
  }, [life?.pending, life?.id, outcome]);
  useEffect(() => {
    const flush = () => {
      if (dirty.current)
        try {
          saveGame(window.localStorage, dataRef.current);
        } catch {
          /* Play remains available without storage. */
        }
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, []);

  useEffect(() => {
    if (
      !playing ||
      !life ||
      life.phase !== "alive" ||
      life.pending ||
      page !== "chronicle"
    )
      return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      updateLife((current) =>
        current
          ? advance(
              current,
              "tick",
              ((0.25 * speed) / 12) * (RACES[current.race].lifespan / 78),
            )
          : null,
      );
    }, 250);
    return () => window.clearInterval(timer);
  }, [
    playing,
    life?.phase,
    life?.pending,
    life?.race,
    page,
    speed,
    updateLife,
  ]);

  useEffect(() => {
    if (!auto || !playing || page !== "chronicle" || !life?.pending) return;
    const timer = window.setInterval(
      () =>
        updateLife((current) => {
          if (!current || document.hidden || !canAutoChoose(current))
            return current;
          const option = getDecision(current)?.choices.find(
            (c) => !c.disabled && (c.cost ?? 0) <= current.coins && !c.risk,
          );
          return option ? choose(current, option.id) : current;
        }),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [auto, playing, page, life?.pending, updateLife]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.code === "Space" &&
        !target.closest(
          "input, select, textarea, button, summary, a, [contenteditable]",
        ) &&
        page === "chronicle" &&
        life?.phase === "alive"
      ) {
        event.preventDefault();
        setPlaying((value) => !value);
      }
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [life?.phase, page, menuOpen]);

  function navigate(next: Page) {
    setAnnouncement("");
    if (next === "new" && life) setDraftLanguage(preferredLanguage);
    setPage(next);
    setMenuOpen(false);
    setPreview(null);
    setFocusTarget("page-title");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function startNew(
    name: string,
    region?: RegionId,
    selectedLanguage: Language = draftLanguage,
  ) {
    updateLife(() => createLife({ name, region, language: selectedLanguage }));
    setPreferredLanguage(selectedLanguage);
    try {
      writeLanguagePreference(window.localStorage, selectedLanguage);
    } catch {
      /* Preference storage is optional. */
    }
    setAuto(false);
    setPlaying(false);
    setOutcome(null);
    setAnnouncement("");
    navigate("chronicle");
  }
  function selectChoice(id: string) {
    const current = dataRef.current.active;
    if (!current) return;
    const next = choose(current, id);
    if (next === current) return;
    const result = describeChoice(current, next);
    setOutcome(result);
    setAnnouncement(
      `${result.title} ${result.text} ${result.changes.join(". ")}`,
    );
    updateLife(() => next);
    setFocusTarget(
      next.phase === "ended"
        ? "page-title"
        : next.pending
          ? "decision-heading"
          : "outcome-heading",
    );
  }
  const onAdvance = () => {
    const current = dataRef.current.active;
    if (!current || current.pending) return;
    const next = advance(current, "decision");
    setOutcome(null);
    setFocusTarget(next.phase === "ended" ? "page-title" : "decision-heading");
    updateLife(() => next);
  };
  function openSpellbook() {
    navigate("character");
    setFocusTarget("spellbook-heading");
  }
  const navItems: { id: Page; label: string; icon: typeof BookOpen }[] = [
    { id: "chronicle", label: "Your chronicle", icon: BookOpen },
    { id: "character", label: "Your character", icon: UserRound },
    { id: "world", label: "The world", icon: Compass },
    { id: "archive", label: "Past lives", icon: RotateCcw },
  ];
  const titles: Partial<Record<Page, string>> = {
    character: "The person you’re becoming.",
    world: "Beyond the familiar.",
    archive: "The lives you’ve lived.",
    help: "A little guidance.",
  };
  const showTime = page === "chronicle" && life?.phase === "alive" && !preview;

  return (
    <LanguageProvider language={language}>
      <div className="app-shell">
        <a className="skip-link" href="#main-content">
          {t("Skip to your story")}
        </a>
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {t(announcement)}
        </div>
        <div className="mobile-top">
          <Brand />
          <button
            className="icon-button"
            aria-label={t(menuOpen ? "Close navigation" : "Open navigation")}
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            ref={menuButton}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <aside
          id="site-navigation"
          className={`sidebar ${menuOpen ? "menu-open" : ""}`}
        >
          <Brand />
          <div className="sidebar-rule" />
          <nav className="main-nav" aria-label={t("Main navigation")}>
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={
                  page === id || (id === "chronicle" && page === "new")
                    ? "active"
                    : ""
                }
                onClick={() =>
                  navigate(id === "chronicle" && !life ? "new" : id)
                }
                aria-current={page === id ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.6} />
                {t(label)}
                {id === "chronicle" && <span className="nav-active-dot" />}
                {id === "archive" && data.archive.length > 0 && (
                  <span className="nav-count">{data.archive.length}</span>
                )}
              </button>
            ))}
          </nav>
          {life && (
            <div className="sidebar-character">
              <div className="sidebar-avatar">
                {life.name.charAt(0)}
                <Leaf size={14} />
              </div>
              <strong>
                {life.name} {life.surname}
              </strong>
              <p>
                {t(RACES[life.race].name)} {t(" · Age ")}
                {life.age}
              </p>
              <span>
                <MapPinIcon />
                {t(REGIONS[life.region].short)}
              </span>
              <div className="sidebar-soul">
                <Sparkles size={13} />
                {t("A reincarnated soul")}
              </div>
            </div>
          )}
          <div className="sidebar-bottom">
            <button onClick={() => navigate("help")}>
              <CircleHelp size={17} />
              {t("How to play")}
            </button>
            <div className="sidebar-colophon">
              <Leaf size={19} strokeWidth={1.2} />
              <p>
                {t("In the world of")}
                <br />
                <strong>{t("Mushoku Tensei")}</strong>
              </p>
              <span>{t("An unofficial fan creation")}</span>
            </div>
          </div>
        </aside>
        <main id="main-content" className="main-content" tabIndex={-1}>
          <header className="topbar">
            <div className="breadcrumb">
              <span>{t("The Six-Faced World")}</span>
              <ChevronRight size={13} />
              <strong>
                {t(
                  page === "new" ||
                    (life?.phase === "birth" && page === "chronicle")
                    ? "A new beginning"
                    : page === "help"
                      ? "How to play"
                      : navItems.find((n) => n.id === page)?.label,
                )}
              </strong>
            </div>
            <div className="topbar-actions">
              <span
                className={`save-indicator ${saved ? "" : "unsaved"}`}
                title={t("Lives are stored only in this browser")}
              >
                {saved ? <Check size={13} /> : <VolumeX size={13} />}
                {t(saved ? "Saved on this device" : "Not saved")}
              </span>
              {page !== "new" && (
                <button
                  className="button new-life-button"
                  onClick={() => navigate("new")}
                >
                  <Plus size={15} />
                  {t("New life")}
                </button>
              )}
            </div>
          </header>
          {notice && !loadFailed && (
            <div className="notice" role="alert">
              <p>{t(notice)}</p>
              <button
                className="icon-button"
                aria-label={t("Dismiss message")}
                onClick={() => setNotice(null)}
              >
                <X size={17} />
              </button>
            </div>
          )}
          {!saved && (
            <div className="save-recovery" role="alert">
              <div>
                <strong>{t("Your progress has not been saved.")}</strong>
                <p>
                  {t(
                    loadFailed && !dirty.current
                      ? `${notice ?? "Your existing save could not be opened."} Try loading again when browser storage is available.`
                      : "Your current life is still open here. Keep this tab open and try saving again before you leave.",
                  )}
                </p>
              </div>
              <button className="button" onClick={retryStorage}>
                {t(
                  loadFailed && !dirty.current ? "Retry loading" : "Retry save",
                )}
              </button>
            </div>
          )}
          <div
            className={`page-content ${page === "new" ? "new-page-content" : ""}`}
          >
            {page !== "new" &&
              !(life?.phase === "birth" && page === "chronicle") && (
                <header className="page-heading">
                  <div>
                    <h1 id="page-title" tabIndex={-1}>
                      {page === "chronicle"
                        ? life?.phase === "ended"
                          ? t("A life worth remembering.")
                          : life
                            ? `${life.name} ${life.surname}`
                            : t("Your story begins here.")
                        : t(titles[page])}
                    </h1>
                    <p>
                      {t(
                        page === "chronicle" && life
                          ? `${RACES[life.race].name} · ${lifeStage(life.age, life.race)} · ${REGIONS[life.region].name}`
                          : page === "character"
                            ? "The gifts you were given. The choices you’ve made."
                            : page === "world"
                              ? "There is always something beyond the next horizon."
                              : page === "archive"
                                ? "Every ending is also a story worth keeping."
                                : "One lifetime, one choice at a time.",
                      )}
                    </p>
                  </div>
                  {showTime && (
                    <div className="age-display">
                      <span>{t("Age")}</span>
                      <strong>{life.age}</strong>
                      <span>{t("years")}</span>
                    </div>
                  )}
                </header>
              )}
            {showTime && (
              <section className="time-bar" aria-label={t("Time controls")}>
                <div className="time-guidance" id="time-guidance">
                  <div>
                    <strong>
                      {t(
                        life.pending
                          ? auto && playing && canAutoChoose(life)
                            ? "Watch mode is choosing for you"
                            : "A choice is waiting for you"
                          : playing
                            ? "Time is moving"
                            : "Time is paused",
                      )}
                    </strong>
                    <p>
                      {t(
                        life.pending
                          ? auto && playing && canAutoChoose(life)
                            ? "An affordable option without a danger marker will be chosen automatically. Pause or turn Watch mode off to decide yourself."
                            : "Choose an option in your story before time can move on."
                          : "Continue to the next decision, advance up to one year, or press Play to let time pass.",
                      )}
                    </p>
                  </div>
                  {life.pending && (
                    <button
                      className="button"
                      onClick={() => focusContent("decision-heading")}
                    >
                      {t("Review choices")}
                    </button>
                  )}
                </div>
                <div className="time-main">
                  <button
                    className={`play-button ${playing ? "is-playing" : ""}`}
                    aria-label={t(playing ? "Pause time" : "Play time")}
                    aria-describedby="time-guidance"
                    onClick={() => setPlaying(!playing)}
                  >
                    {playing ? (
                      <Pause size={15} fill="currentColor" />
                    ) : (
                      <Play size={15} fill="currentColor" />
                    )}
                    <span>{t(playing ? "Pause" : "Play")}</span>
                  </button>
                  <div
                    className="speed-controls"
                    aria-label={t("Playback speed")}
                  >
                    {[1, 2, 4, 8].map((s) => (
                      <button
                        key={s}
                        aria-pressed={speed === s}
                        className={speed === s ? "active" : ""}
                        onClick={() => setSpeed(s)}
                      >
                        {s}
                        {t("×")}
                      </button>
                    ))}
                  </div>
                  <span className="year-clock">
                    {Math.round(life.progress * 100)}
                    {t("% of this year")}
                  </span>
                </div>
                <div className="time-forward">
                  <label className="auto-control">
                    <input
                      type="checkbox"
                      aria-describedby="watch-mode-help"
                      checked={auto}
                      onChange={(e) => setAuto(e.target.checked)}
                    />
                    <span className="switch" />
                    {t("Watch mode")}
                  </label>
                  <button
                    className="time-step"
                    disabled={!!life.pending}
                    title={t(
                      "Advance up to one year; stop early if a choice appears",
                    )}
                    onClick={() => {
                      setOutcome(null);
                      updateLife((current) =>
                        current ? advance(current, "year") : null,
                      );
                    }}
                  >
                    {t("+1 year")}
                  </button>
                  <button
                    className="next-decision"
                    disabled={!!life.pending}
                    title={t(
                      "Advance until the next choice, up to twelve years at a time",
                    )}
                    onClick={onAdvance}
                  >
                    {t("Next decision")}
                    <SkipForward size={14} />
                  </button>
                </div>
                <p className="watch-mode-help" id="watch-mode-help">
                  {t("Watch mode makes choices for you while time plays.")}
                </p>
                <div className="year-progress">
                  <span style={{ width: `${life.progress * 100}%` }} />
                </div>
              </section>
            )}
            {page === "new" ? (
              <NewLife
                language={draftLanguage}
                onLanguageChange={setDraftLanguage}
                saved={saved}
                hasActive={!!life && life.phase !== "ended"}
                onCreate={startNew}
                onCancel={() => navigate("chronicle")}
              />
            ) : page === "world" ? (
              <WorldView life={life} />
            ) : page === "help" ? (
              <Help onPlay={() => navigate(life ? "chronicle" : "new")} />
            ) : page === "archive" ? (
              preview ? (
                <Ending
                  saved={saved}
                  life={preview}
                  onNew={() => navigate("new")}
                  onBack={() => {
                    setPreview(null);
                    setFocusTarget("page-title");
                  }}
                />
              ) : (
                <Archive
                  saved={saved}
                  hasActive={!!life && life.phase !== "ended"}
                  lives={data.archive}
                  onRead={(value) => {
                    setAnnouncement("");
                    setPreview(value);
                    setFocusTarget("retrospective-heading");
                  }}
                  onNew={() =>
                    navigate(
                      life && life.phase !== "ended" ? "chronicle" : "new",
                    )
                  }
                />
              )
            ) : page === "character" ? (
              life ? (
                <CharacterView
                  life={life}
                  onStudyChange={(school: MagicSchool) =>
                    updateLife((current) =>
                      current ? setSpecialization(current, school) : null,
                    )
                  }
                />
              ) : (
                <EmptyCharacter onNew={() => navigate("new")} />
              )
            ) : life?.phase === "birth" ? (
              <BirthRecord
                life={life}
                onBegin={() => {
                  updateLife((current) =>
                    current ? beginLife(current) : null,
                  );
                  setPlaying(true);
                  setFocusTarget("decision-heading");
                }}
              />
            ) : life?.phase === "ended" ? (
              <Ending life={life} saved={saved} onNew={() => navigate("new")} />
            ) : life ? (
              <LifeView
                life={life}
                onActivity={(key) => {
                  setPlaying(false);
                  setOutcome(null);
                  updateLife((current) =>
                    current ? openActivity(current, key) : null,
                  );
                  setFocusTarget("decision-heading");
                }}
                onFocus={(focus: Focus) =>
                  updateLife((current) =>
                    current ? setFocus(current, focus) : null,
                  )
                }
                onChoose={selectChoice}
                onAdvance={onAdvance}
                onStudyChange={(school: MagicSchool) =>
                  updateLife((current) =>
                    current ? setSpecialization(current, school) : null,
                  )
                }
                outcome={outcome?.lifeId === life.id ? outcome : null}
                automatic={auto && playing && canAutoChoose(life)}
                onSpellbook={openSpellbook}
              />
            ) : (
              <NewLife
                language={draftLanguage}
                onLanguageChange={setDraftLanguage}
                saved={saved}
                hasActive={false}
                onCreate={startNew}
                onCancel={() => {}}
              />
            )}
            <footer className="page-footer">
              <span>
                <Leaf size={13} />
                {t("No two lives are quite the same.")}
              </span>
              <span>
                {t("Six-Faced Life ")}
                <span className="footer-separator">{t("/")}</span>{" "}
                {t(" An unofficial fan-made simulation")}
              </span>
            </footer>
          </div>
        </main>
      </div>
    </LanguageProvider>
  );
}

function MapPinIcon() {
  return (
    <svg
      width="12"
      height="14"
      viewBox="0 0 16 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <path d="M8 18s6-7 6-11A6 6 0 0 0 2 7c0 4 6 11 6 11Z" />
      <circle cx="8" cy="7" r="2" />
    </svg>
  );
}
function EmptyCharacter({ onNew }: { onNew: () => void }) {
  const { t } = useI18n();

  return (
    <div className="empty-archive">
      <UserRound size={40} strokeWidth={1} />
      <h2>{t("A name waiting for a story.")}</h2>
      <p>{t("Begin a life to discover the person you might become.")}</p>
      <button className="button primary" onClick={onNew}>
        {t("Begin a new life")}
        <Feather size={16} />
      </button>
    </div>
  );
}
function Help({ onPlay }: { onPlay: () => void }) {
  const { t } = useI18n();

  return (
    <article className="help-page page-enter">
      <h2>{t("You have another chance at a life.")}</h2>
      <p>
        {t(
          "Your protagonist remembers a previous world. Their birthplace, family, race, and gifts shape the opportunities ahead—but your choices help decide what happens next.",
        )}
      </p>
      <section>
        <h3>{t("Let time move, or turn the page yourself.")}</h3>
        <p>
          {t(
            "Press Play to let years pass. Use the speed buttons to move faster, +1 year for a smaller step, or Next decision to reach the next choice. Time always stops for decisions. The space bar toggles play when you aren’t using a form or button.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("Decide what matters this year.")}</h3>
        <p>
          {t(
            "Change your yearly focus to develop magic, train a sword style, study, earn silver, explore, rest, or spend time with others. More priorities open as you grow. Health, happiness, knowledge, and bonds all matter; becoming powerful is only one way to live well.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("Learn from someone. Learn for yourself.")}</h3>
        <p>
          {t(
            "Practice earns experience. Higher magic and sword ranks also need instruction or dedicated study. Choices show costs and tradeoffs. When a path carries danger, the outcome is uncertain; taking an unaffordable choice is never required.",
          )}
        </p>
        <p>
          {t(
            "At eight, choose a magic discipline: water, fire, earth, wind, or healing. You can change your current study in the training panel. Practice develops that discipline, while spells in your other studies stay learned. Your character page keeps the whole spellbook, including the experience and instruction needed for each next spell.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("Let your work become a calling.")}</h3>
        <p>
          {t(
            "Adventurers, merchants, healers, guards, and teachers gain experience and reputation through their work. Promotion offers need the relevant skills too; your calling panel shows the requirements. Accepting a promotion brings a new title and higher yearly income, with more responsibility. Changing vocation starts a new career track while keeping your savings and learned magic.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("Sometimes, you can simply watch.")}</h3>
        <p>
          {t(
            "Watch mode makes affordable, low-risk choices for you while time is playing. Turn it off whenever you want to decide for yourself. Long-lived races move through their later years faster, so a whole life stays manageable.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("Your story stays on this device.")}</h3>
        <p>
          {t(
            "The game saves your progress in this browser, including the decision waiting for you. Time rests while the page is closed or hidden. Your last 20 completed lives remain in Past lives. Clearing browser data removes these local records.",
          )}
        </p>
      </section>
      <section>
        <h3>{t("A familiar world, an original life.")}</h3>
        <p>
          {t(
            "This is an unofficial fan creation inspired by Mushoku Tensei and the life-simulation structure of 1 in 8 Billion. The protagonist, stories, art, and game rules are original. Birth weights, lifespans, events, and outcomes are game balance; the illustrated map is a simplified guide.",
          )}
        </p>
      </section>
      <button className="button primary" onClick={onPlay}>
        {t("Back to your story")}
        <ChevronRight size={16} />
      </button>
    </article>
  );
}
