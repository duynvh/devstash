# Current Feature

## Status

Not Started

## Goals

## Notes

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