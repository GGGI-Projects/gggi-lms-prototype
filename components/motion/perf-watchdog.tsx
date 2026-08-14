"use client";

import { useEffect } from "react";
import { PERF_ATTRIBUTE, PERF_FORCED_ATTRIBUTE } from "@/lib/perf-tier";

/**
 * Demotes the page to the low tier if this machine is visibly struggling.
 *
 * The half of the tiering that measures rather than guesses - see the note in
 * lib/perf-tier.ts for why both halves exist.
 *
 * WHEN IT LOOKS IS THE WHOLE DESIGN.
 *
 * The first version of this watched from the moment it mounted, with
 * `buffered: true` to pick up frames from before that, on the reasoning that
 * startup is when a struggling machine struggles. That is true and it is also
 * useless, because startup is when EVERY machine struggles: script parse,
 * hydration, font swap and the hero's entrance animation all land in the same
 * couple of seconds. Ten frames over 50ms in that window is a healthy desktop.
 * The result was that almost every visitor got silently demoted about five
 * seconds in, and the globe stopped turning on hardware that could run it
 * comfortably.
 *
 * So it now waits for `load`, then waits again for the page to settle, and only
 * then watches - unbuffered. In that window a machine that is coping produces
 * approximately no long frames at all, which makes the signal mean something.
 *
 * There is no promotion, only demotion. A page that decides mid-scroll that it
 * can afford more is a page that stutters at the moment it changes its mind.
 */

/** Let hydration, fonts and the hero entrance finish before judging anything. */
const SETTLE_MS = 2500;

/** How long to watch once things are quiet. */
const WINDOW_MS = 6000;

/** A frame this long is one a person can see. */
const SLOW_FRAME_MS = 50;

/** Enough of them, on a settled page, to be a pattern rather than a hiccup. */
const SLOW_FRAME_LIMIT = 12;

/**
 * Longer than this is not a slow frame, it is a gap - a backgrounded tab, a
 * sleeping laptop, a blocking dialog. Counting those would demote someone for
 * switching windows.
 */
const STALL_MS = 1000;

export function PerfWatchdog() {
  useEffect(() => {
    const root = document.documentElement;

    // A tier chosen by hand stands, and the pre-paint guess having already said
    // "low" leaves nothing to decide.
    if (root.hasAttribute(PERF_FORCED_ATTRIBUTE)) return;
    if (root.getAttribute(PERF_ATTRIBUTE) === "low") return;

    const demote = () => root.setAttribute(PERF_ATTRIBUTE, "low");

    let cancelled = false;
    let settle = 0;
    let release = () => {};

    const begin = () => {
      if (cancelled) return;
      release = supportsLongFrames()
        ? watchLongFrames(demote)
        : watchFrameGaps(demote);
    };

    const afterLoad = () => {
      settle = window.setTimeout(begin, SETTLE_MS);
    };

    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });

    return () => {
      cancelled = true;
      window.clearTimeout(settle);
      window.removeEventListener("load", afterLoad);
      release();
    };
  }, []);

  return null;
}

/** Chromium reports Long Animation Frames; Safari and Firefox do not, yet. */
function supportsLongFrames() {
  return (
    typeof PerformanceObserver !== "undefined" &&
    !!PerformanceObserver.supportedEntryTypes?.includes("long-animation-frame")
  );
}

/**
 * The good measurement: the browser telling us directly that a frame took long
 * enough for a person to notice, and attributing it.
 */
function watchLongFrames(demote: () => void) {
  let slow = 0;
  let timer = 0;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration >= SLOW_FRAME_MS && entry.duration < STALL_MS) slow += 1;
    }
    if (slow >= SLOW_FRAME_LIMIT) {
      demote();
      stop();
    }
  });

  // No `buffered`. Everything before this point is startup, and startup is
  // slow everywhere - see the note at the top of this file.
  observer.observe({ type: "long-animation-frame" });
  timer = window.setTimeout(stop, WINDOW_MS);

  function stop() {
    observer.disconnect();
    window.clearTimeout(timer);
  }

  return stop;
}

/**
 * The fallback, for the engines that do not report Long Animation Frames.
 *
 * Timing the gaps between animation frames is cruder - it cannot say what made
 * a frame late - but "frames are arriving late" is the entire question here,
 * and it works everywhere. It runs for one window and then stops; this is a
 * measurement, not a monitor.
 */
function watchFrameGaps(demote: () => void) {
  let frame = 0;
  let slow = 0;
  let stopped = false;
  let previous = performance.now();
  const deadline = previous + WINDOW_MS;

  const tick = (now: number) => {
    if (stopped) return;

    const gap = now - previous;
    previous = now;

    // requestAnimationFrame stops entirely in a hidden tab, so the first frame
    // back is an arbitrarily large gap that says nothing about the hardware.
    if (gap >= SLOW_FRAME_MS && gap < STALL_MS) slow += 1;

    if (slow >= SLOW_FRAME_LIMIT) {
      demote();
      return stop();
    }
    if (now >= deadline) return stop();

    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);

  function stop() {
    stopped = true;
    cancelAnimationFrame(frame);
  }

  return stop;
}
