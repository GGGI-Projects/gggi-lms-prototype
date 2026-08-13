/**
 * Generates the inline SVG geometry used by <Globe>.
 *
 *   node gen-globe.mjs
 *
 * Natural Earth 110m land, projected equirectangular onto a 360x180 map that
 * the component tiles and scrolls behind a circular mask. Output is pasted
 * into components/art/globe.tsx as a constant, so the app ships no geo
 * dependency and makes no network request at runtime.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { geoEquirectangular, geoPath, geoGraticule } from "d3-geo";

const W = 360;
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

// Drop specks that are sub-pixel once rendered - they cost bytes and show
// nothing at the size the globe is displayed.
const MIN_AREA = 1.2;
const multi = land.features[0].geometry;
const kept = multi.coordinates.filter((poly) => ringArea(poly[0]) >= MIN_AREA);
const dropped = multi.coordinates.length - kept.length;

const simplified = { type: "MultiPolygon", coordinates: kept };
const toInt = (d) =>
  d.replace(/-?\d+\.\d+/g, (m) => Math.round(parseFloat(m)).toString());

const landPath = toInt(path(simplified));
const graticulePath = toInt(path(geoGraticule().step([30, 30])()));

console.log(`polygons kept ${kept.length}, dropped ${dropped}`);
console.log(
  `land ${landPath.length} chars, graticule ${graticulePath.length} chars`,
);
writeFileSync(`${process.env.OUT}/land.txt`, landPath);
writeFileSync(`${process.env.OUT}/grat.txt`, graticulePath);
