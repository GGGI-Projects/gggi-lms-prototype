# Performance backlog

Work still outstanding from the optimisation pass on the hero and the marquee.

## Why this exists

The page ran at 60fps on a fast desktop and janked badly on a mid-range laptop
and on a phone — worst in the hero and the subject marquee, which is where the
continuous animation lives. The audience for this platform includes people on
older government machines, so this is a requirement rather than polish.

The root causes found, in cost order:

1. `@keyframes year` animating **eight inherited registered custom properties**
   across the whole document, sixty times a second.
2. The fixed header's `backdrop-blur` re-blurring every frame, because its
   background colour read one of those animating properties.
3. The globe's **4,724-command** land path rasterised **four times per frame**.
4. Three full-viewport `mix-blend-mode` layers.
5. A `requestAnimationFrame` loop calling `getAnimations()` every frame.
6. `will-change` on 22 particles whose paint changed every frame anyway.
7. `backdrop-filter` on ~20 continuously moving marquee chips.

Most of that is fixed. What follows is what is left.

## Measured, 2026-08-19 — read this before picking the next item

After items 1 (partly) and 2 landed, the hero was profiled properly rather than
reasoned about. Several things in the list below turn out to be wrong. Numbers
are `RasterTask` counts from a CDP trace over **one full 24-second year** on the
landing page at 1600x1000, idle.

**Window the trace to a whole year, or the numbers are noise.** Blends are a
third of the cycle, so an 8-second window can contain anywhere from 1.3s to 4s
of blending — a 3x swing that looks like a real effect. Every 24s baseline
re-run came back 3286-3314; every 8s one was worth nothing.

**Do not ablate by injecting `animation-timing-function`.** Overriding it
restarts the animations and costs 2.6x on its own: injecting the value the page
ALREADY HAS took raster from 3302 to 8626. Any conclusion drawn that way is
about the injection, not the page. `display: none` and pinning custom properties
inject cleanly; timing functions do not. To compare step rates, rebuild.

| variant | raster tasks |
|---|---|
| baseline | ~3300 |
| globe hidden | 3264 |
| year clock frozen | 1337 |
| hero text column removed | ~350 |
| big painted areas (sky, scrim, ocean, halo, sweep, particles) pinned static | 3165 |
| all 7 season properties pinned static ON the text column | 3190 |

What that says:

1. **Item 2 worked.** Hiding the globe entirely changes nothing (3264 vs 3300).
   It is no longer a cost. Confirmed independently by the layer tree.
2. **The year clock is now the whole remaining story** — freezing it is a 60%
   cut, and nothing else moves the number at all.
3. **The cost is not the gradients.** Pinning every large painted area static
   bought 4%. Item 1's "stack one static layer per season and cross-fade the
   opacity" would therefore deliver almost nothing on its own, which is the
   opposite of what this document said. Do not start it expecting the win.
4. **Chrome invalidates the clock's whole subtree, not the elements whose
   values changed.** Pinning all seven properties static on the hero's text
   column left the cost intact (3190); REMOVING that column dropped it to ~350.
   The text repaints because it is *inside* the animated subtree, not because
   its colour is animating.

**So the only lever that works is the subtree, and it is item 1's blocked design
call by another route.** Either the hero's copy stops being a descendant of the
element carrying `@keyframes year` — which means it stops taking its colour from
the animated properties — or it keeps repainting at the step rate whatever else
is done. For reference, the four `--season-text` values differ by at most 19/255
and are plausibly one colour; the four `--season-text-muted` values differ by up
to 46/255 (warm sand vs cool blue) and are not.

**Items 4 and 6 (the two `mix-blend-mode` layers) are not worth doing.** Also
measured, below the hero: while SCROLLING, removing both changed nothing
(1051 raster with them, 1231 without — the noise is the newly revealed content).
While the cursor moves over a still page they cost ~12ms of raster per 8s, and
only because the grain sits above the glow and has to re-read where it moved.
That is real but it is not the 40-50% it was assumed to be. Leave them alone
until something else is exhausted.

## How to measure

Not LCP — the metric that matters here is **per-frame style recalc and paint
while the hero sits idle**, and dropped frames during scroll.

- DevTools Performance, **6× CPU throttle, on the slow machine** — not the
  desktop. Watch the Main track for recalc-style and paint bands.
- Rendering panel: Paint flashing, Layer borders, Frame rendering stats.
- The Layers panel — the count should be a handful, not thirty.
- In the console, for a quick before/after:

  ```js
  let n = 0, t = 0;
  new PerformanceObserver(l => l.getEntries().forEach(e => { n++; t += e.duration; }))
    .observe({ type: 'long-animation-frame', buffered: true });
  setTimeout(() => console.log(`${n} long frames, ${Math.round(t)}ms total`), 10000);
  ```

  Run it with the hero on screen, then again from the FAQ. The second number
  should be near zero — everything in the hero pauses off-screen now.

### Forcing a tier

`?perf=high` or `?perf=low` pins the tier for the session and stops the
watchdog from overriding it. `document.documentElement.dataset.perf` says which
one you are on. Use it to see the low tier without hunting for a slow machine,
and to rule the tiering in or out when something looks wrong — a still globe and
missing particles is what the low tier is *supposed* to look like, so the first
question when either goes missing is always which tier you are actually on.

Clear it with `sessionStorage.removeItem('perf')` and reload.

---

## Hero

### 1. Season colours → compositor-only opacity cross-fade

> **Superseded in part — see "Measured, 2026-08-19" above before starting.**
> The cross-fade described here was measured to be worth ~4%, not the win this
> section claims: the repaint is driven by the subtree the clock sits on, not by
> the gradients. The design call below is still the unblocker, but for a
> different reason than the one given here.

**The biggest item left.** Everything else on this list is worth a few percent;
this one removes the remaining per-frame style recalc at its source rather than
shrinking it.

Today `@keyframes year` interpolates seven colour properties and one angle
continuously. Because they are `inherits: true`, every change re-resolves
computed style for the whole subtree beneath the clock, and then forces a
repaint of everything that reads them — the hero's sky gradient, the scrim's
two `color-mix()` calls, the globe's six SVG gradients and its land fill, the
sweep, and every particle's background.

Instead: stack one static layer per season, each painted with that season's own
colours, and animate only their `opacity`. Opacity is a compositor-only
property — no style recalc, no repaint, GPU only. The seasons are static
artwork; only the transition between them needs animating.

**Decision needed before starting.** The palette currently lives *only* in
`@keyframes year`, deliberately — see the note at the top of `content/seasons.ts`
about a palette in two places drifting. Static per-season layers mean the four
palettes must also exist as static CSS, which is exactly that duplication.

The way out is a design call: the four seasons' text colours are `#eaf7f0`,
`#e8f3fb`, `#f7f1e8` and `#e9effa` — near-identical off-whites. If text and
muted-text can stop varying per season, two of the seven animated properties
disappear outright and the rest become background artwork that cross-fades for
free. The accent colours differ a lot (mint / gold / sand / ice) and would still
need to blend, but they only touch small elements — the filled button, the ping
dot, "Free", the underline, the globe's rim and marker.

If each season must keep its own text colour, the refactor still works but stays
partly on the main thread.

**Fallback if this is never done:** the low tier already switches the clock to
`step-end`, so weak machines get four colour changes a minute instead of sixty a
second. This item is about the high tier.

**Partly banked, 2026-08-19 — the full item is still open.** The clock now runs
`steps(58, end)` on every tier, and `--sun-tilt` was split into its own `linear`
`@keyframes year-tilt` so the terminator's swing does not get quantised with the
colours. That halves the invalidations described above without touching the
palette or needing the design call below, so it is an interim measure, not this
item.

Two things to keep straight before treating it as more than that:

- **The step count is per keyframe interval, not per cycle.** A count picked
  against the 24s year lands on each ~2s interval instead and quietly does
  nothing. 58 is set against the 1.92s blend = ~33ms = every second frame.
- **It only buys anything during the blends.** Across a hold the from- and
  to-values are identical, so the properties were already not changing and
  already not repainting. Blends are 8% × 4 = a third of the cycle, so this is a
  2× cut on a third of the time — real, and much smaller than it first looks.
  The other two thirds are the globe's own rotation (item 2), which is where the
  idle cost actually is.

### 2. Globe spin as a DOM transform

*Pairs with item 1 — do not do this alone.*

`components/art/globe.tsx` currently spins a `<g>` inside the SVG. SVG group
transforms are not reliably compositor-promoted, and with a `clipPath`, `<use>`
references and gradients whose stops change every frame, Chrome falls back to
re-rastering on the main thread.

The restructure, worked out but not applied:

- Outer square container, unchanged in size and position.
- `.globe-disc` — inset `11.364%` (that is `(220-170)/440`, keeping the current
  proportions), `border-radius: 50%`, `overflow: hidden`. Replaces `clipPath`.
- Inside it, a `.globe-spin` div at `width: 400%` holding one SVG with
  `viewBox="0 0 720 180"` — two tiles side by side, aspect 4:1, so
  `preserveAspectRatio` needs no override. Animate `translate3d(-50%, 0, 0)`,
  which is exactly one tile. The 400% strip has 100% of slack; only 300% is
  needed for a seamless loop.
- The ocean, night, sheen, limb and atmosphere gradients become sibling divs
  with CSS gradients instead of SVG `<defs>`. Conversions:
  - ocean: `radial-gradient(78% 78% at 34% 28%, …)` — SVG `r="78%"` on a square
    bounding box is the same as CSS `78% 78%`.
  - night: a div at `left/top: -50%; width/height: 200%` with
    `linear-gradient(to right, …)` and `transform: rotate(var(--sun-tilt))`.
    That matches the current oversized rect exactly (`C-2R` is `-50%` of the
    disc, `4R` is `200%`).
  - limb and atmosphere: `radial-gradient(circle closest-side, …)`.
  - rim: a `1px` border on `.globe-disc` itself, replacing the stroked circle.
- Sri Lanka's marker stays inside the SVG, one per tile.

**Why it needs item 1 first:** the payoff is "rasterise once instead of every
frame", and that only happens once the layer's contents stop changing. The land
is `fill="var(--season-land)"`, which the year animation changes every frame —
so done alone, this would still re-raster every frame and would have taken the
visual risk of rewriting the hero's centrepiece for a fraction of the benefit.

### DONE, 2026-08-19 - with two corrections to the plan above

Applied in a reduced scope, and the plan as written would have failed in one
place and regressed in another. Both are worth keeping written down.

**The plan would have defeated itself.** It said "Sri Lanka's marker stays
inside the SVG, one per tile". `.sl-pulse` animates a transform, so an SVG
marker inside the moving layer changes that layer's contents every frame - and
a layer whose contents change every frame is re-rastered every frame, which is
the exact cost the restructure exists to remove. The marker is now three HTML
spans; its pulse composites separately and the map underneath stays cached.

**The rim could not become a CSS border.** `stroke-width: 1` is in viewBox
units, so it scales with the globe - about 3.6 real px at the desktop's 146vh.
`border: 1px` is 1px at every size, so the rim would have thinned visibly on
big screens. It stayed in SVG.

**Only two gradients moved to CSS**, not five: the halo and the ocean. Night,
sheen and limb do not move, so converting them would have been visual risk for
no gain; they are the original markup under the original `clipPath`, in a
`.globe-shell` SVG layered over the disc.

**Verified:**

- *Structurally*, which is the claim that matters and the one that is
  measurable anywhere. Via CDP `LayerTree.compositingReasons`: the original has
  NO layer for `g.globe-spin` at all, the rebuilt page has `div.globe-spin`
  4513x1128 (5.09 MP) with reasons `ActiveTransformAnimation,
  WillChangeTransform`. Total layer count is 59 either way, so nothing else got
  promoted as a side effect.
- *Visually*, by screenshot diff of both builds at six fixed points on the
  animation timeline: ~1% of pixels differ by >2/255 and 0.00-0.01% by >20, all
  of it antialiasing hairlines on coastline and marker edges. No structural or
  positional difference.

**What is NOT verified, and cannot be here:** the actual CPU saving. This
machine's headless Chrome rasterises through llvmpipe - software - where
compositing a 5MP texture costs about what painting it costs, so raster totals
came out the same on both builds (~8,600 RasterTasks either way). The saving is
a real-GPU effect and has to be confirmed on real hardware, by the recipe in
"How to measure" above.

**One number to keep an eye on:** the strip is 400% of the disc, so that layer
is ~5MP at 1600x1000 and scales with the viewport - roughly 20MB of texture,
more on a HiDPI display. Chrome tiles large layers and only keeps what is near
the viewport, so this has not been a problem, but it is the thing that would
show up as memory rather than as stutter.

**A note on measuring this at all.** Two instruments gave a confidently wrong
answer before the third gave a useful one, and the order matters if anyone
repeats this. `Performance.getMetrics` reports the MAIN thread, and rasterising
happens on the raster threads, so it showed no difference and would have shown
none even on a real GPU. A trace's `RasterTask` totals see every thread but are
meaningless under software rasterisation. Only the layer tree answers the
question the change is actually about.

### 3. Take `motion` out of the hero

`components/sections/hero.tsx` re-renders the entire hero every six seconds
because the season index is React state, and runs two `AnimatePresence` trees to
swap the phrase and the season line.

Render all four phrases and lines into the server HTML instead, stacked and
absolutely positioned, and drive enter/exit with one 24s keyframe per slot,
phase-offset by `animation-delay`. This matches what the file's own header
comment already says the hero's philosophy is — painted and readable straight
from the server HTML.

Deletes: the six-second full-Hero re-render, both `AnimatePresence` trees, and
`motion` from the hero's critical path. It also lets the hero's text go back to
being a **server component**, with only the particle field and the viewport
observer left as client islands.

Two things to check when doing this:

- `.season-underline` runs `underline-fill` for 6s and the season is 6s, and
  both animations start at page load, so four stacked faces stay phase-aligned
  without re-keying. Verify rather than assume.
- The headline's second line is `whitespace-nowrap` with `min-h-[1.15em]`.
  Absolutely positioning the faces takes them out of layout, so that min-height
  becomes load-bearing.

`SeasonParticles` still needs the index, so `useSeasonIndex` survives — but it
would be the only consumer.

### 4. `CursorGlow` still blends on the high tier

> **Measured 2026-08-19 as not worth doing — see the table above.**

`mix-blend-mode: multiply` on a fixed 704px element is a backdrop read per
frame. It is already hidden entirely on the low tier, and the expensive parts
are gone (it moves by transform now, and the `blur(90px)` filter was replaced
with a gradient falloff), so this is what is left.

It is kept because it is what lets one colour work over both the dark hero and
the pale sections below — over the hero it disappears, over paper it tints.
Removing it means a visible pale blob crossing the globe, so this needs a
replacement idea rather than a deletion.

---

## Rest of the page

### 5. `content-visibility: auto` on below-fold sections

**Best value-for-effort item on this list.** Add `content-visibility: auto` plus
a `contain-intrinsic-size` estimate to each section below the fold. The browser
then skips layout, style and paint for them entirely until they are near the
viewport. This is the general fix for scroll cost across the whole page.

`contain-intrinsic-size` has to be roughly right or the scrollbar jumps as
sections are realised — measure each section's rendered height and use that.

### 6. Grain overlay still blends on the high tier

> **Measured 2026-08-19 as not worth doing — see the table above.**

`.grain-overlay` in `app/globals.css` is `position: fixed`, full viewport,
`mix-blend-mode: multiply`, `z-index: 60`, over everything. Its backdrop changes
on every scroll frame, so the whole viewport is re-blended per scrolled frame.

Already dropped on the low tier. For the high tier the options are: use plain
opacity instead of `multiply`; or move the grain into each section's own
background so it is not a fixed layer over a scrolling page. Both change the
look slightly — design call.

### 7. `ScrollProgress` → CSS scroll-driven animation

`components/motion/primitives.tsx` runs `useScroll` plus a `useSpring`, so a rAF
spring stays alive during and after every scroll, to drive a `scaleX` on a 2px
bar. Replace with `animation-timeline: scroll(root)` behind
`@supports (animation-timeline: scroll())`, which runs entirely off the main
thread with no JavaScript at all.

### 8. `LazyMotion` + `domAnimation`

The header and the section reveal primitives still import the full `motion`
bundle. Switching to `LazyMotion` with the `domAnimation` feature set and `m.*`
components roughly halves it — which is parse and execute time on exactly the
devices this whole exercise is about.

### 9. `Reveal` / `Stagger` still run `whileInView` per section

Every section below the fold mounts a `motion` component with a viewport
observer. Once item 8 is done, consider whether these can be CSS
`animation-timeline: view()` instead, which would remove the last of the
scroll-driven JavaScript.

### 10. Small ones

- **Drop `text-rendering: optimizeLegibility`** from `body` in `app/globals.css`.
  It forces kerning and ligature processing across all text; a documented
  low-end footgun that modern browsers make redundant.
- **Disable `scroll-behavior: smooth` on the low tier.** Main-thread smooth
  scrolling amplifies perceived jank. One rule under `[data-perf="low"]`.
- **Font loading.** Two variable families at `display: swap` with no preload —
  the hero headline can relayout mid-read on a slow connection. Worth a look at
  preloading them or moving to `display: optional`.

---

## Smooth scroll — added, and the rules it lives under

`components/motion/smooth-scroll.tsx` runs Lenis. It is in this document rather
than in the "done" pile because it is the one item here that **costs**
performance rather than saving it, and the constraints around it are what keep
that cost from reaching the people who cannot afford it.

The trade: native scrolling runs on the **compositor thread** and stays smooth
even when the main thread is busy. Every scroll-smoothing library moves
scrolling onto the main thread. That is fine on a capable machine and actively
harmful on a weak one.

So it runs **only** on the high tier, never under `prefers-reduced-motion`, and
never on touch. The tier is watched with a `MutationObserver` rather than read
once, so a demotion by `PerfWatchdog` several seconds in tears the scroller back
out mid-session.

Things not to change without understanding why they are set:

- **`duration: 0.9`, not Lenis's 1.2 default.** Past about a second the page
  keeps gliding after the reader has stopped asking, which reads as lag rather
  than weight.
- **`syncTouch: false`.** Phones already have momentum. Smoothing on top feels
  wrong and costs main-thread time on the devices least able to spare it.
- **Lenis specifically, not Locomotive or GSAP ScrollSmoother.** Those two move
  the document inside a transformed wrapper, and a transform creates a
  containing block — the fixed header and the journey section's sticky pinning
  would both break. Lenis lerps and calls `window.scrollTo`, so real scroll
  position, real scrollbar, real anchors, and every IntersectionObserver on the
  page keeps working.
- **`html.lenis { scroll-behavior: auto }`.** Lenis drives the position frame by
  frame with `window.scrollTo`, which obeys `scroll-behavior`. Leaving it
  `smooth` means two easings fighting over the same pixels. The unscoped
  `scroll-behavior: smooth` stays for everyone not getting Lenis.
- **The mobile menu locks it.** `setScrollLocked` stops Lenis alongside the
  `overflow: hidden` on body — the latter alone does not stop Lenis, which
  keeps its own position and would drive the page under the overlay.

Worth revisiting if it ever feels wrong: `duration`, and whether the expo-out
easing is right. Everything else is structural.

---

## Dropped, and why

**Capping the globe's raster size** by rendering small and scaling up with
`transform: scale()`. Chrome rasterises a composited layer at its effective
transform scale, so scaling up does not cap anything — and the globe sits at
`right-[-22%]`, so the off-screen part was never being rastered in the first
place. The reliable version of "cap the raster" is "make it visually smaller",
which is a design change, not an optimisation.

**A WebGL globe.** Genuinely faster per frame and it would fix the projection
(see below), but: ~150KB of library to parse on the devices being optimised for,
a blank canvas until shaders compile, software-rendering fallback on blocklisted
drivers and corporate VMs, and it needs a texture asset, which fights the
offline-on-a-projector constraint. If the 3D look is wanted, the right place for
it is as a high-tier enhancement with the raster globe as the floor — never as
the only globe.

---

## Not performance, but noticed on the way

The globe reads as odd because it is a flat equirectangular map behind a
circular window, not a sphere. Two specific tells:

- **The poles are smeared.** Equirectangular maps latitude linearly to y, so
  Antarctica occupies the bottom **15% of the disc as a solid full-width band**
  and Greenland is enormous. On a real sphere seen from the equator, Antarctica
  should be a thin compressed crescent hugging the limb.
- **Nothing compresses toward the left and right edges,** so it reads as a map
  in a circle rather than a curved surface.

The first is nearly free to fix: a sphere places latitude at `y = R·sin(φ)`, not
`y = R·φ/90`. Warping the latitudes in `scripts/generate-globe.mjs` before
projecting keeps it a cylindrical projection — so it still tiles and scrolls
seamlessly — and costs nothing at runtime. Antarctica would drop from 15% of the
disc to about 6.7%, compressed against the bottom edge where it belongs, and
Greenland halves. Everything near the equator, including Sri Lanka, barely
moves.

The second cannot be done with a scrolling strip; it needs a per-pixel warp.
Options are a stronger limb-darkening gradient to hide the uncompressed edges,
pre-rendered orthographic frames (correct, but the stepping is visible at 54s
per revolution unless adjacent frames are cross-faded), or WebGL.

Deferred by choice — the current look was accepted for now.
