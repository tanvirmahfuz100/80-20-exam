# SVG Icon Design System

> Design rules for creating card-background SVG icons in the 80-20 Exam app.

## Canvas

- **viewBox**: `"0 0 400 220"` (always)
- **Aspect ratio**: ~1.8:1 landscape — fills card backgrounds with `object-fit: cover`

## Background

- Full-size `<rect width="400" height="220">` filled with a `<radialGradient>`
- Gradient: `cx="50%" cy="35%" r="80%"` — bright spot near top-center fading to near-black at edges
- Top color: dark saturated hue (the accent color at very low brightness)
- Bottom color: near-black (`#050a09`, `#0a0503`, `#06070a`, etc.)

```svg
<radialGradient id="bg" cx="50%" cy="35%" r="80%">
  <stop offset="0%" stop-color="#<dark-saturated>"/>
  <stop offset="100%" stop-color="#<near-black>"/>
</radialGradient>
```

## Glow Filter

Applied to the main line-art group. Always use `feMerge` pattern:

```svg
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur stdDeviation="1.4" result="b"/>
  <feMerge>
    <feMergeNode in="b"/>
    <feMergeNode in="SourceGraphic"/>
  </feMerge>
</filter>
```

`stdDeviation` range: `1.4`–`1.6`

## Line Art

- **stroke-width**: `0.75`–`1.1`
- **fill**: `none` (except node dots)
- **Shapes**: simple geometric/abstract forms — constellations, waveforms, stacked shapes, orbits, nodes, paths
- **No literal/detailed illustrations** — always minimal line art
- **One accent color** per icon (see hue table below)

## Accent Hue Families

| Category | Hue | Hex (main) | Lighter tint | Node dot | 
|----------|-----|------------|--------------|----------|
| Academic / Language | Blue-violet | `#7c6ff0` | `#b29fff` | `#d4c9ff` |
| Research / Science | Cyan-teal | `#30d0c0` | `#70e8d8` | `#b0f5ea` |
| Performance / Math | Amber-orange | `#f0a030` | `#fcc870` | `#ffd999` |
| Student / Social | Rose-magenta | `#e04a80` | `#f070a8` | `#ffb0d0` |
| Publications | Purple | `#b28fff` | `#d9c6ff` | `#e6d9ff` |
| Podcast | Green-teal | `#4ff0d0` | `#80f4dc` | `#b0f8e8` |
| Settings / Knowledge | Blue-gray | `#8fb6e6` | `#c0d4f0` | `#dbe7ff` |
| About | Cyan | `#5fd6f0` | `#8fe6fa` | `#c3f2ff` |
| Contact / Business | Gold | `#f0d060` | `#e8c060` | `#fff0b8` |
| General / Islam | Neutral gray | `#c7ccd6` | `#e6e9ef` | `#f0f1f5` |
| Agriculture | Emerald-green | `#30c080` | `#60d8a0` | `#a0f0c8` |
| Islam (specific) | Deep-indigo | `#6070f0` | `#8a96ff` | `#b0baff` |

**Pick a new hue for new categories** — never reuse one already assigned.

## Depth Elements

Add faint background elements at low opacity (`0.3`–`0.5`) behind the main art:

- Large dashed circles (`stroke-dasharray="2 4"`)
- Faint concentric circles
- Subtle grid lines
- A big translucent shape (triangle, diamond, etc.)

These use the same accent color but at very low opacity.

## Node Dots

Small filled circles marking endpoints or connection points:

- **radius**: `2`–`3.5`
- **fill**: lighter tint of the accent color
- **Optional**: unfilled outer rings at `opacity="0.7"` with `stroke-width="0.5"`

```svg
<circle cx="200" cy="55" r="3"/>
```

## Prohibitions

- No text characters or labels
- No photographic elements
- No gradients other than the background radialGradient
- No complex fills or patterns — only simple `fill` on node dots

## File Naming

- **Category icons**: `subject-<category>.svg` (e.g., `subject-math.svg`, `subject-science.svg`)
- **Page/section icons**: `<section-name>.svg` (e.g., `settings.svg`, `about.svg`)
- All lowercase, hyphen-separated
- Stored in `public/assets/images/icons/`

## Usage in Components

SVGs are used as full card background images with `object-fit: cover`:

```tsx
<img src={`${import.meta.env.BASE_URL}assets/images/icons/<filename>.svg`} alt="" className="absolute inset-0 w-full h-full object-cover" />
<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
```

The gradient overlay ensures text readability. Content sits on top with `position: relative; z-index: 10`.
