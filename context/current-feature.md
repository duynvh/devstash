# Current Feature: Email Verification on Register

## Status

In Progress

## Goals

- When a new user registers with email/password, send a verification email via Resend
- Email contains a one-time secure link (`/api/auth/verify-email?token=...`)
- Clicking the link verifies the user's email (sets `emailVerified` in DB) and redirects to `/dashboard`
- Unverified users who try to sign in with credentials are blocked with a clear error message
- Verification tokens are stored in the existing `VerificationToken` Prisma model and expire after 24 hours
- Resend is used for sending emails using the `RESEND_API_KEY` from `.env`

## Notes

- The `User` model already has `emailVerified DateTime?` — no schema change needed
- The `VerificationToken` model already exists (`identifier`, `token`, `expires`) — use it
- GitHub OAuth users skip this flow entirely (they are verified by OAuth)
- Only credentials-based registrations trigger the verification email
- Token generation: use `crypto.randomUUID()` or `crypto.randomBytes` — no extra libraries
- The register API (`/api/auth/register`) currently creates the user and returns success — extend it to also send the email
- New API route needed: `GET /api/auth/verify-email?token=...` to handle link clicks
- The sign-in flow in `authorizeCredentials` must block users where `emailVerified` is null
- Show an appropriate error on the sign-in page for unverified accounts
- Resend package: `resend` (install if not present)
- Email "from" address: use `onboarding@resend.dev` for dev or configure a real domain sender

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