import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link,
} from 'lucide-react';

export const ITEM_TYPES = [
  { key: 'snippets', label: 'Snippets', icon: Code, color: '#3b82f6' },
  { key: 'prompts', label: 'Prompts', icon: Sparkles, color: '#8b5cf6' },
  { key: 'commands', label: 'Commands', icon: Terminal, color: '#f97316' },
  { key: 'notes', label: 'Notes', icon: StickyNote, color: '#fde047' },
  { key: 'files', label: 'Files', icon: File, color: '#6b7280', isPro: true },
  { key: 'images', label: 'Images', icon: Image, color: '#ec4899', isPro: true },
  { key: 'links', label: 'Links', icon: Link, color: '#10b981' },
] as const;

export type ItemTypeKey = (typeof ITEM_TYPES)[number]['key'];

