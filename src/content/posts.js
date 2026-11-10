import posts from './posts.json';

export const newestFirst = (a, b) => b.date.localeCompare(a.date);

/** Newest first, whatever order the file keeps them in. */
export const postsByDate = [...posts].sort(newestFirst);

/** A "YYYY-MM-DD" date, read as that calendar day wherever the reader is. */
export const formatDate = (iso, options) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', ...options });

export const formatPostDate = (iso) => formatDate(iso, { day: 'numeric', month: 'long', year: 'numeric' });
