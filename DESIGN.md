---
name: Rook Notes
colors:
  # Brand Primary: "Rook Red"
  primary: "#C83220" # Darkened for WCAG AA contrast with white
  on-primary: "#ffffff"
  primary-container: "#fef2f2"
  on-primary-container: "#B91C1C" # Darkened for WCAG AA contrast with container
  primary-hover: "#DC2626"

  # AI Intelligence: "AI Violet"
  ai: "#7C3AED"
  on-ai: "#ffffff"
  ai-container: "#ede9fe"
  on-ai-container: "#6d28d9"

  # Neutral Foundations
  background: "#f9fafb"
  on-background: "#18181b"
  surface: "#ffffff"
  on-surface: "#18181b"
  on-surface-variant: "#52525b"
  on-surface-muted: "#71717a"

  # Structural Elements
  caret: "{colors.primary}"

typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
    fontSize: "30px"
    fontWeight: "600"
    lineHeight: "1"
    letterSpacing: "-0.025em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "20px"
    fontWeight: "600"
    lineHeight: "1.3"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: "400"
    lineHeight: "1.7"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: "500"
    lineHeight: "1.5"
  metadata:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: "400"
    lineHeight: "1"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
    fontSize: "13px"
    lineHeight: "1.7"

spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  sidebar: "224px"

rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"

elevation:
  none: "none"
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"

components:
  sidebar:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    padding: "{spacing.lg}"
    width: "{spacing.sidebar}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  note-card:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    padding: "12px 16px"
  note-card-selected:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-surface-variant}"
  editor:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
    typography: "{typography.body}"
  tag:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    rounded: "{rounded.md}"
    typography: "{typography.metadata}"
  tag-ai:
    backgroundColor: "{colors.ai-container}"
    textColor: "{colors.on-ai-container}"
  icon-ai:
    backgroundColor: "{colors.ai}"
    textColor: "{colors.on-ai}"
---

# Design System: Rook Notes

Rook Notes is built on a philosophy of **Extreme Minimalism** and **Content-First Utility**. The application is designed to feel like a native tool—a quiet, reliable extension of the user's mind that steps out of the way until needed.

## Visual Identity & Intent

The aesthetic draws inspiration from modern, high-craft productivity tools like Linear and Notion, combined with the tactile familiarity of macOS system applications. It favors flat surfaces, crisp typography, and intentional use of whitespace over heavy shadows or complex gradients.

## Color System

The palette is anchored by a sophisticated grayscale foundation, punctuated by two meaningful accent colors:

- **Rook Red (`#E14A34`):** Represents the user's primary agency. It is used for core actions (creating notes), active selection states, and the typing caret. It is a warm, energetic red that commands attention without feeling aggressive.
- **AI Violet (`#8B5CF6`):** Reserved exclusively for "Opt-In Intelligence" features. It distinguishes machine-generated suggestions from user-authored content, creating a clear boundary between the user's workspace and AI assistance.
- **Surface Strategy:** The application uses a "Layered White" approach. The background structure (sidebar and layout) uses a subtle off-white (`gray-50`), while the active content area (the editor) sits on a pure white surface. This tonal contrast creates hierarchy without needing shadows.

## Typography

Rook Notes relies on the **System Font Stack** to ensure maximum performance and a feeling of "belonging" on the user's operating system.

- **Note Content:** The writing experience is optimized for long-form thought. A `15px` base size with a `1.7` line height provides an airy, readable rhythm.
- **Hierarchy:** Bold, tight-tracked headings (`30px` for the brand, `20px` for note titles) provide strong anchoring points for the eye.
- **Metadata:** Smaller, muted type (`12px`) is used for timestamps and tags to push secondary information into the background.

## Layout & Spatial Logic

The interface follows a strict **Two-Pane Productivity Layout**:

1.  **The Library (Left):** A fixed-width sidebar for navigation and organization. It uses a slightly darker background to feel "anchored."
2.  **The Canvas (Right):** A flexible area that houses the Note List and the Note Editor.

**The "Sheet" Metaphor:** The editor area is designed as a "sheet" with a `rounded-t-lg` (8px) top radius. This subtle curve suggests that the editor is a document being pulled up from the bottom of the screen, focusing the user's attention on the task at hand.

## Shapes & Radii

- **Structured Softness:** A consistent `8px` (lg) radius is used for primary containers and large buttons to feel approachable.
- **Functional Sharpness:** Smaller interactive elements like tags and sidebar links use a `6px` (md) radius, maintaining a precise, tool-like feel.
- **Standardization:** All interactive elements use standard Tailwind-scale radii to ensure a harmonious visual rhythm across the entire app.

## Interactive States

- **Feedback:** Hover states are subtle, typically shifting the background to a light gray (`gray-100`) or darkening the primary red slightly.
- **Selection:** Active notes are highlighted with a soft red wash and a subtle inset ring, providing clear focus without visual noise.
- **AI Affordance:** AI-suggested tags use dashed borders and a "sparkle" icon, communicating their "draft" or "proposed" status.
