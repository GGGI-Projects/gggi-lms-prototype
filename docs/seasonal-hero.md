# The Seasonal Hero - implementation spec

Scope: **header + hero only.** Nothing below the hero changes. The header logo
stays exactly as it is (no real logo exists yet).

---

## 1. The idea, stated properly

The weak version of this feature is "the background colour changes every few
seconds and the words swap." That is a gimmick bolted onto a template, and it
will look like every other animated hero on the web.

The strong version is this:

> **The hero is not a page. It is a view of the Earth, and time is passing.**

Everything visible - the light, the sky, the words, the shadow across the
globe - is the output of one simulated moment in the year. When that moment
advances, everything moves together because they are all reading the same
clock. Nothing is decoration; every animated thing is a _readout_.

That reframing is what makes it not-typical, and it drives every decision
below. The test for any addition: **does this express the passage of the year,
or is it just moving?** If the latter, cut it.

---

## 2. Seven moves that make it not a typical landing page

These are the parts worth building. Ranked by impact per unit of effort.

### 2.1 The globe is oversized, cropped, and behind the type

Today the globe is a polite circle sitting in a 5-of-12 column. That is the
template arrangement - text left, picture right - and it is the single biggest
reason the hero still reads as ordinary.

Instead: the globe becomes **~130–160% of the viewport height**, positioned so
its limb is cut off by the right and bottom edges of the viewport. The headline
sits _over_ the globe's edge, with the type in front and the Earth behind it.

This one change does more than any colour work. It stops being an illustration
in a slot and becomes the environment the page sits in.

- The globe's centre sits off-canvas, around `115%` left / `55%` top.
- The type column keeps its current left edge (`px-fluid`) and its measure.
- On narrow screens the globe drops to a horizon band across the bottom third
  rather than a circle - see §7.

### 2.2 Real solar geometry, not a colour filter

The seasons are driven by one physical quantity: **the sun's declination**,
which runs from −23.4° at the December solstice to +23.4° in June.

Derive everything from it:

| Season            | Declination | Terminator tilt | Sun altitude at Sri Lanka |
| ----------------- | ----------- | --------------- | ------------------------- |
| Spring (equinox)  | 0°          | vertical        | high                      |
| Summer (solstice) | +23.4°      | tilted right    | overhead                  |
| Autumn (equinox)  | 0°          | vertical        | high                      |
| Winter (solstice) | −23.4°      | tilted left     | lower, from the south     |

The visible consequence: **the day/night terminator across the globe tilts back
and forth through the year.** Almost nobody does this, it is quietly, verifiably
correct, and on a climate-education platform that accuracy is worth something.

Because the terminator is fixed relative to the viewer and the continents
scroll beneath it, land passes through night and back into day as the Earth
turns - which is what actually happens.

### 2.3 Sri Lanka is pinned on the globe

A small marker at Sri Lanka's real coordinates, scrolling with the map, so it
swings into view once per rotation and passes through the terminator.

In the existing 360 × 180 equirectangular map (`components/art/globe-geometry.ts`):

```
lon  80.77°E, lat 7.87°N
x = (180 + 80.77) / 360 * 360 = 260.8
y = (90  -  7.87) / 180 * 180 =  82.1
```

Place at `(260.8, 82.1)` inside **both** tiled copies of the map group.

When it is on the lit side it glows in the season accent; on the night side it
dims to a faint point. It is the one thing on the globe that is _about the
visitor_, and it rewards watching.

### 2.4 The underline is the clock

The accent underline beneath the changing phrase is not a static rule - it
**fills left-to-right over the six seconds of the season, then resets.**

One element doing two jobs: it is the typographic accent _and_ the progress
indicator that tells you something is about to change. It removes the need for
a separate progress bar, and it is the kind of detail that makes people look
twice.

### 2.5 Season changes arrive as a light sweep, not a crossfade

A crossfade between two background colours is what every template does.

Instead, the new season **wipes across the hero on a diagonal**, following the
terminator's angle - like a line of weather crossing the country, or dawn
arriving. A soft-edged gradient band travels across the full bleed over about
900ms, and the colour tokens transition underneath it so the sweep appears to
be _carrying_ the new season in.

Same cost as a crossfade. Completely different impression.

### 2.6 A year ribbon across the top of the header

A hairline strip at the very top edge of the viewport, above the header
content, divided into four segments. The current season's segment fills as its
six seconds elapse; completed segments stay lit at low opacity.

It is a calendar for the page. It also solves three real problems at once:

- It tells a visitor who looked away that the page has state.
- It is the **manual control** - click a segment to jump to that season. This
  is how the prototype gets demoed to the client without waiting 24 seconds
  for winter.
- It gives reduced-motion users access to all four states.

### 2.7 Each season carries one real fact

A small line of factual data per season - rainfall, solar irradiance, the
monsoon's dates. Not decoration: it signals to a ministry audience that this
platform deals in real numbers, inside the first five seconds.

Keep it to one short line, set small and quiet.

---

## 3. The year runs continuously

An earlier version of this spec paused the whole year while the pointer was
over the hero copy. **That was removed on request** - the year now runs
uninterrupted, and nothing the visitor does slows it down.

Consequence worth knowing: the seasonal line can swap while someone is
part-way through reading it. Two things already limit the damage - the line is
deliberately short (one sentence, absorbable inside the six-second dwell), and
the headline's opening and the standing paragraph never move, so the core
message is always stable. If it proves annoying in front of the client, the
cheapest fixes are a longer dwell or pausing on the ribbon rather than the copy.

## 4. Architecture: one clock, CSS-owned

The single most important technical decision.

**The CSS animation is the source of truth. JavaScript is a passenger.**

If the season ran off a `setInterval` while the globe ran off CSS, the two
would drift apart - browsers throttle timers and animations differently in
background tabs, and after a few minutes the "season" would no longer match the
light on the globe. Avoid the whole class of bug by never having two clocks.

### 4.1 Registered custom properties

Plain custom properties cannot be animated. Registered ones can:

```css
@property --season-ground {
  syntax: "<color>";
  inherits: true;
  initial-value: …;
}
@property --season-ground-2 {
  syntax: "<color>";
  inherits: true;
  initial-value: …;
}
@property --season-accent {
  syntax: "<color>";
  inherits: true;
  initial-value: …;
}
@property --season-text {
  syntax: "<color>";
  inherits: true;
  initial-value: …;
}
@property --season-text-muted {
  syntax: "<color>";
  inherits: true;
  initial-value: …;
}
@property --season-ocean {
  syntax: "<color>";
  inherits: true;
  initial-value: …;
}
@property --season-land {
  syntax: "<color>";
  inherits: true;
  initial-value: …;
}
@property --sun-tilt {
  syntax: "<angle>";
  inherits: true;
  initial-value: 0deg;
}
@property --sun-altitude {
  syntax: "<number>";
  inherits: true;
  initial-value: 0.5;
}
```

One `@keyframes year` animates **all of them together** on the hero root. Every
element underneath - header links, CTA pill, underline, globe ocean and land,
the terminator's rotation, the sky gradient - just references
`var(--season-accent)` and follows for free.

Consequences worth understanding:

- **One animated element**, not forty. Cheap.
- No component needs to become a `motion` component to change colour.
- The globe, the header and the type cannot fall out of step. It is
  structurally impossible.

**Two animations carry it, not one.** The seven colours run under
`steps(58, end)`, because a changed *inherited* custom property re-resolves the
whole subtree below it and repaints everything that paints with it: the sky
gradient, the scrim's `color-mix()`, the particles, and the globe's land path.

The count is **per keyframe interval, not per cycle** - an
`animation-timing-function` on the element applies between each adjacent pair
of keyframes. Only the blends matter (across a hold the from- and to-values are
equal, so nothing changes and there is nothing to skip), and a blend is 8% of
24s = 1.92s. `steps(58)` is therefore ~33ms: a new palette every second frame
at 60Hz, so half the invalidations for the third of the cycle that is blending.
Two frames rather than the usual 50ms rule of thumb because this is a large
flat area of colour, where a step is easier to catch than it is on something
moving.

`--sun-tilt` is the exception and runs `linear` on its own `@keyframes
year-tilt`, same duration and same percentages. It is geometry, not colour:
23.4deg over 2s, applied at the globe's full on-screen radius, so the step
interval that hides a colour change moves a soft edge several pixels at the
limb and reads as ratcheting. Anything added to the palette belongs in `year`;
anything that moves belongs in `year-tilt`, and in `CLOCKED` in
`use-season.ts` so a manual jump keeps them together.

### 4.2 Hold, then blend

Do not interpolate linearly across the whole cycle, or the colours are never
actually _at_ a season - they are permanently mid-morph.

```
  0%, 17%   spring      (≈4.1s hold)
 25%, 42%   summer
 50%, 67%   autumn
 75%, 92%   winter
100%        spring  (loops seamlessly)
```

That is roughly a 4-second settle and a 2-second blend per season, inside a
24-second year.

### 4.3 How JavaScript learns the season

```
hero.getAnimations()
  → find the `year` animation
  → read .currentTime
  → index = floor((t % 24000) / 6000)
```

Schedule a timeout to the next boundary rather than running a rAF loop -
re-reading `currentTime` each time means it self-corrects and never drifts.
When the animation is paused, `currentTime` stops advancing and the index
naturally holds.

### 4.4 Timing, and the globe-speed decision

One revolution = one year = 24s (4 × 6s).

That takes the globe from its current 54s per turn to 24s - 2.25× faster. It
may read as _spinning_ rather than _turning_.

If it does, the fix is one number and it does **not** break sync: set the globe
to **48s**, so one revolution covers two years. Both remain CSS animations at a
2:1 duration ratio starting from the same timeline origin, so they stay in
permanent lockstep - the seasons simply cycle twice per turn.

Build at 24s, look at it, decide.

---

## 5. Colour

Deliberately **not locked** - treat the values below as a starting point and
tune them in place. What matters is the _structure_, which the tokens in §4.1
already fix.

Two rules that are not negotiable:

1. **All four grounds stay dark.** Season identity comes from hue, not
   lightness. If winter is dark and spring is light, every text colour has to
   flip, the header strobes, and there is a moment of unreadable text on every
   single cycle.
2. **Contrast is verified per season, not once.** Body text ≥ 4.5:1 against its
   ground, display text and the accent underline ≥ 3:1. Four seasons × every
   text role. A palette that passes in spring and fails in autumn is a bug.

Starting proposal - grounds as _sky_, accents as _light_:

| Season | Ground    | Ground 2  | Accent    | Ocean     | Land      |
| ------ | --------- | --------- | --------- | --------- | --------- |
| Spring | `#0B2B24` | `#12463A` | `#5FE0A8` | `#0E3A31` | `#8FE3BE` |
| Summer | `#07243F` | `#0D3E63` | `#FFC53D` | `#0B3355` | `#7FC9E8` |
| Autumn | `#2B1712` | `#4A2A18` | `#FF8A3C` | `#3A2116` | `#E8B481` |
| Winter | `#0E1730` | `#1A2B52` | `#8FD0FF` | `#132244` | `#A9C4E8` |

Hue journey: green → blue → amber → indigo → green. Every adjacent pair blends
through a plausible intermediate, so the transitions never pass through mud.

---

## 6. Content

The headline's opening is **fixed** - `Build the foundations of Sri Lanka's` -
so the core message never moves. Only the underlined phrase and one short line
change.

Each season maps to a real module, so the rotation quietly previews the
curriculum instead of just decorating. A visitor who watches two cycles has
learned four of the five subject areas without scrolling. Spring is
`SEASONS[0]` - the canonical phrase server HTML and screen readers get, and
what the rotation opens on - so it carries the phrase that should be seen
first.

| Season | Phrase             | Short line                                                | Fact                    |
| ------ | ------------------ | ---------------------------------------------------------- | ----------------------- |
| Spring | climate financing  | New growth - where a bankable case gets built.              | Inter-monsoon · Mar–Apr |
| Summer | social inclusion   | Consultation season - when a plan asks who was left out.    | Mid-year · Jun–Aug      |
| Autumn | adaptation planning | Dry season - when a provincial plan gets costed.             | Second inter-monsoon    |
| Winter | climate resilience | Monsoon - when resilience is tested, not theorised.          | ~1,800 mm rainfall      |

Phrase lengths are 16–18 characters, so the headline will not reflow as they
swap. Reserve `min-height` on both the headline block and the short line
anyway, so nothing below shifts.

The four-line paragraph beneath **does not change.**

### Seasonal particles - Sri Lankan, not imported

| Season | Effect                             |
| ------ | ---------------------------------- |
| Spring | Drifting new leaves, rising slowly |
| Summer | Heat shimmer and slow sun motes    |
| Autumn | Dry-season dust on a lateral drift |
| Winter | Monsoon rain, steep and fast       |

No snow. Roughly 18–24 elements, CSS transforms only, colour from
`--season-accent`, cross-faded on season change.

---

## 7. Responsive behaviour

| Width      | Layout                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `< 640`    | Globe becomes a horizon arc across the bottom third; type full width above it; particles reduced to ~10; ribbon full-bleed under the header |
| `640–1023` | Globe cropped bottom-right at ~90vh; type above and left                                                                                    |
| `≥ 1024`   | Full treatment - oversized globe cropped right and bottom, type over the limb                                                               |

The header already hands off to the mobile menu at `lg`, which matches.

---

## 8. Accessibility and resilience

- **Rotating text is `aria-hidden`.** One canonical, static version of the
  headline and subhead is exposed to screen readers, so nothing is announced
  every six seconds.
- **Reduced motion** - the global rule in `globals.css` already zeroes
  animation duration _and_ delay. The result: the hero settles on spring,
  static and fully legible. The year ribbon stays clickable, so all four
  seasons remain reachable.
- **No JS** - the colours, the light sweep, the globe and the underline fill
  are all CSS. Only the _text swap_ needs JavaScript. A visitor with broken or
  slow JS sees a fully animated, fully readable hero that happens to stay on
  spring.
- **SSR** - the server renders season 0's text. Crawlers and first paint get
  real content. Keep the `grep -c 'opacity:0'` check at zero.
- **Pointer** - particles are pointer-fine only.

---

## 9. Files

| Path                                   | Change                                                                                 |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| `content/seasons.ts`                   | **new** - four palettes, copy, facts, particle config. One file to retune everything.  |
| `app/globals.css`                      | `@property` registrations, `@keyframes year`, sweep and underline-fill keyframes       |
| `components/sections/hero.tsx`         | Layout rewrite: oversized globe, type over the limb, season text via `AnimatePresence` |
| `components/site/site-header.tsx`      | Colours read from season tokens; year ribbon added. **Logo untouched.**                |
| `components/art/globe.tsx`             | Ocean/land from season tokens; terminator with `--sun-tilt`; Sri Lanka marker          |
| `components/hero/year-ribbon.tsx`      | **new** - segmented progress + manual control                                          |
| `components/hero/season-particles.tsx` | **new**                                                                                |

Nothing below the hero is touched.

---

## 10. Build order

Each step is independently checkable. Stop and look at the page after each.

1. **Tokens and clock.** `@property` registrations, `@keyframes year`, applied
   to the hero root. Verify colours cycle and hold correctly with no JS at all.
2. **Globe repositioning.** Oversized, cropped, behind the type. This is the
   big visual change - evaluate before going further, and settle the 24s/48s
   question here.
3. **Solar geometry.** Terminator with seasonal tilt, Sri Lanka marker.
4. **Season text.** `AnimatePresence`, clock-derived index, hover-to-hold.
5. **Underline fill + year ribbon**, including click-to-jump.
6. **Light sweep** on season change.
7. **Particles.**
8. **Verification pass** - contrast across all four seasons × every text role,
   reduced motion, no-JS, SSR content, 390 / 900 / 1440 / 1853 widths.

---

## 11. Risks

| Risk                                   | Mitigation                                                                                                                                                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@property` support                    | Chrome 85+, Safari 16.4+, Firefox 128+. Fine in 2026. Initial values are a valid static palette, so an unsupporting browser gets a correct non-animating hero.                                                   |
| Animating custom properties inside SVG | Verify early - step 1 covers the globe's ocean/land. Fallback is to set the SVG's colours from a parent `color` / `fill` chain instead.                                                                          |
| Type over the globe loses contrast     | The terminator's night side sits under the type by design. Add a soft ground-coloured scrim behind the copy column, and verify contrast at all four seasons _with the globe behind it_, not against flat colour. |
| Globe reads as spinning at 24s         | Documented one-number fix in §4.4.                                                                                                                                                                               |
| Layout shift on phrase swap            | Fixed-length phrases plus reserved `min-height`. Verify by measuring the paragraph's `top` across all four states.                                                                                               |
| Particles cost on old machines         | Cap at ~24 elements, transforms only, reduced on small screens, off under reduced motion.                                                                                                                        |

---

## 12. Out of scope

- The header logo - unchanged until a real one exists.
- Everything below the hero.
- The five-module set: only four have seasonal slots. Gender-Responsive
  Budgeting is covered in the modules section, not forced into a fifth
  state that would break the four-season metaphor.
