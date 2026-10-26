import type { SaveData } from "./types";
const object = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);
/** Optional lossless representation of repeated prose; no fields are omitted. */
export function encodeSave(save: SaveData): string {
  const raw = JSON.stringify(save);
  if (
    raw.length < 3_000_000 ||
    ![save.active, ...save.archive].some((l) => l?.ruleset === "expanded-1")
  )
    return raw;
  const dictionary: string[] = [],
    indices = new Map<string, number>();
  const pack = (v: unknown): unknown => {
    if (typeof v === "string" && v.length > 32) {
      let index = indices.get(v);
      if (index === undefined) {
        index = dictionary.length;
        indices.set(v, index);
        dictionary.push(v);
      }
      return { _s: index };
    }
    if (Array.isArray(v)) return v.map(pack);
    if (object(v))
      return Object.fromEntries(
        Object.entries(v).map(([k, value]) => [k, pack(value)]),
      );
    return v;
  };
  const active = pack(save.active),
    archive = pack(save.archive);
  const encoded = JSON.stringify({
    version: 1,
    encoding: "dictionary-1",
    dictionary,
    active,
    archive,
  });
  return encoded.length < raw.length ? encoded : raw;
}
export function decodeSave(value: unknown): unknown {
  if (!object(value) || !Object.hasOwn(value, "encoding")) return value;
  if (
    value.encoding !== "dictionary-1" ||
    value.version !== 1 ||
    !Array.isArray(value.dictionary) ||
    value.dictionary.length > 100_000 ||
    !value.dictionary.every((s) => typeof s === "string" && s.length <= 12000)
  )
    throw Error("unsupported encoding");
  const dictionary = value.dictionary as string[];
  let nodes = 0,
    characters = 0;
  const unpack = (v: unknown, depth = 0): unknown => {
    if (++nodes > 2_000_000 || depth > 32) throw Error("encoded bounds");
    if (object(v) && Object.hasOwn(v, "_s")) {
      if (
        Object.keys(v).length !== 1 ||
        !Number.isSafeInteger(v._s) ||
        (v._s as number) < 0 ||
        (v._s as number) >= dictionary.length
      )
        throw Error("invalid text reference");
      const text = dictionary[v._s as number];
      characters += text.length;
      if (characters > 80_000_000) throw Error("decoded bounds");
      return text;
    }
    if (Array.isArray(v)) return v.map((item) => unpack(item, depth + 1));
    if (object(v))
      return Object.fromEntries(
        Object.entries(v).map(([k, item]) => [k, unpack(item, depth + 1)]),
      );
    if (typeof v === "string") {
      characters += v.length;
      if (characters > 80_000_000) throw Error("decoded bounds");
    }
    return v;
  };
  return {
    version: 1,
    active: unpack(value.active),
    archive: unpack(value.archive),
  };
}
