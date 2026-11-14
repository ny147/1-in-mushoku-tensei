import { describe, expect, it } from "vitest";
import {
  resolveRoute,
  routeHref,
  sameRoute,
  readNavigationEntry,
  mergeNavigationEntry,
  archiveRowId,
} from "./navigation";

const context = {
  hasLife: true,
  archiveIds: ["old / ชีวิต"],
  loadFailed: false,
};
const url = (query = "") => new URL(`https://example.test/play${query}`);

describe("navigation URLs", () => {
  it("defaults safely without creating a life and preserves unrelated URL parts", () => {
    expect(resolveRoute(url("?source=test#main-content"), context)).toEqual({
      route: { page: "chronicle" },
      href: "/play?source=test&view=chronicle#main-content",
      notice: null,
    });
    expect(resolveRoute(url(), { ...context, hasLife: false }).route).toEqual({
      page: "new",
    });
    expect(
      resolveRoute(url("?view=character"), { ...context, hasLife: false })
        .route,
    ).toEqual({ page: "character" });
    expect(
      resolveRoute(url("?view=chronicle"), { ...context, hasLife: false })
        .route,
    ).toEqual({ page: "new" });
  });

  it.each([
    "chronicle",
    "character",
    "world",
    "archive",
    "new",
    "help",
  ] as const)("round-trips %s", (page) => {
    expect(resolveRoute(url(`?view=${page}`), context)).toEqual({
      route: { page },
      href: `/play?view=${page}`,
      notice: null,
    });
  });

  it.each(["?view=unknown", "?view=", "?view=world&view=character"])(
    "normalizes malformed section %s",
    (query) => {
      expect(resolveRoute(url(query), context).route).toEqual({
        page: "chronicle",
      });
    },
  );

  it("encodes archive IDs without changing the caller URL", () => {
    const base = url("?source=test&view=world#main-content");
    const href = routeHref({ page: "archive", lifeId: "old / ชีวิต" }, base);
    expect(href).toBe(
      "/play?source=test&view=archive&life=old+%2F+%E0%B8%8A%E0%B8%B5%E0%B8%A7%E0%B8%B4%E0%B8%95#main-content",
    );
    expect(base.search).toBe("?source=test&view=world");
    expect(resolveRoute(new URL(href, base), context).route).toEqual({
      page: "archive",
      lifeId: "old / ชีวิต",
    });
    expect(resolveRoute(url("?view=world&life=old"), context).href).toBe(
      "/play?view=world",
    );
  });

  it.each([
    "?view=archive&life=",
    "?view=archive&life=missing",
    "?view=archive&life=one&life=two",
  ])("recovers missing preview %s", (query) => {
    expect(resolveRoute(url(query), context)).toEqual({
      route: { page: "archive" },
      href: "/play?view=archive",
      notice: "missing-archive",
    });
  });

  it("defers data-dependent fallbacks during failed loading", () => {
    const failed = { hasLife: false, archiveIds: [], loadFailed: true };
    expect(resolveRoute(url("?view=archive&life=old"), failed).route).toEqual({
      page: "archive",
      lifeId: "old",
    });
    expect(resolveRoute(url("?view=chronicle"), failed).route).toEqual({
      page: "chronicle",
    });
    expect(
      resolveRoute(url("?view=archive&life=old"), {
        ...failed,
        loadFailed: false,
      }).notice,
    ).toBe("missing-archive");
    expect(
      resolveRoute(url("?view=archive&life=old"), {
        ...failed,
        archiveIds: ["old"],
        loadFailed: false,
      }).route,
    ).toEqual({ page: "archive", lifeId: "old" });
  });

  it("compares sections and selected previews separately", () => {
    expect(
      sameRoute(
        { page: "archive", lifeId: "one" },
        { page: "archive", lifeId: "two" },
      ),
    ).toBe(false);
    expect(sameRoute({ page: "world" }, { page: "world" })).toBe(true);
  });
});

describe("navigation entry boundaries", () => {
  it.each([
    null,
    [],
    {},
    { sflNavigation: { version: 2, entryId: "one" } },
    { sflNavigation: { version: 1, entryId: "one", archiveScrollY: -1 } },
    { sflNavigation: { version: 1, entryId: "one", archiveScrollY: Infinity } },
  ])("rejects malformed metadata %j", (state) => {
    expect(readNavigationEntry(state)).toBeNull();
  });
  it("preserves unrelated object state and serializes only known navigation fields", () => {
    const entry = {
      version: 1 as const,
      entryId: "one",
      archiveScrollY: 50,
      archiveLifeId: "old",
    };
    const state = mergeNavigationEntry(
      { otherApp: 42, sflNavigation: { life: { coins: 900 } } },
      entry,
    );
    expect(state).toEqual({ otherApp: 42, sflNavigation: entry });
    expect(readNavigationEntry(state)).toEqual(entry);
    expect(archiveRowId("old / ชีวิต")).not.toBe(archiveRowId("old_ / ชีวิต"));
    expect(archiveRowId("old / ชีวิต")).not.toMatch(/\s/);
  });
});
