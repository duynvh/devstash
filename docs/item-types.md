# DevStash Item Types

DevStash supports 7 distinct item types that belong to three core content classifications: Text, File, and URL. This document details each item type, their properties, and how they differ from one another.

## Core Content Classifications

The `Item` model uses the `ContentType` enum (`TEXT`, `FILE`, `URL`) to determine which fields are relevant for a given item:

### 1. TEXT Types (Snippet, Prompt, Command, Note)
Text types are used for textual content and generally rely on the `content` field (stored as an application `TEXT` column in Postgres).
- **Key Fields**: `content`, `language` (for syntax highlighting in snippets/commands).
- **Display**: Markdown editors/viewers, syntax highlighted code blocks.

### 2. FILE Types (File, Image)
File types are used for binary or external file references, specifically integrated with cloud storage (Cloudflare R2). These are Pro-tier features.
- **Key Fields**: `fileUrl`, `fileName`, `fileSize`, `description`
- **Display**: File attachments, download links, rich image previews for images.

### 3. URL Types (Link)
URL types are designed to bookmark web addresses.
- **Key Fields**: `url`, `description`
- **Display**: Clickable external links accompanied by a text summary or metadata preview.

---

## Shared Properties

Regardless of type, all items share common organizational and metadata fields:
- `id`, `title`: Core identification.
- `userId`: The owner of the item.
- `itemTypeId`: Relates back to the specific system type defined below.
- `isFavorite`, `isPinned`: Organization and UI sorting flags.
- `tags`: Many-to-many relationship with user-defined tags.
- `collections`: Many-to-many relationship representing logical groupings of items.
- `createdAt`, `updatedAt`: Standard timestamps.

---

## The 7 Item Types

### 1. Snippet
- **Icon**: `Code`
- **Hex Color**: `#3b82f6` (Blue)
- **Purpose**: Store reusable code blocks, utility functions, and programming logic.
- **Key Fields Used**: `title`, `content` (code text), `language` (e.g., typescript, python for highlighting).

### 2. Prompt
- **Icon**: `Sparkles`
- **Hex Color**: `#8b5cf6` (Purple)
- **Purpose**: Store AI prompts, system messages, and workflow automations.
- **Key Fields Used**: `title`, `content` (prompt text).

### 3. Command
- **Icon**: `Terminal`
- **Hex Color**: `#f97316` (Orange)
- **Purpose**: Store useful shell/terminal commands and deploy scripts for everyday development.
- **Key Fields Used**: `title`, `content` (command text), `language` (usually shell/bash).

### 4. Note
- **Icon**: `StickyNote`
- **Hex Color**: `#fde047` (Yellow)
- **Purpose**: General text notes, documentation, project context, and ideas.
- **Key Fields Used**: `title`, `content` (markdown/text notes).

### 5. File (Pro Only)
- **Icon**: `File`
- **Hex Color**: `#6b7280` (Gray)
- **Purpose**: Store documents, PDFs, context files, and other general binaries.
- **Key Fields Used**: `title`, `fileUrl`, `fileName`, `fileSize`, `description`.

### 6. Image (Pro Only)
- **Icon**: `Image`
- **Hex Color**: `#ec4899` (Pink)
- **Purpose**: Store UI references, screenshots, and architecture diagrams.
- **Key Fields Used**: `title`, `fileUrl`, `fileName`, `fileSize`, `description`.

### 7. Link
- **Icon**: `Link`
- **Hex Color**: `#10b981` (Emerald)
- **Purpose**: Bookmark useful web articles, documentation, tools, and repositories.
- **Key Fields Used**: `title`, `url`, `description`.

---

## Display Differences Summary

- **Text Types**: Rendered using a markdown/code editor component. Snippets and Commands leverage the `language` field to apply specific syntax highlighting themes, whereas Prompts and Notes usually rely on standard markdown rendering.
- **File Types**: Rendered with file information (size and original filename). Images get a distinct visual treatment, displaying the actual image preview directly in the UI, while generic Files show a file-type thumbnail or icon alongside a download action.
- **URL Types**: Rendered primarily as interactive hyperlinks, heavily utilizing the `description` field to provide user-facing context on what the URL points to.
