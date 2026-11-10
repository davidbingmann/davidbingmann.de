import { useEffect, useRef, useState } from 'react';
import Markdown from '../../components/Markdown.jsx';
import { formatPostDate, newestFirst } from '../../content/posts.js';
import { MAX_FILE_MB, fileTarget, slugify, toBase64 } from './api.js';

const today = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const PUBLIC_NOTE =
  'Added files go public with Publish, together with the entry. After that they stay in the public history of the repository, even if you delete them later.';

const slugField = (folder) => ({
  key: 'slug',
  label: 'URL name',
  hint: (v) => `davidbingmann.de/${folder}/${v || '…'}`,
});

export const KINDS = {
  projects: {
    collection: 'projects',
    type: 'software',
    noun: 'project',
    describe: (entry) => entry.headline,
    blank: () => ({ type: 'software', title: '', slug: '', headline: '', summary: '', link: { href: '', label: '' }, body: '' }),
    fields: [
      { key: 'title', label: 'Title' },
      slugField('projects'),
      { key: 'headline', label: 'Headline', hint: 'One sentence under the title on the project page.' },
      { key: 'summary', label: 'Summary', kind: 'textarea', hint: 'Shown on the home page.' },
      { key: 'link.href', label: 'Link', hint: 'The repository, App Store page or website.', optional: true },
      { key: 'link.label', label: 'Link text', hint: 'Leave empty to show the address itself.', optional: true },
      { key: 'body', label: 'Text', kind: 'markdown', optional: true },
    ],
  },
  publications: {
    collection: 'projects',
    type: 'paper',
    noun: 'publication',
    describe: (entry) => entry.venue,
    blank: () => ({ type: 'paper', title: '', slug: '', venue: '', headline: '', link: { href: '', label: '' }, body: '' }),
    fields: [
      { key: 'title', label: 'Title' },
      slugField('projects'),
      { key: 'venue', label: 'Venue', hint: 'For example “Seminar paper, University of Trier”.' },
      { key: 'headline', label: 'Headline', hint: 'The question or claim of the paper, in one sentence.' },
      { key: 'link.href', label: 'Paper', kind: 'pdf', hint: `Add the PDF or paste a link to it. ${PUBLIC_NOTE}` },
      { key: 'link.label', label: 'Link text', hint: 'For example “Read the paper (PDF)”.', optional: true },
      { key: 'body', label: 'Text', kind: 'markdown', optional: true },
    ],
  },
  posts: {
    collection: 'posts',
    noun: 'post',
    // Shown newest first, like on the site; the date sets the order.
    byDate: true,
    describe: (entry) => formatPostDate(entry.date),
    blank: () => ({ title: '', slug: '', date: today(), summary: '', body: '' }),
    fields: [
      { key: 'title', label: 'Title' },
      slugField('posts'),
      { key: 'date', label: 'Date', kind: 'date' },
      { key: 'summary', label: 'Summary', kind: 'textarea', hint: 'Shown on the home page.', optional: true },
      { key: 'body', label: 'Text', kind: 'markdown', images: true },
    ],
  },
};

const read = (entry, key) => key.split('.').reduce((value, part) => value?.[part], entry) ?? '';

const write = (entry, key, value) => {
  const [head, tail] = key.split('.');
  return tail ? { ...entry, [head]: { ...entry[head], [tail]: value } } : { ...entry, [head]: value };
};

export default function Editor({ kindName, items, onSave, onEditingChange }) {
  const kind = KINDS[kindName];
  // { index, draft, slugTouched, files }: files are picked but not yet sent.
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null); // { tone, text }
  const isEditing = Boolean(editing);

  useEffect(() => {
    onEditingChange?.(isEditing);
    return () => onEditingChange?.(false);
  }, [isEditing, onEditingChange]);

  const belongs = (entry) => !kind.type || entry.type === kind.type;
  let indices = items.map((entry, index) => index).filter((index) => belongs(items[index]));
  if (kind.byDate) indices = indices.sort((a, b) => newestFirst(items[a], items[b]));

  const publish = async (next, message, after, files) => {
    setBusy(true);
    setStatus(null);
    try {
      await onSave(kind.collection, next, message, files);
      after?.();
      setStatus({ tone: 'ok', text: 'Published. The change is live as soon as the next build reaches the server.' });
    } catch (error) {
      setStatus({ tone: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const move = (position, step) => {
    const from = indices[position];
    const to = indices[position + step];
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    publish(next, `Reorder ${kind.noun}s on the home page`);
  };

  const remove = (index) => {
    const entry = items[index];
    if (!window.confirm(`Delete “${entry.title}”? It disappears from the site with the next build.`)) return;
    publish(
      items.filter((_, i) => i !== index),
      `Delete ${kind.noun}: ${entry.title}`
    );
  };

  if (editing) {
    return (
      <EntryForm
        kind={kind}
        editing={editing}
        setEditing={setEditing}
        busy={busy}
        status={status}
        onCancel={() => {
          setEditing(null);
          setStatus(null);
        }}
        onPublish={async () => {
          const { index, draft, files } = editing;
          // The form is locked from here on: what is sent is this draft, so
          // nothing typed meanwhile may be lost when the editor closes.
          setBusy(true);
          setStatus(null);
          // Only files the entry still points to; one whose link was removed
          // again is never sent.
          const text = JSON.stringify(draft);
          let payload;
          try {
            payload = await Promise.all(
              files.filter((f) => text.includes(f.url)).map(async (f) => ({ name: f.name, data: await toBase64(f.file) }))
            );
          } catch (error) {
            setStatus({ tone: 'error', text: error.message });
            setBusy(false);
            return;
          }
          const next = index === -1 ? [...items, draft] : items.map((entry, i) => (i === index ? draft : entry));
          const verb = index === -1 ? 'Add' : 'Update';
          publish(next, `${verb} ${kind.noun}: ${draft.title}`, () => setEditing(null), payload);
        }}
      />
    );
  }

  return (
    <>
      <div className="admin-toolbar">
        <button
          type="button"
          className="admin-button is-primary"
          onClick={() => {
            setStatus(null);
            setEditing({ index: -1, draft: kind.blank(), slugTouched: false, files: [] });
          }}
        >
          New {kind.noun}
        </button>
      </div>
      <Status status={status} />
      {indices.length === 0 ? (
        <p className="insight-lede">There is no {kind.noun} yet. Start with “New {kind.noun}”.</p>
      ) : (
        <ul className="admin-list">
          {indices.map((index, position) => {
            const entry = items[index];
            return (
              <li key={entry.slug || index}>
                <div className="admin-list-text">
                  <span className="admin-list-title">{entry.title}</span>
                  <span className="admin-list-meta">{kind.describe(entry)}</span>
                </div>
                <div className="admin-list-actions">
                  {!kind.byDate && (
                    <>
                      <button
                        type="button"
                        className="admin-button is-quiet"
                        disabled={busy || position === 0}
                        onClick={() => move(position, -1)}
                        aria-label={`Move “${entry.title}” up`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="admin-button is-quiet"
                        disabled={busy || position === indices.length - 1}
                        onClick={() => move(position, 1)}
                        aria-label={`Move “${entry.title}” down`}
                      >
                        ↓
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="admin-button"
                    disabled={busy}
                    onClick={() => {
                      setStatus(null);
                      setEditing({ index, draft: structuredClone(entry), slugTouched: true, files: [] });
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="admin-button is-danger" disabled={busy} onClick={() => remove(index)}>
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function Status({ status }) {
  return (
    <p className={`admin-status ${status ? `is-${status.tone}` : ''}`} role="status">
      {status?.text}
    </p>
  );
}

function EntryForm({ kind, editing, setEditing, busy, status, onCancel, onPublish }) {
  const { index, draft, files } = editing;

  // Local addresses of the picked files, so the preview can show them.
  const filesRef = useRef(files);
  filesRef.current = files;
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview)), []);
  const previews = Object.fromEntries(files.map((f) => [f.url, f.preview]));

  // Always builds on the latest draft, so a change that lands later (like an
  // inserted image) never undoes what was typed in between. `value` may be a
  // function of the field's current value.
  const change = (key, value) =>
    setEditing((current) => {
      const nextValue = typeof value === 'function' ? value(read(current.draft, key)) : value;
      let next = write(current.draft, key, nextValue);
      if (key === 'title' && !current.slugTouched) next = { ...next, slug: slugify(nextValue) };
      return { ...current, draft: next, slugTouched: current.slugTouched || key === 'slug' };
    });

  // Keeps a picked file in the browser until Publish; returns its future address.
  const stage = (file) => {
    const target = fileTarget(file.name);
    if (file.size > MAX_FILE_MB * 1024 * 1024) throw new Error(`${file.name} is larger than ${MAX_FILE_MB} MB.`);
    if (files.some((f) => f.url === target.url)) {
      throw new Error(`A file named ${target.name} is already added. Rename one of the two and add it again.`);
    }
    const staged = { ...target, file, preview: URL.createObjectURL(file) };
    setEditing((current) => ({ ...current, files: [...current.files, staged] }));
    return target.url;
  };

  return (
    <form
      className="admin-form"
      onSubmit={(event) => {
        event.preventDefault();
        onPublish();
      }}
    >
      <h2 className="admin-form-title">{index === -1 ? `New ${kind.noun}` : `Edit “${read(draft, 'title')}”`}</h2>
      <fieldset className="admin-fieldset" disabled={busy}>
        {kind.fields.map((field) => (
          <Field
            key={field.key}
            field={field}
            value={read(draft, field.key)}
            onChange={(v) => change(field.key, v)}
            stage={stage}
            previews={previews}
          />
        ))}
        <Status status={status} />
        <div className="admin-toolbar">
          <button type="submit" className="admin-button is-primary">
            {busy ? 'Publishing…' : 'Publish'}
          </button>
          <button type="button" className="admin-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </fieldset>
    </form>
  );
}

function Field({ field, value, onChange, stage, previews }) {
  const id = `field-${field.key}`;
  const hint = typeof field.hint === 'function' ? field.hint(value) : field.hint;
  const common = { id, value, required: !field.optional, onChange: (event) => onChange(event.target.value) };

  return (
    <div className="admin-field">
      <label htmlFor={id}>
        {field.label}
        {field.optional && <span className="admin-optional"> (optional)</span>}
      </label>
      {field.kind === 'textarea' && <textarea rows={3} {...common} />}
      {field.kind === 'markdown' && (
        <MarkdownField field={field} common={common} onChange={onChange} stage={stage} previews={previews} />
      )}
      {field.kind === 'date' && <input type="date" {...common} />}
      {field.kind === 'pdf' && <PdfField common={common} onChange={onChange} stage={stage} />}
      {!field.kind && (
        <input
          type="text"
          {...common}
          {...(field.key === 'slug' ? { pattern: '[a-z0-9]+(-[a-z0-9]+)*', title: 'a–z, 0–9 and single hyphens' } : {})}
        />
      )}
      {hint && <p className="admin-hint">{hint}</p>}
    </div>
  );
}

function useFilePicker(stage, onPicked) {
  const input = useRef(null);
  const [state, setState] = useState(null);

  const picker = (accept) => (
    <input
      ref={input}
      type="file"
      accept={accept}
      hidden
      onChange={(event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        try {
          onPicked(stage(file));
          setState({ tone: 'ok', text: `${file.name} is added and goes public when you publish.` });
        } catch (error) {
          setState({ tone: 'error', text: error.message });
        }
      }}
    />
  );

  return { open: () => input.current?.click(), picker, state };
}

function PdfField({ common, onChange, stage }) {
  const picker = useFilePicker(stage, onChange);
  return (
    <>
      <div className="admin-inline">
        <input type="text" {...common} />
        <button type="button" className="admin-button" onClick={picker.open}>
          Add PDF
        </button>
        {picker.picker('application/pdf')}
      </div>
      <Status status={picker.state} />
    </>
  );
}

function MarkdownField({ field, common, onChange, stage, previews }) {
  const [preview, setPreview] = useState(false);
  const area = useRef(null);
  const upload = useFilePicker(stage, (url) =>
    onChange((body) => {
      const at = area.current ? area.current.selectionStart : body.length;
      return `${body.slice(0, at)}![](${url})${body.slice(at)}`;
    })
  );

  return (
    <>
      <div className="admin-toolbar is-small">
        <button type="button" className="admin-button is-quiet" onClick={() => setPreview(!preview)}>
          {preview ? 'Edit text' : 'Show preview'}
        </button>
        {field.images && (
          <>
            <button type="button" className="admin-button is-quiet" onClick={upload.open}>
              Insert image
            </button>
            {upload.picker('image/png,image/jpeg,image/webp')}
          </>
        )}
      </div>
      {preview ? (
        <div className="admin-preview prose">
          <Markdown source={common.value} localImages={previews} />
        </div>
      ) : (
        <textarea ref={area} rows={16} className="is-markdown" {...common} />
      )}
      <p className="admin-hint">
        Markdown: a blank line starts a new paragraph, <code>## Heading</code>, <code>**bold**</code>,{' '}
        <code>[text](https://…)</code>.
      </p>
      {field.images && <p className="admin-hint">{PUBLIC_NOTE}</p>}
      <Status status={upload.state} />
    </>
  );
}
