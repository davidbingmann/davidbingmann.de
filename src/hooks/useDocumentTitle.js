import { useEffect } from 'react';

const SITE = 'David Bingmann';

/** Sets the tab title, appending the site name to every page but the home page. */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} - ${SITE}` : SITE;
  }, [title]);
}
