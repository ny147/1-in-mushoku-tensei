import type { Life, Stat } from "../game/types";

export interface ChoiceResult {
  lifeId: string;
  title: string;
  text: string;
  changes: string[];
}

export function describeChoice(before: Life, after: Life): ChoiceResult {
  const entry = [...after.history]
    .reverse()
    .find((item) => item.kind === "choice" || item.kind === "memory");
  const stats: [Stat, string][] = [
    ["health", "Health"],
    ["happiness", "Happiness"],
    ["knowledge", "Knowledge"],
    ["bonds", "Bonds"],
    ["mana", "Mana"],
    ["sword", "Sword skill"],
  ];
  const values: [string, number][] = stats.map(([key, label]) => [
    label,
    Math.round(after.stats[key]) - Math.round(before.stats[key]),
  ]);
  values.push(
    ["Silver", after.coins - before.coins],
    ["Magic experience", after.training.magicXp - before.training.magicXp],
    ["Sword experience", after.training.swordXp - before.training.swordXp],
  );
  return {
    lifeId: after.id,
    title: entry?.title ?? "Your choice",
    text: entry?.text ?? "Your choice becomes part of your story.",
    changes: values
      .filter(([, amount]) => amount !== 0)
      .map(
        ([label, amount]) =>
          `${label} ${amount > 0 ? "+" : "−"}${Math.abs(amount)}`,
      ),
  };
}

export function ChoiceOutcome({
  result,
  onContinue,
}: {
  result: ChoiceResult;
  onContinue: () => void;
}) {
  return (
    <section className="choice-outcome" aria-label="Your choice">
      <h2 id="outcome-heading" tabIndex={-1}>
        {result.title}
      </h2>
      <p className="outcome-narrative">{result.text}</p>
      {result.changes.length > 0 && (
        <ul className="outcome-changes" aria-label="What changed">
          {result.changes.map((change) => (
            <li key={change}>{change}</li>
          ))}
        </ul>
      )}
      <button className="button primary" onClick={onContinue}>
        Continue to next decision
      </button>
      <p className="outcome-note">
        Your choice is recorded in the chronicle below.
      </p>
    </section>
  );
}
