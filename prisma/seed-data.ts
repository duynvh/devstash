export const DEMO_USER = {
  email: "demo@devstash.io",
  name: "Demo User",
  rawPassword: "12345678",
  isPro: false,
};

export const SYSTEM_ITEM_TYPES = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "file", icon: "File", color: "#6b7280", isSystem: true },
  { name: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "link", icon: "Link", color: "#10b981", isSystem: true },
];

interface SeedItem {
  title: string;
  typeName: string;
  language?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  tags?: string[];
  content?: string;
  url?: string;
  description?: string;
}

export interface SeedCollection {
  name: string;
  description: string;
  defaultTypeName?: string;
  isFavorite?: boolean;
  items: SeedItem[];
}

const useDebounceContent = [
  "import { useState, useEffect } from 'react';",
  "",
  "export function useDebounce<T>(value: T, delay: number): T {",
  "  const [debouncedValue, setDebouncedValue] = useState<T>(value);",
  "  useEffect(() => {",
  "    const handler = setTimeout(() => setDebouncedValue(value), delay);",
  "    return () => clearTimeout(handler);",
  "  }, [value, delay]);",
  "  return debouncedValue;",
  "}",
].join("\n");

const contextProviderContent = [
  "import { createContext, useContext, useState, ReactNode } from 'react';",
  "",
  "interface ThemeContextType { theme: 'light' | 'dark'; toggle: () => void; }",
  "const ThemeContext = createContext<ThemeContextType | undefined>(undefined);",
  "",
  "export function ThemeProvider({ children }: { children: ReactNode }) {",
  "  const [theme, setTheme] = useState<'light' | 'dark'>('dark');",
  "  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');",
  "  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;",
  "}",
  "",
  "export const useTheme = () => {",
  "  const ctx = useContext(ThemeContext);",
  "  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');",
  "  return ctx;",
  "};",
].join("\n");

const arrayUtilsContent = [
  "export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {",
  "  return arr.reduce((acc, item) => {",
  "    const group = String(item[key]);",
  "    acc[group] = acc[group] || [];",
  "    acc[group].push(item);",
  "    return acc;",
  "  }, {} as Record<string, T[]>);",
  "}",
  "",
  "export function uniqueBy<T>(arr: T[], key: keyof T): T[] {",
  "  const seen = new Set();",
  "  return arr.filter(item => { const v = item[key]; if (seen.has(v)) return false; seen.add(v); return true; });",
  "}",
].join("\n");

const dockerfileContent = [
  "FROM node:20-alpine AS base",
  "RUN corepack enable",
  "FROM base AS deps",
  "WORKDIR /app",
  "COPY package.json pnpm-lock.yaml ./",
  "RUN pnpm install --frozen-lockfile",
  "FROM base AS build",
  "WORKDIR /app",
  "COPY --from=deps /app/node_modules ./node_modules",
  "COPY . .",
  "RUN pnpm build",
  "FROM base AS runner",
  "WORKDIR /app",
  "ENV NODE_ENV=production",
  "COPY --from=build /app/.next/standalone ./",
  "COPY --from=build /app/.next/static ./.next/static",
  "COPY --from=build /app/public ./public",
  "EXPOSE 3000",
  'CMD ["node", "server.js"]',
].join("\n");

export const COLLECTIONS: SeedCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    defaultTypeName: "snippet",
    items: [
      { title: "useDebounce Hook", typeName: "snippet", language: "typescript", isPinned: true, isFavorite: true, tags: ["react", "hooks", "typescript"], content: useDebounceContent },
      { title: "Context Provider Pattern", typeName: "snippet", language: "typescript", tags: ["react", "context", "patterns"], content: contextProviderContent },
      { title: "Array Utility Functions", typeName: "snippet", language: "typescript", tags: ["typescript", "utils"], content: arrayUtilsContent },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    defaultTypeName: "prompt",
    isFavorite: true,
    items: [
      { title: "Code Review Prompt", typeName: "prompt", isPinned: true, tags: ["ai", "code-review"], content: "Review this code for:\n1. Correctness — logic errors, edge cases\n2. Performance — unnecessary allocations, O(n²) traps\n3. Security — injection, XSS, secrets in source\n4. Readability — naming, dead code, excessive nesting\n5. Testing — untested paths, fragile assertions\n\nFor each issue provide: severity (critical/warning/nit), location, and a suggested fix." },
      { title: "Documentation Generator", typeName: "prompt", tags: ["ai", "documentation"], content: "Generate comprehensive documentation for the following code.\nInclude:\n- Overview — one-paragraph summary of purpose\n- API Reference — exported functions/classes with params, return types, examples\n- Usage Examples — at least two realistic scenarios\n- Error Handling — thrown exceptions and how callers should handle them\n\nOutput as Markdown." },
      { title: "Refactoring Assistant", typeName: "prompt", tags: ["ai", "refactoring"], content: "Analyze this code and suggest refactoring improvements.\nFocus on:\n- Extracting reusable functions or components\n- Reducing cyclomatic complexity\n- Applying SOLID principles\n- Improving type safety\n\nFor each suggestion, show the before/after code and explain the benefit." },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    items: [
      { title: "Multi-stage Dockerfile", typeName: "snippet", language: "dockerfile", tags: ["docker", "ci-cd"], content: dockerfileContent },
      { title: "Deploy to Production", typeName: "command", tags: ["deploy", "ci-cd"], content: "#!/bin/bash\nset -euo pipefail\necho 'Building image...'\ndocker build -t app:latest .\necho 'Pushing to registry...'\ndocker push registry.example.com/app:latest\necho 'Rolling update...'\nkubectl rollout restart deployment/app -n production\nkubectl rollout status deployment/app -n production" },
      { title: "Kubernetes Documentation", typeName: "link", tags: ["kubernetes", "docs"], url: "https://kubernetes.io/docs/home/", description: "Official Kubernetes documentation and reference guides" },
      { title: "GitHub Actions Docs", typeName: "link", tags: ["github", "ci-cd"], url: "https://docs.github.com/en/actions", description: "GitHub Actions documentation for CI/CD pipelines" },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    defaultTypeName: "command",
    items: [
      { title: "Git Interactive Rebase", typeName: "command", isPinned: true, tags: ["git"], content: "git rebase -i HEAD~5\n# Commands: pick, reword, edit, squash, fixup, drop\n# Useful for cleaning up commit history before PR" },
      { title: "Docker Cleanup", typeName: "command", tags: ["docker"], content: "docker system prune -af --volumes\ndocker image prune -af\ndocker container prune -f\ndocker network prune -f" },
      { title: "Find & Kill Process by Port", typeName: "command", tags: ["process", "networking"], content: "# macOS / Linux\nlsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9\n\n# Windows\nnetstat -ano | findstr :3000\ntaskkill /PID <pid> /F" },
      { title: "npm Dependency Audit & Update", typeName: "command", tags: ["npm", "packages"], content: "npm outdated\nnpx npm-check-updates -u\nnpm audit fix --force\nnpm ls --depth=0" },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    isFavorite: true,
    items: [
      { title: "Tailwind CSS Documentation", typeName: "link", tags: ["css", "tailwind"], url: "https://tailwindcss.com/docs", description: "Utility-first CSS framework documentation and examples" },
      { title: "shadcn/ui Components", typeName: "link", isPinned: true, tags: ["components", "react"], url: "https://ui.shadcn.com", description: "Beautifully designed, accessible component library for React" },
      { title: "Vercel Design System", typeName: "link", tags: ["design-system"], url: "https://vercel.com/geist/introduction", description: "Vercel's Geist design system — clean, minimal, modern" },
      { title: "Lucide Icons", typeName: "link", tags: ["icons"], url: "https://lucide.dev/icons", description: "Beautiful, consistent open-source icon set used by shadcn/ui" },
    ],
  },
];
