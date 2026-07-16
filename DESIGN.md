# UI/UX Design Rules

## Borders & Dividers
- Never add decorative divider lines, borders, or empty boxes unless explicitly required.
- When rendering a list, the last item must have no bottom border or trailing line.
- Use spacing (gap, padding, margin) for visual separation instead of borders.
- A `border-t` on a footer or section header is acceptable **only** if there is real content on both sides (it separates two sections of content). If content only exists above, use spacing alone.

## Theme
- **Grayscale-only palette** — no accent colors. All visual hierarchy uses shades of gray.
- Uses Tailwind CSS with custom CSS variable tokens (defined in `src/index.css`):
  - `bg-background` — page background
  - `bg-surface` — card/panel background
  - `bg-surface-hover` — hover state for surface elements
  - `bg-surface-alt` — alternative surface background
  - `text-text` — primary text
  - `text-text-muted` — secondary text
  - `text-text-dim` — dim/disabled text
  - `border` — default border color
  - `primary` / `primary-hover` — darkest gray (replaces former green accent)
  - `cardinal` — medium-dark gray (replaces former red)
  - `reward` — light gray (replaces former yellow)
- **Dark mode** uses pure black (`#000000`) background with near-black surfaces.
- **Light mode** uses near-white (`#F5F5F5`) background with white surfaces.
- See `tailwind.config.js` and `src/index.css` for the full token and color definitions.

## Layout Rules
- Content width is capped at `max-w-lg` on the Learn page and `max-w-sm` on modals and bottom sheets.
- Bottom sheets use `rounded-t-2xl` on mobile and `rounded-2xl` on desktop (`sm:rounded-2xl`).
- All modals and overlays use a `bg-black/50` backdrop.

## Typography
- Bengali text uses the `bn-text` class (forces `Hind Siliguri` / `Noto Sans Bengali` font family and zero letter-spacing).
- Font size tokens from Tailwind: `text-3xs` (10px), `text-2xs` (11px), `text-xs`, `text-sm`, `text-base`, `text-lg`, etc.
