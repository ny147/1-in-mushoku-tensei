/** View navigation only. Never store simulation state in URLs or history entries. */
export type Page = 'chronicle' | 'character' | 'world' | 'archive' | 'new' | 'help';
export type AppRoute = { page: Exclude<Page, 'archive'> } | { page: 'archive'; lifeId?: string };
export type NavigationContext = { hasLife: boolean; archiveIds: readonly string[]; loadFailed: boolean };
export type RouteNotice = 'missing-archive' | null;
export type RouteResolution = { route: AppRoute; href: string; notice: RouteNotice };
const pages: readonly string[] = ['chronicle', 'character', 'world', 'archive', 'new', 'help'];

export function routeHref(route: AppRoute, base: URL): string {
  const url = new URL(base);
  url.searchParams.set('view', route.page);
  url.searchParams.delete('life');
  if (route.page === 'archive' && route.lifeId !== undefined) url.searchParams.set('life', route.lifeId);
  return url.pathname + url.search + url.hash;
}

export function resolveRoute(url: URL, context: NavigationContext): RouteResolution {
  const views = url.searchParams.getAll('view');
  const defaultPage = context.hasLife || context.loadFailed ? 'chronicle' : 'new';
  let page: Page = views.length === 1 && pages.includes(views[0]) ? views[0] as Page : defaultPage;
  if (page === 'chronicle' && !context.hasLife && !context.loadFailed) page = 'new';
  let route: AppRoute = { page };
  let notice: RouteNotice = null;
  if (page === 'archive' && url.searchParams.has('life')) {
    const ids = url.searchParams.getAll('life');
    if (ids.length === 1 && ids[0] && (context.loadFailed || context.archiveIds.includes(ids[0]))) {
      route = { page, lifeId: ids[0] };
    } else notice = 'missing-archive';
  }
  return { route, href: routeHref(route, url), notice };
}

export function sameRoute(a: AppRoute, b: AppRoute): boolean {
  return a.page === b.page && (a.page !== 'archive' || b.page !== 'archive' || a.lifeId === b.lifeId);
}
