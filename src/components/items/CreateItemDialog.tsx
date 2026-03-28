'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { createItem } from '@/actions/items';
import CodeEditor from './CodeEditor';
import MarkdownEditor from './MarkdownEditor';

const TYPES = [
  { value: 'snippet', label: 'Snippet' },
  { value: 'prompt', label: 'Prompt' },
  { value: 'command', label: 'Command' },
  { value: 'note', label: 'Note' },
  { value: 'link', label: 'Link' },
] as const;

type TypeValue = (typeof TYPES)[number]['value'];

const CONTENT_TYPES: TypeValue[] = ['snippet', 'prompt', 'command', 'note'];
const CODE_EDITOR_TYPES: TypeValue[] = ['snippet', 'command'];
const MARKDOWN_EDITOR_TYPES: TypeValue[] = ['note', 'prompt'];

export default function CreateItemDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typeName, setTypeName] = useState<TypeValue>('snippet');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setTypeName('snippet');
    setTitle('');
    setDescription('');
    setContent('');
    setLanguage('');
    setUrl('');
    setTags('');
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const result = await createItem({ typeName, title, description, content, url, language, tags });

    setSaving(false);

    if (!result.success) {
      setError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success('Item created');
    router.refresh();
    setOpen(false);
    resetForm();
  }

  return (
    <>
      <Button id="new-item-btn" size="sm" className="gap-1" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        <span className="hidden sm:inline">New Item</span>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Item</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <Field label="Type">
              <select
                id="create-type"
                className="input-base"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value as TypeValue)}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Title">
              <input
                id="create-title"
                className="input-base"
                placeholder="Enter a title…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Field>

            <Field label="Description">
              <textarea
                id="create-description"
                className="input-base resize-none"
                rows={2}
                placeholder="Optional description…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            {CONTENT_TYPES.includes(typeName) && (
              <Field label="Content">
                {CODE_EDITOR_TYPES.includes(typeName) ? (
                  <CodeEditor
                    value={content}
                    onChange={setContent}
                    language={language || 'plaintext'}
                  />
                ) : MARKDOWN_EDITOR_TYPES.includes(typeName) ? (
                  <MarkdownEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write markdown…"
                  />
                ) : (
                  <textarea
                    id="create-content"
                    className="input-base resize-none"
                    rows={5}
                    placeholder="Paste your content…"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                )}
              </Field>
            )}

            {CODE_EDITOR_TYPES.includes(typeName) && (
              <Field label="Language">
                <input
                  id="create-language"
                  className="input-base"
                  placeholder="e.g. typescript, bash"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
              </Field>
            )}

            {typeName === 'link' && (
              <Field label="URL">
                <input
                  id="create-url"
                  type="url"
                  className="input-base"
                  placeholder="https://…"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </Field>
            )}

            <Field label="Tags" hint="comma-separated">
              <input
                id="create-tags"
                className="input-base"
                placeholder="react, hooks, auth"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </Field>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                id="create-item-submit"
                type="submit"
                size="sm"
                disabled={!title.trim() || saving}
              >
                {saving ? 'Creating…' : 'Create Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
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
