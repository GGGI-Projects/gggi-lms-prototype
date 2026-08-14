"use client";

import { useEffect } from "react";
import { PERF_ATTRIBUTE } from "@/lib/perf-tier";

/**
 * Demotes the page to the low tier if this machine is visibly struggling.
 *
 * The half of the tiering that measures rather than guesses - see the note in
 * lib/perf-tier.ts for why both halves exist. It watches Long Animation Frames,
 * which is the browser telling us directly that a frame took long enough for a
 * person to notice, and flips the attribute if enough of them pile up early on.
 *
 * Renders nothing and never re-renders; the only thing it touches is one
 * attribute on `<html>`, which CSS reacts to on its own.
 */

/** How long to watch. Long enough to cover the entrance and a first scroll. */
const WINDOW_MS = 5000;

/** A frame this long is one a person can see. */
const SLOW_FRAME_MS = 50;

/** Enough of them to be a pattern rather than a hiccup at startup. */
const SLOW_FRAME_LIMIT = 10;

export function PerfWatchdog() {
  useEffect(() => {
    const root = document.documentElement;

    // Already demoted by the pre-paint guess - nothing left to decide.
    if (root.getAttribute(PERF_ATTRIBUTE) === "low") return;

    // Safari and Firefox do not report this entry type yet. No measurement is
    // available, so the static guess stands rather than being second-guessed.
    const supported =
      typeof PerformanceObserver !== "undefined" &&
      PerformanceObserver.supportedEntryTypes?.includes("long-animation-frame");
    if (!supported) return;

    let slow = 0;
    let timer = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration >= SLOW_FRAME_MS) slow += 1;
      }

      if (slow >= SLOW_FRAME_LIMIT) {
        root.setAttribute(PERF_ATTRIBUTE, "low");
        stop();
      }
    });

    function stop() {
      observer.disconnect();
      window.clearTimeout(timer);
    }

    // `buffered` picks up the frames that were already slow before this effect
    // ran - which is exactly the window where a struggling machine struggles.
    observer.observe({ type: "long-animation-frame", buffered: true });
    timer = window.setTimeout(stop, WINDOW_MS);

    return stop;
  }, []);

  return null;
}
