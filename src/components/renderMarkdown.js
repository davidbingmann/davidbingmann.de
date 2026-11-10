import { Marked } from 'marked';

const escape = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Only web, mail and on-site addresses; never javascript: or data: URLs.
// `/\host` counts as off-site too: browsers read it like `//host`.
const safeUrl = (href) => (/^(https?:\/\/|mailto:|\/(?![/\\])|#)/i.test(href || '') ? escape(href) : null);

// Bodies are written in the admin panel and land on the public site. Raw HTML
// is shown as text and unsafe URLs are dropped, so even someone who got into
// the panel could change words, but never run code in a visitor's browser.
// Set only while the admin preview renders: a not yet published image
// address mapped to the picked file's local blob: URL.
let localImages = {};

const marked = new Marked({
  renderer: {
    html({ text }) {
      return escape(text);
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const url = safeUrl(href);
      if (!url) return text;
      const external = /^https?:\/\//i.test(href);
      const attrs = [
        `href="${url}"`,
        title ? `title="${escape(title)}"` : '',
        // Links that leave the site open in a new tab, like ExternalLink does.
        external ? 'target="_blank" rel="noopener noreferrer"' : '',
      ];
      return `<a ${attrs.filter(Boolean).join(' ')}>${text}</a>`;
    },
    image({ href, title, text }) {
      const url = localImages[href] ? escape(localImages[href]) : safeUrl(href);
      if (!url) return escape(text);
      const caption = title ? ` title="${escape(title)}"` : '';
      return `<img src="${url}" alt="${escape(text)}"${caption} loading="lazy">`;
    },
  },
});

/** Markdown to HTML that is safe to put on the public site. */
export function renderMarkdown(source, images = {}) {
  localImages = images;
  try {
    return marked.parse(source || '');
  } finally {
    localImages = {};
  }
}
