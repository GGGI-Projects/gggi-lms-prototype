import { GLOBE_LAND, GLOBE_GRATICULE } from "./globe-geometry";

/**
 * A rotating Earth.
 *
 * Built as inline SVG rather than WebGL or a textured image: the prototype has
 * to run offline on a projector, so it makes no network request and pulls in no
 * 3D library. Real Natural Earth coastlines, so the continents are recognisable
 * rather than decorative blobs.
 *
 * The rotation is an equirectangular world map tiled twice and scrolled
 * horizontally behind a circular mask. That is an approximation - a true
 * sphere would compress the continents towards the limb - but with the
 * limb-darkening and highlight layers on top it reads convincingly as a
 * turning globe, at a fraction of the cost.
 *
 * Pure CSS animation, so no client JS ships for it and `prefers-reduced-motion`
 * (handled globally in globals.css) simply leaves the Earth still.
 */

const MAP_W = 360; // source map width, in its own units
const MAP_H = MAP_W / 2; // equirectangular is always 2:1
const R = 170; // globe radius, in viewBox units
const C = 220; // globe centre, in viewBox units

/** Scale that makes the map's height match the globe's diameter. */
const SCALE = (R * 2) / MAP_H;
/** Width of one projected copy of the map - also the loop distance. */
const TILE = MAP_W * SCALE;

/**
 * Sri Lanka in map units, from its real coordinates:
 *   x = (180 + 80.77) / 360 * 360,  y = (90 - 7.87) / 180 * 180
 */
const SRI_LANKA = { x: 260.8, y: 82.1 };

export function Globe({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 440 440"
      fill="none"
    >
      <defs>
        {/* Emitted once, referenced once per tile copy. */}
        <path id="globe-land" d={GLOBE_LAND} />
        <path id="globe-graticule" d={GLOBE_GRATICULE} />

        <clipPath id="globe-clip">
          <circle cx={C} cy={C} r={R} />
        </clipPath>

        {/* Deep ocean, lit from the upper left. */}
        <radialGradient id="globe-ocean" cx="34%" cy="28%" r="78%">
          <stop offset="0%" stopColor="var(--season-ocean)" />
          <stop offset="62%" stopColor="var(--season-ground-2)" />
          <stop offset="100%" stopColor="var(--season-ground)" />
        </radialGradient>

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

        {/* Atmospheric halo, sitting just outside the disc. */}
        <radialGradient id="globe-atmosphere" cx="50%" cy="50%" r="50%">
          <stop offset="74%" stopColor="var(--season-accent)" stopOpacity="0" />
          <stop offset="86%" stopColor="var(--season-accent)" stopOpacity="0.22" />
          <stop offset="94%" stopColor="var(--season-accent)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="var(--season-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={C} cy={C} r={215} fill="url(#globe-atmosphere)" />

      <g clipPath="url(#globe-clip)">
        <circle cx={C} cy={C} r={R} fill="url(#globe-ocean)" />

        {/* The turning surface. Two copies of the map, translated by exactly
            one tile width, so the loop is seamless. */}
        <g
          className="globe-spin"
          style={{ "--globe-tile": `${TILE}px` } as React.CSSProperties}
        >
          {[0, 1].map((copy) => (
            <g
              key={copy}
              transform={`translate(${C - R + copy * TILE} ${C - R}) scale(${SCALE})`}
            >
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
                  1,397-command land path was walked twice per tile, so four
                  times per frame with both tiles on screen. `fill-opacity` and
                  `stroke-opacity` set the same two values per paint operation
                  instead, so one element does both. Default `paint-order` is
                  fill then stroke, which is the order they were stacked in. */}
              <use
                href="#globe-land"
                fill="var(--season-land)"
                fillOpacity={0.9}
                stroke="var(--season-land)"
                strokeOpacity={0.55}
                strokeWidth={0.25}
              />

              {/* Sri Lanka, at its real coordinates. It scrolls with the map,
                  so it swings into view once per rotation and passes through
                  the terminator into night - no extra logic needed, the night
                  overlay is simply painted on top of it. */}
              <g transform={`translate(${SRI_LANKA.x} ${SRI_LANKA.y})`}>
                <circle
                  className="sl-pulse"
                  r={4.5}
                  fill="var(--season-accent)"
                  opacity={0.4}
                />
                <circle
                  r={3}
                  fill="none"
                  stroke="var(--season-accent)"
                  strokeWidth={0.7}
                  opacity={0.8}
                />
                <circle r={1.5} fill="var(--season-accent)" />
              </g>
            </g>
          ))}
        </g>

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

      {/* Crisp rim, so the disc reads against the dark background. */}
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
  );
}
