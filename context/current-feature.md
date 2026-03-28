# Current Feature: Markdown Editor

### Status

Complete

## Goals

- Create `MarkdownEditor` component with Write/Preview tabbed interface
- Replace `Textarea` with `MarkdownEditor` for **note** and **prompt** types only (no changes to snippet/command)
- Support both **readonly** mode (Preview tab only) and **edit** mode (Write tab default + Preview tab)
- Use `react-markdown` with `remark-gfm` for GitHub Flavored Markdown rendering
- Add copy button in header, matching `CodeEditor` style
- Apply consistent dark theme (`bg-[#1e1e1e]` container, `bg-[#2d2d2d]` header)
- Fluid height with max 400px, matching `CodeEditor` behavior
- Integrate into `NewItemDialog`, `ItemDrawer` edit mode, and `ItemDrawer` view mode for note/prompt types

## Notes

- Keep `CodeEditor` (Monaco) for snippet and command types — no changes there
- Use a custom CSS class (`.markdown-preview`) for reliable dark mode styling of rendered markdown
- Styled markdown elements required: headings (h1–h6), code blocks, inline code, lists, blockquotes, links, tables
- Integration points: `NewItemDialog` content field, `ItemDrawerEditForm` content field, `ItemDrawer` view content field


## History

- Project setup and boilerplate cleanup
- Initial Next.js setup
- Dashboard Phase 1: ShadCN init, /dashboard route, dark mode layout, top bar with search and action buttons, sidebar/main placeholders, responsive fixes
- Dashboard Phase 2: Collapsible sidebar with item types + counts, favorite/recent collections, user avatar footer, mobile drawer, PanelLeft toggle, dashboard main content (collections grid, pinned items, recent items)
- Dashboard Phase 3: Stats cards (total items, collections, favorites), recent collections grid, pinned items list, 10 recent items list — all as SSR components
- Prisma 7 + Neon PostgreSQL: Schema with all data models (User, Item, ItemType, Collection, Tag) + NextAuth models, PrismaPg driver adapter, seed script, initial migration applied, db:test script
- Seed data: Demo user (demo@devstash.io), 7 system item types, 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources) with 18 items, 26 tags, bcryptjs password hashing, test-db verification script
- Dashboard Collections: src/lib/db/collections.ts with Prisma data fetching, RecentCollections updated with dominant-color borders + per-type icons, dashboard page converted to async SSR with real DB data for collections and stats
- Dashboard Items: src/lib/db/items.ts with getPinnedItems/getRecentItems, ItemRow updated to use real itemType data with tag pills, dashboard page replaced mock items with real DB fetches
- Stats & Sidebar: Real item type counts in sidebar via getItemTypeCounts, real sidebar collections (favorites + recents with dominant color dot) via getSidebarCollections, "View all collections →" link added, layout refactored to server component for SSR data fetching
- Code Scan Quick Wins: N+1 fix in getRecentCollections/getSidebarCollections (_count + take limits), unbounded getPinnedItems capped at 10, DEMO_USER_EMAIL centralized to src/lib/constants/demo.ts, shared getItemTypeIcon utility extracted to item-types.ts (removed duplicate logic from ItemRow + RecentCollections), dead mock exports removed from mock-data.ts
- Auth Phase 1: NextAuth v5 (next-auth@beta) + GitHub OAuth — split auth config pattern (auth.config.ts edge-safe + auth.ts with Prisma adapter + JWT), route handlers at /api/auth/[...nextauth], proxy at src/proxy.ts protecting /dashboard/*, Session extended with user.id
- Auth Phase 2: Credentials provider (email/password) — auth.config.ts placeholder, auth.ts with bcrypt validation via authorizeCredentials helper, /api/auth/register POST route, Vitest setup with 11 unit tests (register route + authorize logic)
- Auth Phase 3: Custom /sign-in page (email/password + GitHub OAuth), custom /register page (name/email/password/confirm + validation), reusable UserAvatar component (image or initials fallback), SidebarUser dropdown (profile link + sign-out), real session user wired into dashboard layout and sidebar
- Email Verification on Register: Resend integration (src/lib/email/) for verification emails, GET /api/auth/verify-email route validates token and sets emailVerified, credentials sign-in blocked for unverified users with user-friendly error, sign-in page handles token error URL params, register success message updated to prompt email check, scripts/delete-all-users.ts added with confirmation prompt
- Email Verification Toggle: EMAIL_VERIFICATION_ENABLED env variable (defaults true), when false skips sending verification email, auto-sets emailVerified on register, bypasses verification check on sign-in, registration success message adapts ("check your email" vs "you can now sign in"), centralized flag in src/lib/constants/auth.ts, 12 tests passing
- Forgot Password: "Forgot password?" link on sign-in page, /forgot-password page with email form, /reset-password page with token-based new password form, POST /api/auth/forgot-password and POST /api/auth/reset-password routes, reuses VerificationToken model with 1-hour expiry, sendPasswordResetEmail via Resend, generic success messages for security, createVerificationToken refactored with configurable expiry, reset=success message on sign-in page
- Profile Page: /profile route (auth-protected via proxy matcher), ProfileHeader with avatar (GitHub image or initials fallback) + name + email + join date, ProfileStats with total items/collections + per-type breakdown using getItemTypeIcon, ChangePasswordForm (email/password users only via hasPassword flag) with bcrypt validation, DeleteAccountSection with inline confirmation + cascading Prisma delete + sign-out, server actions in src/actions/profile.ts, data fetching in src/lib/db/profile.ts
- Rate Limiting for Auth: Upstash Redis + @upstash/ratelimit sliding-window rate limits on 5 auth endpoints (login 5/15m IP+email, register 3/1h IP, forgot-password 3/1h IP, reset-password 5/15m IP, resend-verification 3/15m IP+email), reusable src/lib/rate-limit.ts utility (fail-open), 429 responses with Retry-After header, new POST /api/auth/resend-verification route, fixed proxy.ts default export for Next.js 16 middleware
- GitHub OAuth Redirect Fix: Switched to server-side `signIn` server action, removed client-side `next-auth/react` signIn to fix unreliable redirect behavior
- Items List View: Dynamic /items/[type] route (SSR server component) with getItemsByType Prisma query, ItemCard component with left border colored by item type, responsive 1→2 col grid, empty state per type, /items/:path* added to proxy matcher, fixed react-hooks/static-components lint in ItemCard + ItemRow
- Items List View — Three Column Layout: Changed item listing grid from 2 to 3 columns on lg+ screens (grid-cols-1 md:grid-cols-2 lg:grid-cols-3), widened container from max-w-5xl to max-w-7xl for comfortable fit
- Item Drawer: Right-side Sheet drawer opens on ItemCard/ItemRow click on both dashboard and items list pages; GET /api/items/[id] route fetches full detail with auth check; ItemDetail interface with collections, tags, language, URL, file metadata; DashboardItems + ItemsWithDrawer client wrappers manage drawer state; action bar (Favorite, Pin, Copy, Edit, Delete); skeleton loading state; shadcn Sheet + Skeleton installed; 6 unit tests for API route (401, 404, auth fallback, happy path, correct args)
- Item Drawer Edit Mode: Inline edit mode toggled by pencil button; ItemDrawerEditForm component with controlled inputs for Title, Description, Content (snippet/prompt/command/note), Language (snippet/command), URL (link), Tags; updateItem server action in src/actions/items.ts with Zod validation and { success, data, error } pattern; updateItem DB query in lib/db/items.ts with tag disconnect + connect-or-create; sonner toast on save/error; router.refresh() post-save; Save disabled when title empty; 8 unit tests (auth guard, Zod validation, DB error, happy path, correct args)
- Delete Item: shadcn AlertDialog confirmation triggered from Delete button in ItemDrawer; deleteItem server action in src/actions/items.ts (auth-guarded, { success, data, error } pattern); deleteItem DB query in src/lib/db/items.ts (userId-scoped Prisma delete); sonner toast on success/error; drawer closes + router.refresh() post-delete; shadcn alert-dialog component installed; 3 unit tests (auth guard, DB error, happy path)
- Item Create: shadcn Dialog modal from "New Item" button in TopBar; type selector (snippet, prompt, command, note, link); dynamic fields per type (title/description/tags for all; content+language for snippet/command; content for prompt/note; URL for link); createItem server action with Zod validation and { success, data, error } pattern; createItem DB query in lib/db/items.ts with tag connect-or-create; shadcn Dialog + Select installed; sonner toast on success; modal closes + router.refresh() post-create
- Code Editor: Monaco Editor (`@monaco-editor/react`) CodeEditor component for snippet and command types; macOS-style window dots (red/yellow/green) in editor header; copy button with clipboard toast + checkmark feedback; language label in header; readonly and edit modes; fluid height computed from line count (max 400px); custom dark theme with themed scrollbar; CDN loader to avoid Turbopack worker bundling issues; replaces textarea in ItemDrawer view, ItemDrawerEditForm, and CreateItemDialog for snippet/command only — note/prompt/link keep plain textarea
- Markdown Editor: `react-markdown` + `remark-gfm` MarkdownEditor component for note and prompt types; Write/Preview tabbed interface; dark theme with `.markdown-preview` styling class matching core UI rules; copy button in header; fluid height computed from line count (max 400px); integration into CreateItemDialog, ItemDrawerEditForm, and ItemDrawer view (readonly mode); disabled Next.js Turbopack infinite refresh bug associated with pure ESM files using `transpilePackages` in next config