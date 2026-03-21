# Current Feature: Auth Setup - NextAuth + GitHub Provider

## Status

In Progress

## Goals

- Install `next-auth@beta` and `@auth/prisma-adapter`
- Set up the split auth config pattern for edge compatibility (`auth.config.ts` + `auth.ts`)
- Add GitHub OAuth provider
- Protect `/dashboard/*` routes via `src/proxy.ts` with redirect to sign-in for unauthenticated users
- Export route handlers from `src/app/api/auth/[...nextauth]/route.ts`
- Extend the `Session` type with `user.id` via `src/types/next-auth.d.ts`
- Verify end-to-end: `/dashboard` redirects → GitHub sign-in → redirects back

## Notes

- Use `next-auth@beta` — NOT `@latest` (that installs v4)
- Proxy file must be at `src/proxy.ts` (same level as `app/`), named export only: `export const proxy = auth(...)`
- Use `session: { strategy: 'jwt' }` with the split config pattern
- Do NOT set custom `pages.signIn` — use NextAuth's default page
- Use Context7 to verify the newest config and conventions before implementing
- Env vars needed: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
- References:
  - Edge compatibility: https://authjs.dev/getting-started/installation#edge-compatibility
  - Prisma adapter: https://authjs.dev/getting-started/adapters/prisma

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