import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * A route change keeps the window's scroll position by default, so following a
 * link from the bottom of a long page lands you at the bottom of the next one.
 * Back and forward are left alone: there the reader wants the position they
 * came from, which the browser restores itself.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, navigationType]);

  return null;
}
