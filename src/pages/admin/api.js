async function request(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error('The server could not be reached. Check your connection and try again.');
  }
  // An expired login makes Authelia send the request to its sign-in page.
  if (response.redirected || response.status === 401) {
    throw new Error(
      'Your login has expired. Sign in again at davidbingmann.de/auth in a new tab, then come back and try again. Nothing here is lost.'
    );
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `The server answered with ${response.status}.`);
  return payload;
}

export const loadContent = () => request('/api/admin/content');

export const loadStats = () => request('/api/admin/insights');

export const loadBuild = () => request('/api/admin/build').then((payload) => payload.build);

export const saveCollection = (name, items, sha, message, files = []) =>
  request(`/api/admin/content/${name}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, sha, message, files }),
  });

const FOLDERS = { pdf: '/papers', png: '/images', jpg: '/images', jpeg: '/images', webp: '/images' };
export const MAX_FILE_MB = 20;

/** The name and address a file will have on the site. Cleaned exactly like
    upload_name() in admin-service/app.py, which checks it again. */
export function fileTarget(fileName) {
  const dot = fileName.lastIndexOf('.');
  const extension = fileName.slice(dot + 1).toLowerCase();
  if (dot < 0 || !FOLDERS[extension]) throw new Error('Only PDF, PNG, JPEG and WebP files can be added.');
  const stem = fileName
    .slice(0, dot)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '');
  if (!stem) throw new Error('The file needs a name.');
  const name = `${stem}.${extension}`;
  return { name, url: `${FOLDERS[extension]}/${name}` };
}

export const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',', 2)[1]);
    reader.onerror = () => reject(new Error(`${file.name} could not be read. Add it again.`));
    reader.readAsDataURL(file);
  });

export const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
