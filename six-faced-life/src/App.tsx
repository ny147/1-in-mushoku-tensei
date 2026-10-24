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
  Life,
  MagicSchool,
  RegionId,
  SaveData,
} from "./game/types";
import { setSpecialization } from "./game/progression";
import {
  advance,
  beginLife,
  choose,
  createLife,
  getDecision,
  setFocus,
} from "./game/engine";
import { archiveLife, loadGame, saveGame } from "./game/storage";
import { RACES, REGIONS, lifeStage } from "./game/world";
import { BirthRecord, NewLife } from "./components/NewLife";
import { CharacterView, LifeView } from "./components/LifeView";
import { Archive, Ending } from "./components/Archive";
import { WorldView } from "./components/WorldView";

type Page = "chronicle" | "character" | "world" | "archive" | "new" | "help";
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
  return (
    <div className="brand">
      <svg viewBox="0 0 40 44" aria-hidden="true">
        <path d="m20 3 16 9v20l-16 9L4 32V12Zm0 0v38M4 12l16 10 16-10M4 32l16-10 16 10" />
        <path d="m12 8 16 28M28 8 12 36" opacity=".4" />
      </svg>
      <div>
        <strong>Six-Faced Life</strong>
        <span>A second chance</span>
      </div>
    </div>
  );
}

export default function App() {
  const [initial] = useState(readInitial);
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
  const dirty = useRef(false);
  const lastSave = useRef(0);
  const previousLife = useRef<Life | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const life = data.active;

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
      life?.progression?.specialization !==
        previousLife.current?.progression?.specialization;
    if (important || Date.now() - lastSave.current >= 1500) {
      let ok = false;
      try {
        ok = saveGame(window.localStorage, data);
      } catch {
        /* storage disabled by browser */
      }
      setSaved(ok);
      lastSave.current = Date.now();
      previousLife.current = life;
    }
  }, [data, life]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page, life?.phase]);
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
          if (!current || document.hidden) return current;
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
        !["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(target.tagName) &&
        page === "chronicle" &&
        life?.phase === "alive"
      ) {
        event.preventDefault();
        setPlaying((value) => !value);
      }
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [life?.phase, page]);

  function navigate(next: Page) {
    setPage(next);
    setMenuOpen(false);
    setPreview(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function startNew(name: string, region?: RegionId) {
    updateLife(() => createLife({ name, region }));
    setAuto(false);
    setPlaying(false);
    navigate("chronicle");
  }
  function selectChoice(id: string) {
    updateLife((current) => (current ? choose(current, id) : null));
  }
  const onAdvance = () =>
    updateLife((current) => (current ? advance(current, "decision") : null));
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
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to your story
      </a>
      <div className="mobile-top">
        <Brand />
        <button
          className="icon-button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <aside className={`sidebar ${menuOpen ? "menu-open" : ""}`}>
        <Brand />
        <div className="sidebar-rule" />
        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={
                page === id || (id === "chronicle" && page === "new")
                  ? "active"
                  : ""
              }
              onClick={() => navigate(id === "chronicle" && !life ? "new" : id)}
              aria-current={page === id ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={1.6} />
              {label}
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
              {RACES[life.race].name} · Age {life.age}
            </p>
            <span>
              <MapPinIcon />
              {REGIONS[life.region].short}
            </span>
            <div className="sidebar-soul">
              <Sparkles size={13} />A reincarnated soul
            </div>
          </div>
        )}
        <div className="sidebar-bottom">
          <button onClick={() => navigate("help")}>
            <CircleHelp size={17} />
            How to play
          </button>
          <div className="sidebar-colophon">
            <Leaf size={19} strokeWidth={1.2} />
            <p>
              In the world of
              <br />
              <strong>Mushoku Tensei</strong>
            </p>
            <span>An unofficial fan creation</span>
          </div>
        </div>
      </aside>
      <main id="main-content" className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>The Six-Faced World</span>
            <ChevronRight size={13} />
            <strong>
              {page === "new" ||
              (life?.phase === "birth" && page === "chronicle")
                ? "A new beginning"
                : page === "help"
                  ? "How to play"
                  : navItems.find((n) => n.id === page)?.label}
            </strong>
          </div>
          <div className="topbar-actions">
            <span
              className={`save-indicator ${saved ? "" : "unsaved"}`}
              title="Lives are stored only in this browser"
            >
              {saved ? <Check size={13} /> : <VolumeX size={13} />}
              {saved ? "Saved on this device" : "Not saved"}
            </span>
            {page !== "new" && (
              <button
                className="button new-life-button"
                onClick={() => navigate("new")}
              >
                <Plus size={15} />
                New life
              </button>
            )}
          </div>
        </header>
        {notice && (
          <div className="notice" role="alert">
            <p>{notice}</p>
            <button
              className="icon-button"
              aria-label="Dismiss message"
              onClick={() => setNotice(null)}
            >
              <X size={17} />
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
                  <h1>
                    {page === "chronicle"
                      ? life?.phase === "ended"
                        ? "A life worth remembering."
                        : life
                          ? `${life.name} ${life.surname}`
                          : "Your story begins here."
                      : titles[page]}
                  </h1>
                  <p>
                    {page === "chronicle" && life
                      ? `${RACES[life.race].name} · ${lifeStage(life.age, life.race)} · ${REGIONS[life.region].name}`
                      : page === "character"
                        ? "The gifts you were given. The choices you’ve made."
                        : page === "world"
                          ? "There is always something beyond the next horizon."
                          : page === "archive"
                            ? "Every ending is also a story worth keeping."
                            : "One lifetime, one choice at a time."}
                  </p>
                </div>
                {showTime && (
                  <div className="age-display">
                    <span>Age</span>
                    <strong>{life.age}</strong>
                    <span>years</span>
                  </div>
                )}
              </header>
            )}
          {showTime && (
            <section className="time-bar" aria-label="Time controls">
              <div className="time-main">
                <button
                  className={`play-button ${playing ? "is-playing" : ""}`}
                  aria-label={playing ? "Pause time" : "Play time"}
                  onClick={() => setPlaying(!playing)}
                >
                  {playing ? (
                    <Pause size={15} fill="currentColor" />
                  ) : (
                    <Play size={15} fill="currentColor" />
                  )}
                  <span>
                    {playing
                      ? life.pending
                        ? "Waiting for you"
                        : "Life is unfolding"
                      : "Paused"}
                  </span>
                </button>
                <div className="speed-controls" aria-label="Playback speed">
                  {[1, 2, 4, 8].map((s) => (
                    <button
                      key={s}
                      aria-pressed={speed === s}
                      className={speed === s ? "active" : ""}
                      onClick={() => setSpeed(s)}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
                <span className="year-clock">
                  {Math.round(life.progress * 100)}% of this year
                </span>
              </div>
              <div className="time-forward">
                <label className="auto-control">
                  <input
                    type="checkbox"
                    checked={auto}
                    onChange={(e) => setAuto(e.target.checked)}
                  />
                  <span className="switch" />
                  Watch mode
                </label>
                <button
                  className="time-step"
                  disabled={!!life.pending}
                  onClick={() =>
                    updateLife((current) =>
                      current ? advance(current, "year") : null,
                    )
                  }
                >
                  +1 year
                </button>
                <button
                  className="next-decision"
                  disabled={!!life.pending}
                  onClick={onAdvance}
                >
                  Next decision
                  <SkipForward size={14} />
                </button>
              </div>
              <div className="year-progress">
                <span style={{ width: `${life.progress * 100}%` }} />
              </div>
            </section>
          )}
          {page === "new" ? (
            <NewLife
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
                life={preview}
                onNew={() => navigate("new")}
                onBack={() => setPreview(null)}
              />
            ) : (
              <Archive
                lives={data.archive}
                onRead={setPreview}
                onNew={() => navigate(life ? "chronicle" : "new")}
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
                updateLife((current) => (current ? beginLife(current) : null));
                setPlaying(true);
              }}
            />
          ) : life?.phase === "ended" ? (
            <Ending life={life} onNew={() => navigate("new")} />
          ) : life ? (
            <LifeView
              life={life}
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
            />
          ) : (
            <NewLife
              hasActive={false}
              onCreate={startNew}
              onCancel={() => {}}
            />
          )}
          <footer className="page-footer">
            <span>
              <Leaf size={13} />
              No two lives are quite the same.
            </span>
            <span>
              Six-Faced Life <span className="footer-separator">/</span> An
              unofficial fan-made simulation
            </span>
          </footer>
        </div>
      </main>
    </div>
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
  return (
    <div className="empty-archive">
      <UserRound size={40} strokeWidth={1} />
      <h2>A name waiting for a story.</h2>
      <p>Begin a life to discover the person you might become.</p>
      <button className="button primary" onClick={onNew}>
        Begin a new life
        <Feather size={16} />
      </button>
    </div>
  );
}
function Help({ onPlay }: { onPlay: () => void }) {
  return (
    <article className="help-page page-enter">
      <h2>You have another chance at a life.</h2>
      <p>
        Your protagonist remembers a previous world. Their birthplace, family,
        race, and gifts shape the opportunities ahead—but your choices help
        decide what happens next.
      </p>
      <section>
        <h3>Let time move, or turn the page yourself.</h3>
        <p>
          Press Play to let years pass. Use the speed buttons to move faster, +1
          year for a smaller step, or Next decision to reach the next choice.
          Time always stops for decisions. The space bar toggles play when you
          aren’t using a form or button.
        </p>
      </section>
      <section>
        <h3>Decide what matters this year.</h3>
        <p>
          Change your yearly focus to develop magic, train a sword style, study,
          earn silver, explore, rest, or spend time with others. More priorities
          open as you grow. Health, happiness, knowledge, and bonds all matter;
          becoming powerful is only one way to live well.
        </p>
      </section>
      <section>
        <h3>Learn from someone. Learn for yourself.</h3>
        <p>
          Practice earns experience. Higher magic and sword ranks also need
          instruction or dedicated study. Choices show costs and tradeoffs. When
          a path carries danger, the outcome is uncertain; taking an
          unaffordable choice is never required.
        </p>
        <p>
          At eight, choose a magic discipline: water, fire, earth, wind, or
          healing. You can change your current study in the training panel.
          Practice develops that discipline, while spells in your other studies
          stay learned. Your character page keeps the whole spellbook, including
          the experience and instruction needed for each next spell.
        </p>
      </section>
      <section>
        <h3>Let your work become a calling.</h3>
        <p>
          Adventurers, merchants, healers, guards, and teachers gain experience
          and reputation through their work. Promotion offers need the relevant
          skills too; your calling panel shows the requirements. Accepting a
          promotion brings a new title and higher yearly income, with more
          responsibility. Changing vocation starts a new career track while
          keeping your savings and learned magic.
        </p>
      </section>
      <section>
        <h3>Sometimes, you can simply watch.</h3>
        <p>
          Watch mode makes affordable, low-risk choices for you while time is
          playing. Turn it off whenever you want to decide for yourself.
          Long-lived races move through their later years faster, so a whole
          life stays manageable.
        </p>
      </section>
      <section>
        <h3>Your story stays on this device.</h3>
        <p>
          The game saves your progress in this browser, including the decision
          waiting for you. Time rests while the page is closed or hidden. Your
          last 20 completed lives remain in Past lives. Clearing browser data
          removes these local records.
        </p>
      </section>
      <section>
        <h3>A familiar world, an original life.</h3>
        <p>
          This is an unofficial fan creation inspired by Mushoku Tensei and the
          life-simulation structure of 1 in 8 Billion. The protagonist, stories,
          art, and game rules are original. Birth weights, lifespans, events,
          and outcomes are game balance; the illustrated map is a simplified
          guide.
        </p>
      </section>
      <button className="button primary" onClick={onPlay}>
        Back to your story
        <ChevronRight size={16} />
      </button>
    </article>
  );
}
