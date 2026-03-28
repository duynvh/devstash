'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const MAX_HEIGHT = 400;

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  readonly = false,
  placeholder = 'Write markdown…',
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>(readonly ? 'preview' : 'write');
  const [copied, setCopied] = useState(false);

  const lineCount = value ? value.split('\n').length : 1;
  const computedHeight = Math.min(Math.max(lineCount * 21 + 24, 120), MAX_HEIGHT);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-[#2d2d2d]">
        <div className="flex items-center gap-1">
          {!readonly && (
            <>
              <TabButton active={tab === 'write'} onClick={() => setTab('write')}>
                Write
              </TabButton>
              <TabButton active={tab === 'preview'} onClick={() => setTab('preview')}>
                Preview
              </TabButton>
            </>
          )}
          {readonly && (
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              Markdown
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          title="Copy to clipboard"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied
            ? <Check className="size-3.5 text-green-500" />
            : <Copy className="size-3.5" />
          }
        </button>
      </div>

      {tab === 'write' && !readonly && (
        <textarea
          className="w-full bg-transparent text-sm text-foreground font-mono px-4 py-3 resize-none focus:outline-none placeholder:text-muted-foreground"
          style={{ height: computedHeight, maxHeight: MAX_HEIGHT }}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
        />
      )}

      {(tab === 'preview' || readonly) && (
        <div
          className="markdown-preview px-4 py-3 overflow-y-auto"
          style={{ height: computedHeight, maxHeight: MAX_HEIGHT }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-sm text-muted-foreground italic">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
        active
          ? 'bg-muted text-foreground font-medium'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}
