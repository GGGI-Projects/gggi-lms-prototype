"use client";

import { useEffect, useState, type RefObject } from "react";
import { SEASONS, SEASON_MS, YEAR_MS } from "@/content/seasons";

/**
 * Reads which season is showing from the CSS animation that is already
 * driving the colours.
 *
 * The important part is what this does NOT do: it does not run its own timer.
 * A `setInterval` alongside a CSS animation drifts - browsers throttle timers
 * and animations differently in background tabs - and after a few minutes the
 * "season" would no longer match the light on the globe. Here CSS owns the
 * clock and JavaScript only reads it, so drift is structurally impossible.
 */

/** Every animation that must stay phase-locked to the year. */
const CLOCKED = new Set([
  "year",
  "globe-spin",
  "season-sweep",
  "underline-fill",
  "ribbon-fill",
]);

/** `currentTime` is `CSSNumberish`; in practice a number for CSS animations. */
function toMilliseconds(time: CSSNumberish | null | undefined): number | null {
  if (time == null) return null;
  if (typeof time === "number") return time;
  const value = (time as { value?: unknown }).value;
  return typeof value === "number" ? value : null;
}

/**
 * `subtree: true` because the clock is no longer on this element. It runs on
 * the header and on the hero section - see `.season-clock` in globals.css -
 * and the two are identical, so the first one found is as good as either.
 */
function yearAnimation(root: HTMLElement | null) {
  if (!root) return undefined;
  return root
    .getAnimations({ subtree: true })
    .find((a) => (a as CSSAnimation).animationName === "year");
}

/**
 * `running` is the hero's visibility. When it is false the clock is paused, so
 * `currentTime` is a constant and there is nothing to read - polling it would
 * be a `getAnimations()` call and an array allocation per frame to learn the
 * same number over and over.
 */
export function useSeasonIndex(
  root: RefObject<HTMLElement | null>,
  running = true,
) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const element = root.current;
    if (!element || !running) return;

    let frame = 0;
    let last = -1;

    // A rAF read rather than a timeout to the next boundary: it is a single
    // number comparison per frame, it costs nothing, and it handles pause and
    // resume without any extra state. rAF also stops when the tab is hidden.
    const read = () => {
      const ms = toMilliseconds(yearAnimation(element)?.currentTime);
      if (ms != null) {
        const next = Math.min(
          SEASONS.length - 1,
          Math.floor((ms % YEAR_MS) / SEASON_MS),
        );
        if (next !== last) {
          last = next;
          setIndex(next);
        }
      }
      frame = requestAnimationFrame(read);
    };

    frame = requestAnimationFrame(read);
    return () => cancelAnimationFrame(frame);
  }, [root, running]);

  return index;
}

/**
 * Jump the whole year to a given season.
 *
 * Sets one absolute time on every clocked animation. They all started together
 * and their durations are the year or an exact divisor of it, so a single
 * assignment preserves the phase of all of them - the globe, the sweep, the
 * underline fill and the ribbon stay locked to each other.
 */
export function jumpToSeason(root: HTMLElement | null, index: number) {
  if (!root) return;

  // Land a little way into the season's hold, rather than exactly on the
  // boundary where the colour blend is still finishing.
  const target = index * SEASON_MS + SEASON_MS * 0.1;

  for (const animation of root.getAnimations({ subtree: true })) {
    const name = (animation as CSSAnimation).animationName;
    if (CLOCKED.has(name)) animation.currentTime = target;
  }
}
