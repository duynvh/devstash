# Current Feature

## Status

Complete

## Goals

Fix the quick-win issues identified by the code scanner. No auth changes, no UI changes — pure refactoring and data hygiene.

1. **N+1 Query Fix** — `getRecentCollections` and `getSidebarCollections` eager-load all items + itemType relations per collection just to compute `dominantColor` and `itemCount`. Add `_count` for accurate item totals and cap nested `items` include with a `take` limit for color computation only.
2. **Unbounded `getPinnedItems`** — No `take` limit on pinned items query. Add `limit = 10` default parameter.
3. **Centralize `DEMO_USER_EMAIL`** — The same constant is duplicated in `layout.tsx` and `dashboard/page.tsx`. Extract to `src/lib/constants/demo.ts`.
4. **Shared `getItemTypeIcon` utility** — Icon lookup logic is duplicated between `ItemRow.tsx` and `RecentCollections.tsx` with slightly different implementations. Extract to `src/lib/constants/item-types.ts`.
5. **Remove dead mock data** — `mockCollections`, `mockItems`, `mockItemTypes`, `mockItemTypeCounts` in `mock-data.ts` have zero consumers. Delete unused exports (only `mockUser` is active).

## Notes

- Authentication is NOT in scope — `DEMO_USER_EMAIL` stays as the data source, just deduplicated
- No schema changes or migrations needed
- All changes are pure refactors — behaviour and output are identical

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