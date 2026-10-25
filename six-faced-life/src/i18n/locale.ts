import type { Language, Life } from "../game/types";
import type { StorageLike } from "../game/storage";

const LANGUAGE_PREFERENCE_KEY = "six-faced-life.language";

export function languageOf(
  life: Pick<Life, "language"> | null | undefined,
): Language {
  return life?.language ?? "en";
}

/** A convenience preference must never enter the game-save recovery boundary. */
export function readLanguagePreference(storage: StorageLike): Language {
  try {
    return storage.getItem(LANGUAGE_PREFERENCE_KEY) === "th" ? "th" : "en";
  } catch {
    return "en";
  }
}

export function writeLanguagePreference(
  storage: StorageLike,
  language: Language,
): boolean {
  try {
    storage.setItem(LANGUAGE_PREFERENCE_KEY, language);
    return true;
  } catch {
    return false;
  }
}
