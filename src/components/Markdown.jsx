import { renderMarkdown } from './renderMarkdown.js';

/** Renders a body written in Markdown. */
export default function Markdown({ source }) {
  return <div dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }} />;
}
