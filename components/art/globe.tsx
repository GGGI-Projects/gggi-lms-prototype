import { GLOBE_LAND, GLOBE_GRATICULE } from "./globe-geometry";

/**
 * A rotating Earth.
 *
 * Built from inline SVG rather than WebGL or a textured image: the prototype
 * has to run offline on a projector, so it makes no network request and pulls
 * in no 3D library. Real Natural Earth coastlines, so the continents are
 * recognisable rather than decorative blobs.
 *
 * The rotation is an equirectangular world map tiled twice and scrolled
 * horizontally behind a circular mask. That is an approximation - a true
 * sphere would compress the continents towards the limb - but with the
 * limb-darkening and highlight layers on top it reads convincingly as a
 * turning globe, at a fraction of the cost.
 *
 * Pure CSS animation, so no client JS ships for it and `prefers-reduced-motion`
 * (handled globally in globals.css) simply leaves the Earth still.
 *
 * ==========================================================================
 * WHY THIS IS FOUR ELEMENTS AND NOT ONE <svg>
 * ==========================================================================
 *
 * It used to be a single SVG, with the map on a `<g>` that translated inside a
 * `clipPath`, gradients painted over it from `<defs>`. Visually that was fine.
 * It was also the most expensive thing on the page by a wide margin, and the
 * reason is structural rather than a matter of tuning:
 *
 *   A TRANSFORM ON A GROUP INSIDE AN SVG IS NOT COMPOSITED. The browser cannot
 *   promote a `<g>` to its own GPU layer, so "the map moved" is not a texture
 *   slide - it is a full re-raster of every path in the SVG, on the CPU main
 *   thread, sixty times a second, at whatever size the hero is showing. At the
 *   desktop's 146vh that is a ~1,500px disc and ~2,900 path commands, and it
 *   is enough to hold a core at 100% while the page just sits there.
 *
 * So the moving part is now an ordinary `<div>` with a `transform` animation,
 * which the browser DOES promote: the map is rasterised once into a texture and
 * every frame after that is a matrix multiply on the GPU.
 *
 * The layers, back to front - the same order the single SVG painted in:
 *
 *   .globe-halo   the atmosphere, outside the disc            (CSS gradient)
 *   .globe-disc   the circular clip, ocean as its background  (CSS gradient)
 *     .globe-spin THE ONLY MOVING THING - two map tiles       (SVG, static)
 *   .globe-shell  night, sheen, limb and the rim              (SVG, unchanged)
 *
 * Two rules keep that arrangement worth anything, and both are easy to undo by
 * accident:
 *
 *   NOTHING INSIDE `.globe-spin` MAY CHANGE PER FRAME. The payoff is a texture
 *   that survives between frames, and anything animating inside it takes that
 *   away - the layer is re-rastered and we are back where we started, having
 *   paid for the restructure and got nothing. This is why the Sri Lanka marker
 *   below is built from `<div>`s rather than SVG circles: its pulse is a
 *   `transform`, and only an HTML element gets that promoted to a layer of its
 *   own instead of dirtying the map around it.
 *
 *   THE LAND'S COLOUR IS THE OTHER HALF, and it lives in globals.css. `fill`
 *   reads `--season-land`, which the year animation changes; while that is
 *   changing the texture cannot be reused however it is structured. See the
 *   `steps()` note on `.season-clock` - that is what makes this layer static
 *   for most of the cycle rather than never.
 *
 * Only two gradients moved to CSS (the halo and the ocean); night, sheen, limb
 * and the rim are still the original SVG markup, clipped by the original
 * `clipPath`, because they do not move and converting them would have been
 * visual risk taken for no gain. The rim in particular has to stay: its
 * `stroke-width` is in viewBox units, so it scales with the globe, and a CSS
 * `border` of any px value would go visibly thinner as the hero gets bigger.
 */

const MAP_W = 360; // source map width, in its own units
const MAP_H = MAP_W / 2; // equirectangular is always 2:1
const R = 170; // globe radius, in viewBox units
const C = 220; // globe centre, in viewBox units

/** Scale that made the map's height match the globe's diameter. */
const SCALE = (R * 2) / MAP_H;

/**
 * The disc, as a share of the 440-unit square it sits in. Both the clip and
 * the halo are placed from this so the proportions cannot drift from the
 * `clipPath` that still lives in the shell below.
 */
const DISC_INSET = ((C - R) / (C * 2)) * 100; // 11.3636%
const HALO_INSET = ((C - 215) / (C * 2)) * 100; // 1.1364%

/**
 * Sri Lanka in map units, from its real coordinates:
 *   x = (180 + 80.77) / 360 * 360,  y = (90 - 7.87) / 180 * 180
 */
const SRI_LANKA = { x: 260.8, y: 82.1 };

/** Two tiles side by side: the strip is 720 x 180, an exact 4:1. */
const TILES = [0, 1];
const STRIP_W = MAP_W * TILES.length;

/**
 * One old viewBox unit, expressed in `cqh` - 1% of the disc's height, which
 * `.globe-disc` provides by being a size container.
 *
 * The marker is HTML now, so its geometry can no longer ride on the SVG's
 * viewBox and would otherwise have to be written in px - which does not scale,
 * and this globe is anywhere from 78vh to 146vh. Container units restore the
 * one property the viewBox was giving us for free, so every number below is
 * still the original SVG value and is still exact at any size.
 */
const UNIT = 100 / (R * 2); // cqh per viewBox unit
const cqh = (mapUnits: number) => `${(mapUnits * SCALE * UNIT).toFixed(4)}cqh`;

/** Marker radii, in the same map units the SVG circles used. */
const SL_PULSE_R = 4.5;
const SL_RING_R = 3;
const SL_RING_STROKE = 0.7;
const SL_DOT_R = 1.5;

export function Globe({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`globe ${className ?? ""}`}>
      {/* Atmospheric halo, sitting just outside the disc. Painted first, so
          the opaque ocean covers the part of it that falls inside the limb -
          exactly as the SVG circle it replaces did. */}
      <div className="globe-halo" />

      {/* The disc. Circular clip and the deep ocean, lit from the upper left. */}
      <div className="globe-disc">
        {/* The turning surface. Two copies of the map, so that translating by
            exactly one of them loops seamlessly. This is the layer whose whole
            job is to hold still internally and move as a unit. */}
        <div className="globe-spin">
          <svg
            className="globe-map"
            viewBox={`0 0 ${STRIP_W} ${MAP_H}`}
            fill="none"
          >
            <defs>
              {/* Emitted once, referenced once per tile copy. */}
              <path id="globe-land" d={GLOBE_LAND} />
              <path id="globe-graticule" d={GLOBE_GRATICULE} />
            </defs>

            {TILES.map((copy) => (
              <g key={copy} transform={`translate(${copy * MAP_W} 0)`}>
                <use
                  href="#globe-graticule"
                  fill="none"
                  stroke="var(--season-land)"
                  strokeWidth={0.45}
                  opacity={0.16}
                />

                {/* ONE draw of the coastline, not two.
                    The fill and the outline used to be separate <use> elements,
                    each carrying an element-level `opacity` - which meant the
                    1,397-command land path was walked twice per tile.
                    `fill-opacity` and `stroke-opacity` set the same two values
                    per paint operation instead, so one element does both.
                    Default `paint-order` is fill then stroke, which is the
                    order they were stacked in. */}
                <use
                  href="#globe-land"
                  fill="var(--season-land)"
                  fillOpacity={0.9}
                  stroke="var(--season-land)"
                  strokeOpacity={0.55}
                  strokeWidth={0.25}
                />
              </g>
            ))}
          </svg>

          {/* Sri Lanka, at its real coordinates, once per tile - so it swings
              into view once per rotation and passes through the terminator
              into night with no extra logic, the night overlay simply being
              painted on top of it.

              HTML rather than SVG circles, and that is the load-bearing part:
              `.sl-pulse` animates a transform, and inside the moving layer an
              SVG element would dirty the map on every frame of it. As a div it
              gets its own compositor layer and the map underneath stays a
              cached texture. See the note at the top of this file. */}
          {TILES.map((copy) => (
            <div
              key={copy}
              className="sl-marker"
              style={{
                left: `${(((copy * MAP_W + SRI_LANKA.x) / STRIP_W) * 100).toFixed(4)}%`,
                top: `${((SRI_LANKA.y / MAP_H) * 100).toFixed(4)}%`,
              }}
            >
              <span
                className="sl-pulse"
                style={{ width: cqh(SL_PULSE_R * 2) }}
              />
              <span
                className="sl-ring"
                style={{
                  width: cqh((SL_RING_R + SL_RING_STROKE / 2) * 2),
                  borderWidth: cqh(SL_RING_STROKE),
                }}
              />
              <span className="sl-dot" style={{ width: cqh(SL_DOT_R * 2) }} />
            </div>
          ))}
        </div>
      </div>

      {/* Everything painted over the map, in the original viewBox and still
          clipped by the original circle - so the night, the sheen and the limb
          are the same markup and the same numbers they always were. None of it
          moves, so none of it needs to leave the SVG. */}
      <svg className="globe-shell" viewBox="0 0 440 440" fill="none">
        <defs>
          <clipPath id="globe-clip">
            <circle cx={C} cy={C} r={R} />
          </clipPath>

          {/* Night side. The terminator is fixed relative to the viewer and the
              continents scroll beneath it - which is what actually happens. */}
          <linearGradient id="globe-night" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--season-ground)" stopOpacity="0" />
            <stop offset="44%" stopColor="var(--season-ground)" stopOpacity="0" />
            <stop offset="60%" stopColor="var(--season-ground)" stopOpacity="0.55" />
            <stop offset="80%" stopColor="var(--season-ground)" stopOpacity="0.88" />
            <stop offset="100%" stopColor="var(--season-ground)" stopOpacity="0.94" />
          </linearGradient>

          {/* Specular sheen near the light source. */}
          <radialGradient id="globe-sheen" cx="32%" cy="26%" r="55%">
            <stop offset="0%" stopColor="var(--season-text)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--season-text)" stopOpacity="0" />
          </radialGradient>

          {/* Limb darkening - the single biggest cue that this is a sphere. */}
          <radialGradient id="globe-limb" cx="50%" cy="50%" r="50%">
            <stop offset="58%" stopColor="var(--season-ground)" stopOpacity="0" />
            <stop offset="88%" stopColor="var(--season-ground)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--season-ground)" stopOpacity="0.92" />
          </radialGradient>
        </defs>

        <g clipPath="url(#globe-clip)">
          {/* Day/night boundary. Its tilt is the sun's declination, which the
              year animation drives from +23.4deg at the June solstice to
              -23.4deg in December, passing through vertical at the equinoxes. */}
          <g className="globe-terminator">
            <rect
              x={C - R * 2}
              y={C - R * 2}
              width={R * 4}
              height={R * 4}
              fill="url(#globe-night)"
            />
          </g>

          <circle cx={C} cy={C} r={R} fill="url(#globe-sheen)" />
          <circle cx={C} cy={C} r={R} fill="url(#globe-limb)" />
        </g>

        {/* Crisp rim, so the disc reads against the dark background. In viewBox
            units, so it thickens with the globe - which a CSS border cannot. */}
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="var(--season-accent)"
          strokeOpacity={0.28}
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}

/** Shared with globals.css, which places the disc and the halo from these. */
export const GLOBE_LAYOUT = { DISC_INSET, HALO_INSET };
