'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateItem } from '@/actions/items';
import type { ItemDetail } from '@/lib/db/items';

const CONTENT_TYPES = ['snippet', 'prompt', 'command', 'note'];
const LANGUAGE_TYPES = ['snippet', 'command'];
const URL_TYPES = ['link'];

interface Props {
  item: ItemDetail;
  onCancel: () => void;
  onSaved: (updated: ItemDetail) => void;
}

export default function ItemDrawerEditForm({ item, onCancel, onSaved }: Props) {
  const router = useRouter();
  const typeName = item.itemType.name.toLowerCase();

  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? '');
  const [content, setContent] = useState(item.content ?? '');
  const [language, setLanguage] = useState(item.language ?? '');
  const [url, setUrl] = useState(item.url ?? '');
  const [tags, setTags] = useState(item.tags.map((t) => t.name).join(', '));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const result = await updateItem(item.id, {
      title,
      description: description || null,
      content: content || null,
      url: url || null,
      language: language || null,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setSaving(false);

    if (!result.success) {
      setError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success('Item updated');
    router.refresh();
    onSaved(result.data);
  }

  return (
    <div className="px-5 py-4 space-y-4 flex-1">
      <Field label="Title">
        <input
          id="edit-title"
          className="input-base"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>

      <Field label="Description">
        <textarea
          id="edit-description"
          className="input-base resize-none"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>

      {CONTENT_TYPES.includes(typeName) && (
        <Field label="Content">
          <textarea
            id="edit-content"
            className="input-base resize-none font-mono text-xs"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Field>
      )}

      {LANGUAGE_TYPES.includes(typeName) && (
        <Field label="Language">
          <input
            id="edit-language"
            className="input-base"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </Field>
      )}

      {URL_TYPES.includes(typeName) && (
        <Field label="URL">
          <input
            id="edit-url"
            type="url"
            className="input-base"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </Field>
      )}

      <Field label="Tags" hint="comma-separated">
        <input
          id="edit-tags"
          className="input-base"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </Field>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <button
          id="edit-save"
          onClick={handleSave}
          disabled={!title.trim() || saving}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground disabled:opacity-50 transition-opacity"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          id="edit-cancel"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </label>
        {hint && <span className="text-xs text-muted-foreground/60">({hint})</span>}
      </div>
      {children}
    </div>
  );
}
