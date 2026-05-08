# Product Requirements Document

## 1. Overview

**Rook** delivers a fast, modern, clean, minimal markdown-based note app optimized for daily capture and reuse. It addresses clutter from throwaway notes, friction when reusing recurring notes, and trust concerns about data ownership. Rook is Google Drive-first: notes live as portable Markdown in the user’s Drive so ownership stays with the user and Google-native capabilities (e.g., Gemini) can work directly on their files without a separate ecosystem.

## 2. Problem Statement

Most note-taking tools fail not because they lack features, but because they optimize for the wrong behaviors.

### 2.1 Limitations of Existing Solutions

**Evernote**

- Slow and increasingly bloated for basic note capture
- Aggressive upsell disrupts focus
- Treats all notes as permanent, leading to long-term clutter
- Proprietary storage reduces trust and portability

**Google Keep**

- Extremely fast and lightweight
- Formatting and structure are severely limited
- Becomes awkward for medium-length or evolving notes
- Poor support for reuse and organization over time

**Notion**

- Extremely flexible and powerful
- Optimized for structured databases, documents, and collaboration
- Introduces significant cognitive and interaction overhead for simple note capture
- Too complex and slow for fast, lightweight, everyday note-taking

**Markdown-first knowledge tools (Obsidian, Logseq, etc.)**

- Powerful but heavy
- Require upfront structure and intent
- Skew toward knowledge systems rather than casual capture
- Introduce cognitive overhead at creation time

**Simple Note**

- Conceptually very close: fast, minimal, text-first
- Strong for ephemeral capture
- Limited formatting
- Weak support for evolving or recurring notes
- Notes live in a proprietary backend
- Portability is possible, but not native or transparent

### 2.2 Core Unmet Needs

- Ephemeral notes are common. Users frequently write notes they never revisit, such as support ticket numbers, phone numbers, or temporary reminders. These accumulate as clutter.
- Recurring notes are recreated instead of reused. Grocery lists, reference notes, and ongoing lists are often duplicated because reuse is not surfaced at the right moment.
- Users want speed and structure. Fast tools sacrifice expressiveness, while expressive tools sacrifice speed.
- Users want true data ownership. Notes should be portable, transparent, and independent of a proprietary backend.

### 2.3 Opportunity

There is a clear gap for a fast, minimal, markdown-based note system that feels as lightweight as Simple Note or Keep, supports richer structure without ceremony, acknowledges that notes have different lifecycles, encourages reuse over duplication, and stores notes in a user-controlled, portable format such as Google Drive.

## 3. Product Vision

Create a modern, clean, minimal, fast note-taking system that adapts to how people actually think.

Some notes are throwaway.

Some notes evolve over time.

Some quietly move from one to the other.

The system should support this without requiring upfront decisions.

## 4. Target User

The primary user is a knowledge worker who writes short notes, values speed and low friction, is comfortable with light formatting, and cares about data ownership and portability.

## 5. Core Principles

5.1 Capture first, decide later. No required structure at creation time.

5.2 Lifecycle-aware, not lifecycle-heavy. Notes age naturally and the system reflects this gently.

5.3 Markdown as the substrate. Markdown is the source of truth, not the user experience.

5.4 Reuse over recreation. The system nudges reuse without blocking flow.

5.5 Search as primary navigation. Users find notes by intent, not location.

5.6 Portability is a core feature. Notes must remain usable outside the app.

### 5.1 Design Philosophies

- Visual style: minimalist, no clutter, focused on note taking, no distractions.
- Visual inspiration: obsidian.md, bear.app
- General layout: sidebar on the left, main content on the right, search on the top.
- Sidebar: labels and other filters (if applicable).
- Main content: note list and note editor.
- Main interactions:
  - Clicking on a note in the list opens the note in the editor. The editor should take over the main content space. 
  - Closing a note should go back/show the list.
  - Clicking on a label in the sidebar filters the note list.

## 6. Core Use Cases

### 6.1 Ad-hoc Notes

Users can instantly create notes with autosave, minimal formatting, and no required metadata. Typical examples include support request numbers, phone numbers, one-off reminders, and quick thoughts.

### 6.2 Temporary Notes

Temporary notes are expected and normal. They are usually short, created quickly, and rarely revisited. The system should make it easy to create them and easy to clean them up later.

### 6.3 Recurring or Living Notes

Some notes are meant to be reused and updated over time, such as grocery lists, reference notes, recipes, or packing lists. The system should help users rediscover these notes at the moment they would otherwise recreate them.

## 7. Feature Set

The feature set focuses on fast capture, effortless retrieval, and lifecycle awareness at scale. Scope is managed through prioritization rather than labeling functionality as provisional.

### 7.1 Note Creation and Editing

#### 7.1.1 Purpose

Enable instant capture and focused writing with minimal friction.

#### 7.1.2 Requirements

- Create a new note instantly
- Autosave by default
- Focused, distraction-free editor
- No required metadata at creation time
- Support pasting images directly into notes through clipboard paste and drag-and-drop

#### 7.1.3 Markdown Support

- Headings (H1–H3)
- Bold and italic
- Bulleted and numbered lists
- Checklists
- Code blocks
- Tables

#### 7.1.4 Images

- Images can be pasted directly into the editor
- Images are stored alongside notes and referenced from Markdown
- Basic image display only, with no resizing or annotations initially

#### 7.1.5 Formatting Toolbar

- Optional and unobtrusive
- Inserts Markdown directly
- No rich-text abstraction layer
- Keyboard shortcuts supported

#### 7.1.6 Non-Requirements

- No custom styles
- No mandatory templates
- No rich embeds beyond images

### 7.2 Note List View

#### 7.2.1 Purpose

Provide fast scanning, navigation, reuse cues, and lifecycle context.

#### 7.2.2 Requirements

- Displays all notes in a single, unified list
- Each list item includes a title or first-line fallback, a short content snippet of one to two lines, a last edited timestamp, and optional label indicators
- Supports keyboard navigation

#### 7.2.3 Sorting

- Last edited by default
- Created date
- Title (A–Z)

#### 7.2.4 Filtering

- By label
- By basic lifecycle state such as recent or stale

#### 7.2.5 Non-Requirements

- No folders
- No drag-and-drop reordering
- No custom or saved views

### 7.3 Search

#### 7.3.1 Purpose

Enable retrieval, reuse, and navigation by intent rather than location.

#### 7.3.2 Requirements

- Full-text search across title, body, and labels
- Results update as the user types
- Keyboard-first interaction using Cmd or Ctrl + K
- Search results render in the same list view

#### 7.3.3 Reuse Support

When creating a new note or typing a title, the system surfaces exact title matches, keyword matches, and recently edited relevant notes. These are suggestions, not blockers.

### 7.4 Labels

#### 7.4.1 Purpose

Enable light filtering and cleanup without imposing structure.

#### 7.4.2 Requirements

- Free-form text labels
- Multiple labels per note
- Labels editable inline

#### 7.4.3 Non-Requirements

- No hierarchies
- No enforced taxonomy
- No color coding

### 7.5 Note Lifecycle Awareness

#### 7.5.1 Purpose

Help users recognize temporary versus living notes without requiring upfront decisions.

#### 7.5.2 Signals

- Last opened
- Last edited
- Note length
- Edit count

#### 7.5.3 User Experience Patterns

- Visual cues in the list view such as last edited timestamps
- Filters for recently edited notes, notes not opened in a while, and short single-edit notes

#### 7.5.4 Non-Requirements

- No automatic deletion
- No hard lifecycle states

### 7.6 Periodic Cleanup

#### 7.6.1 Purpose

Provide a bounded, low-stress way to reduce clutter.

#### 7.6.2 Actions

- Delete
- Archive
- Add or edit labels
- Leave unchanged

#### 7.6.3 Non-Requirements

- No forced cleanup
- No nagging reminders
- No bulk automation

### 7.7 Sync and Storage

#### 7.7.1 Purpose

Ensure trust, portability, and user ownership of data.

#### 7.7.2 System of Record

Google Drive

#### 7.7.3 Storage Model (to be finalized in ExecPlan)

- Must be Google Drive–friendly and user-portable (readable/exportable outside the app).
- Preferred approach: per-note Markdown (with or without frontmatter) plus images stored alongside; frontmatter must stay human-readable and optional.
- Alternate approaches still open for validation:
  - Per-note Markdown with sidecar metadata files.
  - Bundled store (e.g., SQLite) with scheduled Markdown exports for portability.
- Human-navigable folder layout is required (e.g., `/Rook/notes`, `/Rook/archive`, `/Rook/assets`), with exact structure to be finalized in the ExecPlan.

#### 7.7.4 Requirements

- Google Drive OAuth (user must connect Drive to use the app).
- Background sync with batching/debouncing to respect Drive API limits.
- Local caching for performance with short offline tolerance.
- Conflict handling baseline: last-write-wins with clear user-facing behavior.

Users should be able to view, edit, or migrate files directly in Drive at any time.

### 7.8 Platform Support

#### 7.8.1 Requirements

- Web application
- Responsive for desktop and mobile
- Keyboard-first interactions on desktop
- Touch-friendly on mobile

#### 7.8.2 Non-Requirements

- Native mobile apps
- Advanced offline-first behavior beyond basic caching

## 8. Non-Goals

- Real-time collaboration
- Heavy templates or database metaphors
- Folder-first organization
- Generative content features
- Deep customization or theming

## 9. Success Metrics

The product is successful if time to first keystroke is under 100 milliseconds, search latency is under 50 milliseconds, notes are reused more often than recreated, cleanup feels manageable rather than overwhelming, the app feels faster and more minimal than Evernote, and users trust their data ownership. Additional targets: zero data-loss incidents; Drive sync error rate below 0.1% of sync operations.

## 10. Risks and Mitigations

10.1 Scope creep is mitigated through clear prioritization and scope control.

10.2 Over-engineering is mitigated by favoring simple heuristics.

10.3 Sync complexity is mitigated by conservative assumptions and batching/debouncing to reduce Drive API churn and rate-limit risk.

10.4 UX polish risk is mitigated by preferring clarity over cleverness.

## 11. Post-Launch Milestones (Future, not in MVP)

11.1 Reliability & Portability
- Backups and revisions/version history.
- Imports from existing tools, prioritizing Evernote compatibility.
- Offline-first enhancements beyond basic caching.
- Web clipper to extract content in a clean and summarized Markdown format

11.2 Platform Reach
- Native apps for Android and iOS.

11.3 AI Foundations (Scoped for future)
- Storage stays per-note Markdown on Google Drive to keep content LLM-friendly and portable; allow optional frontmatter fields (e.g., `note_id`, `labels`, `created_at`, `embedding_placeholder`) without breaking readability.
- AI-assisted reuse: surface likely existing notes during creation via semantic matching layered atop exact/keyword search.
- AI formatting helpers: summarize, shorten, or reformat notes; always show a preview and keep the editable Markdown source.
- AI merge/combine: propose merges with diff-style preview; user approves before applying.
- AI housekeeping: suggest archive/delete/label for stale or duplicate notes; opt-in and user-reviewed.
- AI-assisted search: semantic re-ranking on top of deterministic full-text; fall back cleanly when offline.
- AI-assisted web clipper: extract readable Markdown, auto-cite source URL, optionally summarize.
- Guardrails: no model training on user data without consent; clearly indicate when content leaves the device; user confirmation with preview is required before AI writes; heavy AI tasks run async so TTFK/search budgets remain intact.

## 12. Final Note

This PRD intentionally avoids novelty-driven features and focuses on daily, high-frequency behavior. Success is defined by how invisible the product feels once it becomes habit.
