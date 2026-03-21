# Current Feature: Auth Phase 3 — Sign In, Register & Sign Out UI

## Status

In Progress

## Goals

- Replace NextAuth default pages with custom `/sign-in` and `/register` pages
- Sign-in page: email/password fields + GitHub OAuth button + link to register + validation/error display
- Register page: name, email, password, confirm password fields + validation + submit to `/api/auth/register` + redirect to sign-in on success
- Bottom of sidebar: user avatar (GitHub image or initials fallback) + user name + dropdown on click with "Sign out" + clicking icon goes to `/profile`
- Reusable avatar component handling both image and initials cases

## Notes

- Avatar logic: use `image` field if present (GitHub), otherwise generate initials from name (e.g. "Brad Traversy" → "BT")
- Custom pages must replace NextAuth defaults — configure `pages` option in NextAuth config
- Register page submits to existing `/api/auth/register` POST route (from Phase 2)
- Sidebar user section replaces the current placeholder footer

### Testing Checklist

1. `/sign-in` renders custom page
2. GitHub OAuth flow works
3. Email/password sign-in works
4. Avatar shows in sidebar (GitHub image or initials)
5. Clicking avatar opens dropdown
6. "Sign out" logs out and redirects
7. `/register` — create account and verify redirect to sign-in

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