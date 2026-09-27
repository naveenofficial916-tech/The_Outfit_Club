import { useState, useEffect } from 'react';

/**
 * Perform client-side navigation without page reload.
 */
export function navigateTo(url: string) {
  if (typeof window === 'undefined') return;
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Hook to reactively track the current pathname and search.
 */
export function useCurrentRoute() {
  const [route, setRoute] = useState(() => ({
    pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
    search: typeof window !== 'undefined' ? window.location.search : '',
  }));

  useEffect(() => {
    const handlePopState = () => {
      setRoute({
        pathname: window.location.pathname,
        search: window.location.search,
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return route;
}
