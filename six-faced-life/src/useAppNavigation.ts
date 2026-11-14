import { useCallback, useEffect, useRef, useState } from "react";
import {
  resolveRoute,
  routeHref,
  sameRoute,
  readNavigationEntry,
  mergeNavigationEntry,
  archiveRowId,
  type NavigationEntry,
  type AppRoute,
  type NavigationContext,
} from "./navigation";

type Transition = { route: AppRoute; changed: boolean; focusTarget?: string };
type Options = { replace?: boolean; focusTarget?: string };
const navigationError = "This section could not be opened. Try the link again.";
const missingArchive = "This past life is no longer available on this device.";
let entrySequence = 0;
const newEntry = (): NavigationEntry => ({
  version: 1,
  entryId: `nav-${Date.now().toString(36)}-${++entrySequence}`,
});

/** Browser adapter; game data remains owned by App and never enters history. */
export function useAppNavigation(
  context: NavigationContext,
  onTransition: (transition: Transition) => void,
) {
  const [initial] = useState(() =>
    resolveRoute(new URL(window.location.href), context),
  );
  const [route, setRoute] = useState(initial.route);
  const [notice, setNotice] = useState<string | null>(
    initial.notice ? missingArchive : null,
  );
  const routeRef = useRef(route);
  const contextRef = useRef(context);
  const transitionRef = useRef(onTransition);
  contextRef.current = context;
  transitionRef.current = onTransition;
  const contextKey = JSON.stringify(context);
  const previousContext = useRef(contextKey);
  const restoration = useRef<(() => void) | null>(null);

  const restoreList = useCallback((entry: NavigationEntry) => {
    restoration.current?.();
    let cancelled = false;
    let frame = 0;
    const restore = () => {
      if (cancelled) return;
      const row = entry.archiveLifeId
        ? document.getElementById(archiveRowId(entry.archiveLifeId))
        : null;
      (row ?? document.getElementById("page-title"))?.focus({
        preventScroll: true,
      });
      const max = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      window.scrollTo({
        top: Math.min(entry.archiveScrollY ?? 0, max),
        behavior: "instant",
      });
    };
    frame = requestAnimationFrame(restore);
    // One bounded correction if self-hosted fonts finish after the initial layout.
    document.fonts?.ready.then(() => {
      if (!cancelled) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(restore);
      }
    });
    restoration.current = () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  const apply = useCallback(
    (next: AppRoute, options: Options = {}, force = false) => {
      const changed = !sameRoute(routeRef.current, next);
      if (changed || force) restoration.current?.();
      routeRef.current = next;
      if (changed) setRoute(next);
      if (changed || force)
        transitionRef.current({
          route: next,
          changed,
          focusTarget: options.focusTarget,
        });
    },
    [],
  );

  const reconcile = useCallback(
    (initialLoad = false) => {
      const result = resolveRoute(
        new URL(window.location.href),
        contextRef.current,
      );
      const href =
        window.location.pathname +
        window.location.search +
        window.location.hash;
      if (result.notice) setNotice(missingArchive);
      const entry = readNavigationEntry(history.state);
      const changed = !sameRoute(routeRef.current, result.route);
      try {
        if (href !== result.href || !entry)
          history.replaceState(
            mergeNavigationEntry(history.state, entry ?? newEntry()),
            "",
            result.href,
          );
      } catch {
        setNotice(navigationError);
      }
      const skipTarget = initialLoad && location.hash === "#main-content";
      apply(
        result.route,
        { focusTarget: skipTarget ? "main-content" : undefined },
        !!skipTarget,
      );
      if (
        (changed || initialLoad) &&
        !skipTarget &&
        result.route.page === "archive" &&
        !result.route.lifeId &&
        entry?.archiveScrollY !== undefined
      )
        restoreList(entry);
    },
    [apply, restoreList],
  );

  useEffect(() => {
    reconcile(true);
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const onPop = () => reconcile();
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      restoration.current?.();
      history.scrollRestoration = previousRestoration;
    };
  }, [reconcile]);
  useEffect(() => {
    if (previousContext.current !== contextKey) {
      previousContext.current = contextKey;
      reconcile();
    }
  }, [contextKey, reconcile]);

  const navigate = useCallback(
    (next: AppRoute, options: Options = {}) => {
      const href = routeHref(next, new URL(window.location.href));
      try {
        if (sameRoute(routeRef.current, next)) {
          if (
            window.location.pathname +
              window.location.search +
              window.location.hash !==
            href
          )
            history.replaceState(history.state, "", href);
        } else {
          let entry = options.replace
            ? (readNavigationEntry(history.state) ?? newEntry())
            : newEntry();
          if (
            !options.replace &&
            routeRef.current.page === "archive" &&
            !routeRef.current.lifeId &&
            next.page === "archive" &&
            next.lifeId
          ) {
            const list = {
              ...(readNavigationEntry(history.state) ?? newEntry()),
              archiveScrollY: window.scrollY,
              archiveLifeId: next.lifeId,
            };
            history.replaceState(
              mergeNavigationEntry(history.state, list),
              "",
              window.location.href,
            );
            entry = {
              ...entry,
              archiveReturnEntryId: list.entryId,
              archivePreviewHref: href,
            };
          }
          history[options.replace ? "replaceState" : "pushState"](
            mergeNavigationEntry(options.replace ? history.state : null, entry),
            "",
            href,
          );
        }
      } catch {
        setNotice(navigationError);
        return;
      }
      setNotice(null);
      apply(next, options, true);
    },
    [apply],
  );

  const returnToArchive = useCallback(() => {
    const entry = readNavigationEntry(history.state);
    const href =
      window.location.pathname + window.location.search + window.location.hash;
    if (
      routeRef.current.page === "archive" &&
      routeRef.current.lifeId &&
      entry?.archiveReturnEntryId &&
      entry.archivePreviewHref === href
    )
      history.back();
    else navigate({ page: "archive" }, { replace: true });
  }, [navigate]);
  return {
    route,
    navigate,
    returnToArchive,
    notice,
    dismissNotice: () => setNotice(null),
  };
}
