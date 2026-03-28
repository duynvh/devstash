'use client';

import { useRef, useState } from 'react';
import Editor, { loader, type OnMount } from '@monaco-editor/react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { editor } from 'monaco-editor';

loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' } });

const LINE_HEIGHT = 19;
const PADDING = 24;
const MAX_HEIGHT = 400;

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readonly?: boolean;
}

export default function CodeEditor({ value, onChange, language = 'plaintext', readonly = false }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const lineCount = value.split('\n').length;
  const height = Math.min(lineCount * LINE_HEIGHT + PADDING, MAX_HEIGHT);

  const handleMount: OnMount = (ed, monaco) => {
    editorRef.current = ed;

    ed.updateOptions({
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 6,
        horizontalScrollbarSize: 6,
        useShadows: false,
        alwaysConsumeMouseWheel: false,
      },
    });

    monaco.editor.defineTheme('devstash-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0d0d0f',
        'editor.lineHighlightBackground': '#ffffff08',
        'editorLineNumber.foreground': '#3f3f46',
        'editorLineNumber.activeForeground': '#71717a',
        'scrollbar.shadow': '#00000000',
        'scrollbarSlider.background': '#3f3f4666',
        'scrollbarSlider.hoverBackground': '#52525b99',
        'scrollbarSlider.activeBackground': '#71717a99',
      },
    });

    monaco.editor.setTheme('devstash-dark');
  };

  async function handleCopy() {
    const text = editorRef.current?.getValue() ?? value;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-[#111113]">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>

        <div className="flex items-center gap-3">
          {language && language !== 'plaintext' && (
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
              {language}
            </span>
          )}
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
      </div>

      <Editor
        value={value}
        language={language}
        height={height}
        onChange={(v) => onChange?.(v ?? '')}
        onMount={handleMount}
        options={{
          readOnly: readonly,
          minimap: { enabled: false },
          fontSize: 12,
          lineHeight: LINE_HEIGHT,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: readonly ? 'none' : 'line',
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          folding: false,
          contextmenu: false,
          lineDecorationsWidth: 0,
          automaticLayout: true,
          fixedOverflowWidgets: true,
        }}
        theme="devstash-dark"
      />
    </div>
  );
}
