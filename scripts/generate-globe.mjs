/**
 * Generates the inline SVG geometry used by <Globe>.
 *
 *   node scripts/generate-globe.mjs
 *
 * Natural Earth 110m land, projected equirectangular onto a 360x180 map that
 * the component tiles and scrolls behind a circular mask. Output is written
 * straight to components/art/globe-geometry.ts, so the app ships no geo
 * dependency and makes no network request at runtime.
 *
 * WHY THE SIMPLIFY PASS EXISTS
 *
 * The first version of this script projected, then rounded every coordinate to
 * an integer, and stopped there. Rounding is not a simplification: it moves
 * points onto a lattice, and a coastline traced at 110m detail has long runs of
 * vertices that all land on the SAME lattice point or in a straight line
 * between two of them. The output was 4,812 path commands, of which the large
 * majority drew nothing at all - `L120,171L120,171`, over and over.
 *
 * That mattered because this path is rasterised several times per animation
 * frame, so every redundant vertex was being walked sixty times a second.
 *
 * The pass below therefore runs in the order that actually removes work:
 *
 *   1. project at full precision (d3 handles the projection edge cases)
 *   2. Douglas-Peucker each subpath, in projected map units
 *   3. round to integers
 *   4. drop consecutive duplicates and collinear midpoints created by (3)
 *
 * EPSILON is deliberately smaller than the error the integer rounding already
 * introduces, so the silhouette is not being changed here - only the vertices
 * that were describing it twice are being removed.
 *
 * It also flattens the graticule almost entirely: equirectangular meridians and
 * parallels are perfectly straight lines, and d3 emits them as ~50 points each.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoEquirectangular, geoPath, geoGraticule } from "d3-geo";

const W = 360;
const OUT = "components/art/globe-geometry.ts";

/**
 * Max deviation, in map units, a removed vertex may introduce.
 *
 * 0.5 is half a map unit, which is the error the integer rounding below is
 * already introducing on its own - so this removes vertices without widening
 * the envelope the geometry was already allowed. One map unit is about 5.6
 * screen px at the size the hero renders the globe.
 *
 * Override to trade shape for speed: `EPS=0.8 node scripts/generate-globe.mjs`
 * is another third off, at the point where small coastlines start to smooth
 * out. Do not go far past that - the whole argument for real Natural Earth
 * outlines is that the continents stay recognisable.
 */
const EPSILON = Number(process.env.EPS ?? 0.5);

/** Drop specks that are sub-pixel once rendered. */
const MIN_AREA = 1.2;

const topo = JSON.parse(
  readFileSync("node_modules/world-atlas/land-110m.json", "utf8"),
);
const land = feature(topo, topo.objects.land);
const projection = geoEquirectangular().fitSize([W, W / 2], { type: "Sphere" });
const path = geoPath(projection);

/** Shoelace area of a projected ring, in square px. */
function ringArea(ring) {
  let a = 0;
  for (let i = 0, n = ring.length; i < n; i++) {
    const [x1, y1] = projection(ring[i]) ?? [0, 0];
    const [x2, y2] = projection(ring[(i + 1) % n]) ?? [0, 0];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
}

/* ------------------------------------------------------------- simplify */

/** Distance from `p` to the segment `a`-`b`. */
function deviation(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];

  // A degenerate segment happens on closed rings, where the first and last
  // point are the same one. Falling back to the distance from that point is
  // the standard trick: it picks the vertex furthest around the ring, which
  // is exactly where a closed ring wants to be split.
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);

  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy);
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Douglas-Peucker. Iterative, because some rings are thousands of points. */
function simplify(points, epsilon) {
  if (points.length < 3) return points;

  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];

  while (stack.length) {
    const [first, last] = stack.pop();
    let worst = epsilon;
    let index = -1;

    for (let i = first + 1; i < last; i++) {
      const d = deviation(points[i], points[first], points[last]);
      if (d > worst) {
        worst = d;
        index = i;
      }
    }

    if (index !== -1) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  return points.filter((_, i) => keep[i]);
}

/** Remove points that repeat, or that sit on the line between their neighbours. */
function prune(points, closed) {
  const out = [];

  for (const point of points) {
    const previous = out[out.length - 1];
    if (previous && previous[0] === point[0] && previous[1] === point[1]) continue;

    // Collinear: the cross product of the two segments is zero, so the middle
    // point is on the straight line and draws nothing.
    const before = out[out.length - 2];
    if (before && previous) {
      const cross =
        (previous[0] - before[0]) * (point[1] - before[1]) -
        (previous[1] - before[1]) * (point[0] - before[0]);
      if (cross === 0) out.pop();
    }

    out.push(point);
  }

  // A ring that has collapsed to a line or a point encloses nothing.
  if (closed && out.length < 4) return [];
  return out;
}

/**
 * Parse a d3-geo path, simplify each subpath, and re-emit it.
 *
 * d3 emits `M x,y L x,y … [Z]` and nothing else for polygons and lines, so a
 * split is enough - there are no curves or relative commands to handle.
 */
function reduce(d, epsilon) {
  const subpaths = [];

  for (const raw of d.split("M").slice(1)) {
    const closed = raw.endsWith("Z");
    const body = closed ? raw.slice(0, -1) : raw;
    const points = body.split("L").map((pair) => pair.split(",").map(Number));

    const rounded = simplify(points, epsilon).map(([x, y]) => [
      Math.round(x),
      Math.round(y),
    ]);
    const pruned = prune(rounded, closed);
    if (!pruned.length) continue;

    subpaths.push(
      `M${pruned[0][0]},${pruned[0][1]}` +
      pruned.slice(1).map(([x, y]) => `L${x},${y}`).join("") +
      (closed ? "Z" : ""),
    );
  }

  return subpaths.join("");
}

const count = (d) => (d.match(/[ML]/g) ?? []).length;

/* ---------------------------------------------------------------- build */

const multi = land.features[0].geometry;
const kept = multi.coordinates.filter((poly) => ringArea(poly[0]) >= MIN_AREA);
const dropped = multi.coordinates.length - kept.length;

const rawLand = path({ type: "MultiPolygon", coordinates: kept });
const rawGraticule = path(geoGraticule().step([30, 30])());

const landPath = reduce(rawLand, EPSILON);
const graticulePath = reduce(rawGraticule, EPSILON);

console.log(`epsilon ${EPSILON} map units`);
console.log(`polygons kept ${kept.length}, dropped ${dropped}`);
console.log(
  `land      ${count(rawLand)} -> ${count(landPath)} commands, ` +
  `${rawLand.length} -> ${landPath.length} chars`,
);
console.log(
  `graticule ${count(rawGraticule)} -> ${count(graticulePath)} commands, ` +
  `${rawGraticule.length} -> ${graticulePath.length} chars`,
);

writeFileSync(
  OUT,
  `/**
 * Earth geometry for <Globe>, generated by scripts/generate-globe.mjs.
 *
 * Natural Earth 110m land, projected equirectangular onto a 360 x 180 map.
 * Simplified with Douglas-Peucker at ${EPSILON} map units, then rounded to
 * integers and pruned of the duplicate and collinear vertices that rounding
 * creates. This path is rasterised on every animation frame, so a vertex that
 * draws nothing is not free - see the note in the generator.
 *
 * Do not hand-edit. Re-run the generator instead.
 */

/** Land masses, equirectangular, 360 x 180. */
export const GLOBE_LAND =
  "${landPath}";

/** 30-degree graticule, same projection. */
export const GLOBE_GRATICULE =
  "${graticulePath}";
`,
);

console.log(`wrote ${OUT}`);
