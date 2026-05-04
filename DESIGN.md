---
name: Rook Notes
colors:
  surface: "#ffffff"
  surface-dim: "#f9fafb"
  surface-bright: "#ffffff"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f9fafb"
  surface-container: "#f3f4f6"
  surface-container-high: "#e5e7eb"
  surface-container-highest: "#d1d5db"
  on-surface: "#18181b"
  on-surface-variant: "#71717a"
  inverse-surface: "#18181b"
  inverse-on-surface: "#ffffff"
  outline: "#e4e4e7"
  outline-variant: "#f4f4f5"
  surface-tint: "#E14A34"
  primary: "#E14A34"
  on-primary: "#ffffff"
  primary-container: "#fef2f2"
  on-primary-container: "#dc2626"
  inverse-primary: "#fca5a5"
  secondary: "#8b5cf6"
  on-secondary: "#ffffff"
  secondary-container: "#ede9fe"
  on-secondary-container: "#6d28d9"
  tertiary: "#52525b"
  on-tertiary: "#ffffff"
  tertiary-container: "#f4f4f5"
  on-tertiary-container: "#27272a"
  error: "#ef4444"
  on-error: "#ffffff"
  error-container: "#fef2f2"
  on-error-container: "#991b1b"
  primary-fixed: "#fecaca"
  primary-fixed-dim: "#f87171"
  on-primary-fixed: "#450a0a"
  on-primary-fixed-variant: "#7f1d1d"
  secondary-fixed: "#ddd6fe"
  secondary-fixed-dim: "#c4b5fd"
  on-secondary-fixed: "#2e1065"
  on-secondary-fixed-variant: "#4c1d95"
  tertiary-fixed: "#e4e4e7"
  tertiary-fixed-dim: "#d4d4d8"
  on-tertiary-fixed: "#18181b"
  on-tertiary-fixed-variant: "#3f3f46"
  background: "#f9fafb"
  on-background: "#18181b"
  surface-variant: "#f4f4f5"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif"
    fontSize: "30px"
    fontWeight: "600"
    lineHeight: "1"
    letterSpacing: "-0.02em"
  headline-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif"
    fontSize: "24px"
    fontWeight: "700"
    lineHeight: "1.3"
  headline-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif"
    fontSize: "20px"
    fontWeight: "600"
    lineHeight: "1.35"
  title-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif"
    fontSize: "18px"
    fontWeight: "600"
    lineHeight: "1.4"
  body-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif"
    fontSize: "15px"
    fontWeight: "400"
    lineHeight: "1.7"
  body-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif"
    fontSize: "14px"
    fontWeight: "400"
    lineHeight: "1.5"
  label-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif"
    fontSize: "14px"
    fontWeight: "500"
    lineHeight: "1.5"
  label-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif"
    fontSize: "12px"
    fontWeight: "500"
    lineHeight: "1"
    letterSpacing: "0.05em"
rounded:
  sm: "0.125rem"
  DEFAULT: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  full: "9999px"
spacing:
  base: "4px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  gutter: "16px"
  margin: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  button-primary-hover:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
  sidebar:
    backgroundColor: "{colors.surface-dim}"
    textColor: "{colors.on-surface}"
    padding: "{spacing.lg}"
  note-card:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    rounded: "0"
    padding: "12px 16px"
  note-card-selected:
    backgroundColor: "{colors.primary-container}"
    border: "1px solid #fecaca"
  editor-surface:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg} {rounded.lg} 0 0"
    padding: "24px"
  tag-active:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  tag-ai-suggested:
    backgroundColor: "{colors.secondary-container}"
    textColor: "{colors.on-secondary-container}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
---

## Brand & Style
Rook Notes is designed with a minimalist, content-first philosophy. The aesthetic feels like a native macOS application or a modern digital workspace (akin to Notion or Linear). It avoids visual clutter, favoring clean typography, subtle borders, and intentional whitespace to keep the user focused entirely on their thoughts and writing. 

The brand personality is precise, quiet, and reliable. The application acts as a supportive tool rather than taking center stage, stepping out of the way until the user needs organizational or AI-assisted features.

## Colors
The color palette relies heavily on a neutral, professional grayscale spectrum (Zinc and Gray), accented primarily by "Rook Red" and secondarily by "AI Violet".

- **Neutral Foundations:** The core interface uses \`gray-50\` (\`#f9fafb\`) for structure (sidebar, layout background) and pure white (\`#ffffff\`) for active content areas (the note editor), creating a clear visual hierarchy through tonal separation. Text relies on various shades of Zinc for hierarchy (900 for headings, 700 for body, 500/400 for metadata).
- **Primary Accent (Rook Red):** \`#E14A34\` is used sparingly but effectively to guide the user's eye to primary actions (e.g., the "New note" button, the text caret, and active selections). When a note is selected in the list, it uses a soft \`red-50\` background with a subtle red ring to stand out without overwhelming the senses.
- **Secondary Accent (AI Violet):** Violet (\`#8b5cf6\` and its variants) is reserved exclusively for the "Opt-In Intelligence" features. When the AI suggests tags, they are highlighted with violet backgrounds and dashed borders to clearly distinguish machine-generated suggestions from user-generated content.

## Typography
The system uses native system fonts (\`-apple-system\`, \`BlinkMacSystemFont\`, \`Segoe UI\`, etc.) to ensure the application feels integrated and lightning-fast on any operating system.

- **Editor:** The core note-taking experience utilizes a readable \`15px\` size with a generous \`1.7\` line height. Headings are bold and nicely spaced to provide clear document structure.
- **Lists & Metadata:** Smaller font sizes (\`12px\` - \`14px\`) are used extensively for note lists, timestamps, and tags. Zinc-400 is used to push non-essential information (like empty states or stale timestamps) back in the visual hierarchy.
- **Caret:** A custom text caret colored in Rook Red (\`#E14A34\`) provides a premium, branded touch to the typing experience.

## Layout & Spacing
The layout is a classic three-pane structure (Sidebar, List, Editor) that maximizes horizontal space for desktop productivity.

- **Containers:** The app uses a full-viewport layout (\`h-screen overflow-hidden\`) with a fixed-width sidebar (224px) and a flexible main panel.
- **Rounding:** The editor pane employs a \`rounded-t-lg\` (8px) curve on the top edges, creating a subtle "card" or "sheet" effect that lifts the active writing area away from the surrounding gray background.
- **Padding:** Ample padding (e.g., 24px in the editor header) gives elements room to breathe.

## Elevation & Depth
Rook Notes avoids heavy drop shadows, instead creating depth through background color contrast and subtle borders. 

- **Flat Hierarchy:** The design remains overwhelmingly flat. Depth is primarily established by placing white surfaces over \`gray-50\` backgrounds.
- **Borders & Rings:** Selected states (like active note cards) use inset rings (\`ring-1 ring-inset ring-red-200\`) rather than drop shadows to indicate focus. Popovers (like the label editor dropdown) utilize a delicate \`shadow-sm\` and a light border to separate them from the main canvas.
- **Hover States:** Interactive elements like sidebar links and toolbar icons shift background colors gently (e.g., to \`bg-gray-100\` or \`bg-gray-200\`) on hover, providing tactile feedback without spatial elevation.

## Shapes
The shape language is slightly rounded but structured.

- **Buttons & Tags:** Primary buttons and tags use \`rounded-lg\` (8px) to soften their appearance, while smaller interactive elements use \`rounded-md\` (6px).
- **Cards:** List items remain mostly unrounded rectangles to form a continuous, flush list, but highlight states conform to the internal padding to look clean.
- **Input Fields:** Search bars and text inputs use rounded corners to feel approachable, often transitioning with a subtle focus ring (\`focus:ring-1 focus:ring-red-400\`).

### Interactive Elements
- **Tags:** User-created tags have standard background fills. When the AI suggests an existing tag, it appears with a solid violet background. When the AI suggests a completely new tag, it features a \`dashed\` border and a translucent violet background, visually communicating its "proposed" state.
- **Editor Toolbar:** The rich text formatting tools sit in a light gray pill (\`bg-gray-100\`, \`rounded-lg\`) and feature tiny visual separators. Hovering over a tool darkens its icon and background, making the toolbar feel responsive and native.
