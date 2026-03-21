# Current Feature: Forgot Password

## Status

In Progress

## Goals

- Add a "Forgot password?" link on the sign-in page that navigates to `/forgot-password`
- Create `/forgot-password` page with email input form — sends a password reset email using Resend
- Reuse the existing `VerificationToken` model to store password reset tokens (with `identifier` = email)
- Create `/reset-password` page that accepts a token from the email link, lets users set a new password
- Create `POST /api/auth/forgot-password` route — validates email exists, creates reset token, sends email
- Create `POST /api/auth/reset-password` route — validates token, updates password hash, deletes token
- Respect the `EMAIL_VERIFICATION_ENABLED` toggle — if disabled, skip the forgot password flow gracefully
- Handle edge cases: expired tokens, invalid tokens, non-existent emails (show generic message for security)

## Notes

- Reuse `createVerificationToken` from `src/lib/email/verification.ts` for token generation
- Add a new `sendPasswordResetEmail` function in `src/lib/email/password-reset.ts`
- Password reset tokens should expire in 1 hour (shorter than 24h verification tokens)
- For security: always show a generic success message regardless of whether email exists
- New pages follow the existing `(auth)` layout
- New password requires minimum 8 characters + confirmation field (same as register)

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