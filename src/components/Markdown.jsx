import { renderMarkdown } from './renderMarkdown.js';

export default function Markdown({ source, localImages }) {
  return <div dangerouslySetInnerHTML={{ __html: renderMarkdown(source, localImages) }} />;
}
