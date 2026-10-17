import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Tells the site's own insights service which page was opened. Only the path
 * is sent; the service counts visitors without cookies (see insights-service).
 * Client-side navigation never reaches the server, hence a beacon per route.
 */
export default function ViewBeacon() {
  const { pathname } = useLocation();
  const lastSent = useRef(null);

  useEffect(() => {
    // StrictMode runs effects twice in development; count a page once.
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;
    navigator.sendBeacon?.('/api/insights/hit', pathname);
  }, [pathname]);

  return null;
}
