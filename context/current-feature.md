# Current Feature

<!-- Feature Name -->

## Status

Completed

## Goals

<!-- Goals & requirements -->

## Notes

<!-- Any extra notes -->

## History

- Project setup and boilerplate cleanup
- Initial Next.js setup
- Dashboard Phase 1: ShadCN init, /dashboard route, dark mode layout, top bar with search and action buttons, sidebar/main placeholders, responsive fixes
- Dashboard Phase 2: Collapsible sidebar with item types + counts, favorite/recent collections, user avatar footer, mobile drawer, PanelLeft toggle, dashboard main content (collections grid, pinned items, recent items)
- Dashboard Phase 3: Stats cards (total items, collections, favorites), recent collections grid, pinned items list, 10 recent items list — all as SSR components
- Prisma 7 + Neon PostgreSQL: Schema with all data models (User, Item, ItemType, Collection, Tag) + NextAuth models, PrismaPg driver adapter, seed script, initial migration applied, db:test script