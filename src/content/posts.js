import posts from './posts.json';

/** Newest first, whatever order the file keeps them in. */
export const postsByDate = [...posts].sort((a, b) => b.date.localeCompare(a.date));

export const formatPostDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
