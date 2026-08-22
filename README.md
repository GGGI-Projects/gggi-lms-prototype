# Open Learner - prototype

A clickable, front-end-only prototype of a free e-learning platform for Sri
Lanka's public sector. Built to be shown to the client, and to convert directly
into the real frontend once backend work starts.

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · `motion` for animation.

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## What is built

The **landing page** (`app/page.tsx`). Sign-up, sign-in and the student portal
come next.

## Ground rules this prototype follows

**No GGGI branding anywhere.** The platform reads as a standalone product - no
logo, no name, no borrowed colours. The subject matter is the client's real
first curriculum (climate vulnerability assessment, provincial adaptation
planning, bankable climate finance proposals, and gender equality & social
inclusion including gender-responsive budgeting), but the organisation is
never named. There is a `grep -ci gggi` check worth re-running after any copy
change.

**No backend.** Every number, module and answer comes from
`content/site.ts`. Nothing fetches, nothing persists.

**No dead ends.** The module rows expand in place rather than linking to
detail pages that do not exist yet, so nothing 404s during a demo. The only
links that leave the page are `/signup` and `/login`, which are the next things
to build.

## The two things you will want to change first

### 1. The product name

It is a **placeholder**. Everything - header, footer, page title, the
certificate mock - reads from one file:

```ts
// lib/brand.ts
export const BRAND = {
  name: "GreenFin",
  suffix: "Academy",
  slogan: "Streamlining corporate sustainable finance",
  // ...
};
```

Change it there and it propagates. Nothing else hardcodes the name.

### 2. Photography

The design direction is photography-led editorial, but the prototype ships with
hand-authored SVG artwork instead of stock photos - no external requests, so it
cannot break on bad conference wifi, and the layers animate on scroll in a way
photographs cannot.

To swap in real photography, drop a file in `public/images/` and give
`<PhotoSlot>` a `src`:

```tsx
// components/sections/hero.tsx
<PhotoSlot src="/images/hero.jpg" alt="…" className="…">
  <ArchScene /> {/* fallback - stays until src is provided */}
</PhotoSlot>
```

## Layout

```
app/
  layout.tsx          font (Inter), metadata
  globals.css         design tokens, type scale, keyframes, reduced-motion rules
  page.tsx            section order
lib/brand.ts          product identity - the single swap point
content/site.ts       all copy and mock data
components/
  motion/primitives   Reveal, Stagger, WordReveal, Parallax, Magnetic,
                      Counter, ScrollProgress, CursorGlow
  art/scenes.tsx      SVG artwork + PhotoSlot
  art/globe.tsx       the rotating Earth in the hero
  art/globe-geometry  generated coastline data (do not hand-edit)
scripts/
  generate-globe.mjs  regenerates the coastlines from Natural Earth
  site/               header, footer
  sections/           hero, marquee, mission, modules, journey,
                      certificate, audience, faq, closing CTA
```

Section order is an argument: what this is → what it covers → why it exists →
what you get → how it works → what you walk away with → whether it is for you →
what is still worrying you → the ask.

## Design system

**Ocean & Amber.** Deep teal carries the page; amber is the highlight. Cool,
light surfaces with warm punctuation. Light-only by design.

Tokens are named by **role, not colour** - `primary`, `accent`, `surface`,
`tint`, `ink`, `muted` - and defined in one `@theme` block in
`app/globals.css`. Changing the palette again means editing only those values;
no component, class name or SVG needs to change.

One typeface throughout: **Inter**, for headings and body alike. Hierarchy
comes from size, weight and spacing rather than a contrast of typefaces.
`--font-display` is kept as its own token, so pointing headings at a separate
face later is a one-line change.

Two contrast rules the palette depends on:

- `accent` (bright amber) is for **graphics only** - the seal, bullets,
  progress bars, journey nodes. It does not have the contrast to sit as small
  text on a light background.
- Accent **text** uses `accent-strong` (bronze) on light grounds and
  `accent-soft` on the dark sections. Small interactive text is teal.

## Animation, and why some of it is CSS

Scroll reveals, staggered lists, the pinned journey, the tilting certificate,
magnetic buttons and the cursor glow all use `motion`.

**The hero deliberately does not.** Its entrance runs on CSS animations, because
`motion`'s `initial={{ opacity: 0 }}` is serialised into the server HTML as
`style="opacity:0"` - which means a visitor whose JS is slow, blocked or broken
sees a blank page. The audience here includes older government machines and
poor connections, so:

- The hero animates off the stylesheet alone and is readable without JS.
- Every `motion`-driven section is gated on `useHydrated()`, so the hidden
  state never reaches the server HTML.
- `Counter` renders its final value on the server, not `0`.
- `prefers-reduced-motion: reduce` zeroes animation **delays as well as
  durations** - collapsing only the duration still leaves a `fill-mode: both`
  element invisible for the length of its delay.

Worth preserving when this becomes the real frontend. To verify after changes:

```bash
curl -s http://localhost:3000 | grep -c 'opacity:0'   # expect 0
```

## The hero globe

Real Natural Earth coastlines, inlined as SVG. No WebGL, no 3D library, no
image request - the prototype has to survive a projector with no wifi.

The rotation is an equirectangular world map tiled twice and scrolled behind a
circular mask, with limb-darkening and a highlight layered on top. It is an
approximation: a real sphere would compress the continents towards the limb.
It reads convincingly and costs a fraction of the alternative.

The coastline data is generated, not hand-written:

```bash
node scripts/generate-globe.mjs   # rewrites components/art/globe-geometry.ts
```

It projects Natural Earth 110m land, rounds coordinates to integers and drops
sub-pixel islands - none of which is visible at the size the globe renders, and
all of which costs bytes on every page load. `world-atlas`, `topojson-client`
and `d3-geo` are devDependencies used only by that script; nothing geo-related
ships to the browser.

## Known prototype limitations

- `/signup`, `/login` and `/dashboard` are not built yet - those links 404.
- English only, with no other language planned.
- The certificate is a visual mock; the reference number is illustrative.
