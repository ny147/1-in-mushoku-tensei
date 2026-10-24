import {
  ArrowRight,
  BookOpen,
  Dices,
  Leaf,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import type { Life, RegionId } from "../game/types";
import { RACES, REGIONS } from "../game/world";

export function NewLife({
  onCreate,
  hasActive,
  onCancel,
}: {
  onCreate: (name: string, region?: RegionId) => void;
  hasActive: boolean;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [replace, setReplace] = useState(false);
  return (
    <div className="new-life page-enter">
      <div className="opening-art">
        <img
          src="/assets/asura-countryside.png"
          alt="An original painting of a sunlit fantasy village, golden fields, and distant mountains"
        />
        <div className="opening-shade" />
        <div className="opening-art-copy">
          <Leaf size={26} strokeWidth={1.3} />
          <p>
            Somewhere in the Six-Faced World,
            <br />a life is waiting to begin.
          </p>
        </div>
        <span className="art-credit">An imagined corner of Asura</span>
      </div>
      <div className="opening-copy">
        <h1>
          A new world.
          <br />A second chance.
        </h1>
        <p className="opening-description">
          You remember a life before this one.
          <br />
          What you do with this one is up to you.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (hasActive && !replace) {
              setReplace(true);
              return;
            }
            onCreate(name, region ? (region as RegionId) : undefined);
          }}
        >
          <label htmlFor="name">
            Your name <span>optional</span>
          </label>
          <input
            id="name"
            maxLength={32}
            autoComplete="off"
            placeholder="Let this world name you"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label htmlFor="birthplace">Where your story begins</label>
          <div className="select-wrap">
            <MapPin size={16} />
            <select
              id="birthplace"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">Let fate decide</option>
              {Object.entries(REGIONS).map(([id, r]) => (
                <option value={id} key={id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <p className="fate-note">
            <Dices size={16} /> Your family, race, and gifts are drawn by fate.
          </p>
          {replace && (
            <div className="inline-warning" role="alert">
              Beginning again replaces your unfinished life. Completed lives
              stay in your archive.
              <button type="button" className="text-button" onClick={onCancel}>
                Keep my current life
              </button>
            </div>
          )}
          <button className="button primary begin-button" type="submit">
            {replace ? "Leave this life and begin again" : "Begin a new life"}
            <ArrowRight size={18} />
          </button>
          {hasActive && !replace && (
            <button
              type="button"
              className="button quiet return-button"
              onClick={onCancel}
            >
              Return to your chronicle
            </button>
          )}
        </form>
        <div className="opening-note">
          <BookOpen size={18} />
          <p>
            An entire lifetime, one choice at a time.
            <br />
            <span>Your story is saved in this browser.</span>
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
  return (
    <section className="birth-record page-enter">
      <div className="birth-illustration">
        <img
          src="/assets/asura-countryside.png"
          alt="A peaceful village in an original fantasy landscape"
        />
      </div>
      <div className="birth-paper">
        <Sparkles className="birth-spark" size={26} strokeWidth={1.2} />
        <h1>Welcome back to the world.</h1>
        <p className="birth-subtitle">A different sky. The same soul.</p>
        <div className="birth-name">
          {life.name} {life.surname}
        </div>
        <p>
          You are born in {REGIONS[life.birthRegion].name}, into{" "}
          {life.background.toLowerCase()}. Beyond a small window, a whole world
          carries on. You have been here before. Just not here.
        </p>
        <dl className="birth-details">
          <div>
            <dt>Race</dt>
            <dd>{RACES[life.race].name}</dd>
          </div>
          <div>
            <dt>Birthplace</dt>
            <dd>{REGIONS[life.birthRegion].short}</dd>
          </div>
          <div>
            <dt>Family</dt>
            <dd>{life.background.replace("A ", "")}</dd>
          </div>
          <div>
            <dt>A natural gift</dt>
            <dd>{life.aptitude}</dd>
          </div>
        </dl>
        <div className="memory-seal">
          <Sparkles size={17} />
          <span>You carry memories of a previous life.</span>
        </div>
        <button className="button primary" onClick={onBegin}>
          Open my chronicle
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
