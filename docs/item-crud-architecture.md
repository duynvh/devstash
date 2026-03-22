# Item CRUD Architecture

## 1. File Structure

A unified CRUD system manages all 7 item types using a shared set of routes, actions, and database queries. This approach ensures maximum reusability and minimizes boilerplate across DevStash.

```text
devstash/src/
├── app/
│   └── (dashboard)/
│       └── items/
│           └── [type]/
│               └── page.tsx           # Dynamic route for all item types
├── lib/
│   ├── db/
│   │   └── items.ts                   # Server-only Prisma data fetching
│   └── actions/
│       └── item-actions.ts            # Next.js Server Actions for mutations
├── components/
│   └── items/
│       ├── ItemList.tsx               # Shared container for rendering items
│       ├── ItemCard.tsx               # Generic wrapper that delegates to type-specific views
│       ├── ItemForm.tsx               # Shared form for creating/updating
│       └── views/                     # Type-specific display/form logic
│           ├── CodeView.tsx           # Used by Snippets, Commands
│           ├── ImageView.tsx          # Used by Images
│           ├── FileView.tsx           # Used by Files
│           ├── TextView.tsx           # Used by Notes, Prompts
│           └── LinkView.tsx           # Used by Links
```

## 2. Routing (`/items/[type]`)

Instead of creating seven distinct manual routes (e.g., `/items/snippets`, `/items/prompts`), DevStash uses a single dynamic Next.js App Router path: `src/app/(dashboard)/items/[type]/page.tsx`.

**How it works:**
1. The `[type]` URL parameter is captured (e.g., `snippets`, `files`, `prompts`).
2. The React Server Component validates if the `[type]` parameter maps to a system type (checking against `ITEM_TYPES` in `src/lib/constants/item-types.ts`).
3. If the type is invalid, the router returns a 404 or redirects to a fallback page.
4. If valid, the Server Component calls the data fetching layer (`lib/db/items.ts`) to fetch records specifically matching that `[type]` for the authenticated user.
5. The successfully fetched data is passed downward to the generic `<ItemList>` client component.

## 3. Data Fetching (`lib/db/items.ts`)

Data queries are executed directly within React Server Components (RSC). This bypasses traditional client-side fetching overhead (`useEffect` + `/api` routes) to optimize performance.

**Key responsibilities**:
- `getItemsByType(userId, typeString)` - Queries the `items` table including associated tags, collections, and the `itemType`. Filters by `itemType.name`.
- `getItemById(userId, itemId)` - Retrieves a single item, agnostic of its type.
- These functions handle server-side filtering, sorting, and pagination.
- *Strictly server-side:* Uses the authenticated user's session to ensure strict data ownership constraints.

## 4. Mutations (`lib/actions/item-actions.ts`)

All database writes (Create, Update, Delete) are centralized in a single Server Actions file. Because the Prisma `Item` model (and the `items` Postgres table) is designed to store the complete superset of all possible fields for any content type, a single set of generic mutations is possible.

**Key operations**:
- `createItem(payload)`: Receives a validated payload containing title, optional text content, URLs, or file metadata. Nullifies the properties that don't pertain to the type being saved.
- `updateItem(itemId, payload)`: Handles partial patch updates to any item constraint.
- `deleteItem(itemId)`: Executes cascading deletes (e.g. cleaning up the `item_collections` relation).

*Note: Actions do not care about type-specific logic. They rely on Zod schemas mapped to the generic `Item` model to validate the input structure, and then invoke Prisma.*

## 5. Component Responsibilities & Type-Specific Logic

While routing, fetching, and actions are kept entirely generic, the **UI components** hold the specific logic that differentiates a Command from an Image. 

**Type-specific logic always lives in the presentation layer (components), not the controller layer (actions).**

- **`ItemCard.tsx`**: A generic wrapper component. It is responsible for rendering the standard DevStash header (title, actions) and footer (tags, collections, dates). Inside its body, it dynamically mounts a sub-component based on the `contentType` or `itemType` fields:
  - `TEXT` types (Snippets, Commands) mount syntax-highlighted viewers (`<CodeView />`). Notes and Prompts display markdown `<TextView />`.
  - `FILE` / `IMAGE` types mount `<ImageView />` or `<FileView />` containing file sizes, names, and download logic.
  - `URL` types mount an interactive `<LinkView />`.
  
- **`ItemForm.tsx`**: A versatile, dynamic form. It maintains state regarding what "Type" the user is currently trying to create. If the user selects "Snippet", the form conditionally mounts a code editor area. If they select "Link", it replaces the editor with a simple URL input. Upon submission, the form serializes the active inputs and passes them cleanly to the genetic mutations in `item-actions.ts`.
