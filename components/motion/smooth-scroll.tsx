"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { PERF_ATTRIBUTE } from "@/lib/perf-tier";

/**
 * Weighted scrolling.
 *
 * Lenis keeps its own scroll position, eases the real one toward it every
 * frame, and applies it with `window.scrollTo`. The page keeps a real scroll
 * position, a real scrollbar and real anchors - which is the whole reason it is
 * Lenis and not Locomotive or ScrollSmoother. Those two move the document
 * inside a transformed wrapper, and a transform creates a containing block:
 * the fixed header and the journey section's sticky pinning would both break.
 *
 * The settings below are chosen against the ways smooth scroll is normally
 * unpleasant, rather than for maximum smoothness:
 *
 *   DURATION 0.9, not the 1.2 default. Above about one second the page carries
 *   on gliding after the reader has stopped asking it to, which reads as lag
 *   rather than as weight - the difference between a heavy door and a stuck one.
 *
 *   WHEEL ONLY. `syncTouch` stays off, so touch scrolling is left completely
 *   native. Phones already have momentum, and smoothing on top of it feels
 *   wrong and costs main-thread time on the devices least able to spare it.
 *
 *   HIGH TIER ONLY. Native scrolling runs on the compositor thread and survives
 *   a busy main thread; this does not. On a machine that is already struggling,
 *   smoothing turns a busy main thread into a stuttering scrollbar. The tier is
 *   watched rather than read once, so the watchdog demoting mid-session tears
 *   this back out - see lib/perf-tier.ts.
 *
 *   OFF UNDER REDUCED MOTION, and it re-checks if the preference changes.
 *
 * When it is not running, nothing is lost: the browser scrolls natively and
 * `scroll-behavior: smooth` in globals.css handles anchor jumps, exactly as
 * before this existed.
 */

/**
 * The live instance, module-level because there is only ever one scroller on a
 * page and the header needs to reach it to freeze the page behind the menu.
 */
let instance: Lenis | null = null;
let locked = false;

/**
 * Freeze or release the page. Used by the mobile menu, which must not let the
 * content scroll behind the overlay.
 *
 * The lock is remembered even when nothing is running, so that a tier demotion
 * that rebuilds the scroller while the menu is open does not quietly hand
 * scrolling back to the reader underneath it.
 */
export function setScrollLocked(next: boolean) {
  locked = next;
  if (!instance) return;
  if (next) instance.stop();
  else instance.start();
}

export function SmoothScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const start = () => {
      if (instance) return;

      // Anchors land below the fixed header, matching the `scroll-padding-top`
      // that does this job for native scrolling. Measured from the header
      // itself rather than converted from `--header-h`, so the two cannot drift.
      const header = document.querySelector("header");
      const offset = -((header?.offsetHeight ?? 84) + 24);

      instance = new Lenis({
        duration: 0.9,
        // Expo-out. Nearly all of the distance is covered early, so the page
        // answers immediately and only the last few pixels are eased - which is
        // what reads as weight instead of as delay.
        easing: (t) => 1 - Math.pow(2, -10 * t),
        smoothWheel: true,
        syncTouch: false,
        anchors: { offset },
        autoRaf: true,
      });

      if (locked) instance.stop();
    };

    const stop = () => {
      instance?.destroy();
      instance = null;
    };

    const sync = () => {
      const allowed =
        !reduced.matches && root.getAttribute(PERF_ATTRIBUTE) !== "low";
      if (allowed) start();
      else stop();
    };

    sync();

    // The tier is not fixed at load - PerfWatchdog can demote several seconds
    // in, once it has seen how the machine actually copes.
    const tier = new MutationObserver(sync);
    tier.observe(root, { attributeFilter: [PERF_ATTRIBUTE] });
    reduced.addEventListener("change", sync);

    return () => {
      tier.disconnect();
      reduced.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}
