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
 * `syncKey` is bumped by anything that moves the clock by hand - currently
 * `jumpToSeason`. The schedule below sleeps until the boundary it calculated,
 * so a jump would otherwise leave it waiting for a moment that has already been
 * skipped past; changing the key restarts the effect and re-reads.
 */
export function useSeasonIndex(
  root: RefObject<HTMLElement | null>,
  syncKey = 0,
) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const element = root.current;
    if (!element) return;

    let timer = 0;
    let stopped = false;

    // Read once, then sleep until the next season boundary.
    //
    // This used to poll on requestAnimationFrame, which was described as
    // costing nothing - it did not. Each frame called `getAnimations()`, which
    // forces the animation timeline to be updated and allocates a fresh array
    // to be searched, sixty times a second, forever, to learn a number that
    // changes four times a minute.
    //
    // The drift argument that made CSS the clock still holds, and is in fact
    // stronger here: this still reads `currentTime` off the CSS animation and
    // never keeps a count of its own, so a throttled or suspended timer cannot
    // desynchronise anything - the next read simply corrects itself.
    const read = () => {
      if (stopped) return;

      const ms = toMilliseconds(yearAnimation(element)?.currentTime);

      // The animation may not exist yet on the first pass. Try again shortly
      // rather than giving up, which would freeze the hero on spring.
      if (ms == null) {
        timer = window.setTimeout(read, 100);
        return;
      }

      const elapsed = ms % YEAR_MS;
      setIndex(Math.min(SEASONS.length - 1, Math.floor(elapsed / SEASON_MS)));

      // Land just past the boundary, so the read that follows is unambiguously
      // inside the next season rather than exactly on the edge of it.
      timer = window.setTimeout(read, SEASON_MS - (elapsed % SEASON_MS) + 16);
    };

    read();

    // A hidden tab throttles timers, so the wake-up after one can be late by
    // an arbitrary amount. Re-reading on the way back in costs one call and
    // means the words are never showing the wrong season on return.
    const resync = () => {
      if (document.visibilityState !== "visible") return;
      window.clearTimeout(timer);
      read();
    };

    document.addEventListener("visibilitychange", resync);

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", resync);
    };
  }, [root, syncKey]);

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
