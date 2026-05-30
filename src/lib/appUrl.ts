/** URLs públicas do app (BrowserRouter — sem hash). */

export function bookPath(slug: string): string {
  const clean = slug.trim().replace(/^\/+|\/+$/g, '');
  return `/book/${clean}`;
}

export function bookUrl(slug: string): string {
  if (typeof window === 'undefined') return bookPath(slug);
  return `${window.location.origin}${bookPath(slug)}`;
}

/** Converte links antigos `/#/rota` para `/rota` (compatibilidade). */
export function migrateLegacyHashUrl(): void {
  if (typeof window === 'undefined') return;
  const { hash, pathname, search } = window.location;
  if (!hash.startsWith('#/')) return;
  const path = hash.slice(1);
  const target = `${pathname === '/' ? '' : pathname}${path}${search}`;
  window.history.replaceState(null, '', target || '/');
}
