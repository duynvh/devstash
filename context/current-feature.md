# Current Feature: Auth Phase 2 - Email/Password Provider

## Status

In Progress

## Goals

- Add Credentials provider to `auth.config.ts` (placeholder) and `auth.ts` (bcrypt validation)
- Add `password` field to User model via migration if not already present
- Create `/api/auth/register` POST route (name, email, password, confirmPassword)
- Registration validates matching passwords, checks for duplicate users, hashes with bcryptjs, creates user
- Email/password sign-in works and redirects to `/dashboard`
- GitHub OAuth continues to work alongside credentials auth

## Notes

- bcryptjs is already installed
- Follow the split auth pattern: `auth.config.ts` gets `authorize: () => null` placeholder; `auth.ts` overrides with real bcrypt validation
- Reference: https://authjs.dev/getting-started/authentication/credentials
- Testing: use curl to POST to `/api/auth/register`, then sign in via `/api/auth/signin`

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