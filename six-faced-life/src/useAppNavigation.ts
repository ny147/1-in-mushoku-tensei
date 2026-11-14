import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveRoute, routeHref, sameRoute, type AppRoute, type NavigationContext } from './navigation';

type Transition = { route: AppRoute; changed: boolean; focusTarget?: string };
type Options = { replace?: boolean; focusTarget?: string };
const navigationError = 'This section could not be opened. Try the link again.';
const missingArchive = 'This past life is no longer available on this device.';

/** Browser adapter; game data remains owned by App and never enters history. */
export function useAppNavigation(context: NavigationContext, onTransition: (transition: Transition) => void) {
  const [initial] = useState(() => resolveRoute(new URL(window.location.href), context));
  const [route, setRoute] = useState(initial.route);
  const [notice, setNotice] = useState<string | null>(initial.notice ? missingArchive : null);
  const routeRef = useRef(route);
  const contextRef = useRef(context);
  const transitionRef = useRef(onTransition);
  contextRef.current = context;
  transitionRef.current = onTransition;
  const contextKey = JSON.stringify(context);

  const apply = useCallback((next: AppRoute, options: Options = {}, force = false) => {
    const changed = !sameRoute(routeRef.current, next);
    routeRef.current = next;
    if (changed) setRoute(next);
    if (changed || force) transitionRef.current({ route: next, changed, focusTarget: options.focusTarget });
  }, []);

  const reconcile = useCallback((initialLoad = false) => {
    const result = resolveRoute(new URL(window.location.href), contextRef.current);
    const href = window.location.pathname + window.location.search + window.location.hash;
    if (result.notice) setNotice(missingArchive);
    try {
      if (href !== result.href) history.replaceState(history.state, '', result.href);
    } catch { setNotice(navigationError); }
    apply(result.route, { focusTarget: initialLoad && location.hash === '#main-content' ? 'main-content' : undefined });
  }, [apply]);

  useEffect(() => {
    reconcile(true);
    const onPop = () => reconcile();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [reconcile]);
  useEffect(() => { reconcile(); }, [contextKey, reconcile]);

  const navigate = useCallback((next: AppRoute, options: Options = {}) => {
    const href = routeHref(next, new URL(window.location.href));
    try {
      if (!sameRoute(routeRef.current, next)) {
        history[options.replace ? 'replaceState' : 'pushState'](null, '', href);
      }
    } catch { setNotice(navigationError); return; }
    setNotice(null);
    apply(next, options, true);
  }, [apply]);

  return { route, navigate, notice, dismissNotice: () => setNotice(null) };
}
