"use client";

import { useEffect, useState } from "react";
import { PERF_ATTRIBUTE } from "@/lib/perf-tier";

/**
 * The live performance tier, for the handful of places CSS cannot make the
 * call on its own.
 *
 * Everything else in the low tier is a `[data-perf="low"]` selector in
 * globals.css, because the browser can react to an attribute change with no
 * JavaScript at all. That stops working the moment the expensive thing is a
 * *value inside a JS animation object* rather than a CSS rule - `motion`'s
 * `filter: "blur(8px)"` on the season phrase is a prop, not a class, so
 * something has to read the tier and choose which prop to pass.
 *
 * ALWAYS "high" ON THE FIRST RENDER, SERVER AND CLIENT ALIKE. The tier is
 * decided by a synchronous inline script that runs before hydration (see
 * lib/perf-tier.ts), so a lazy `useState` initialiser reading the attribute
 * directly would already see "low" on the client's first render while the
 * server - which has no `document` - rendered "high". That mismatch is
 * exactly the failure mode `useHydrated` in motion/primitives.tsx exists to
 * avoid for visibility, and the fix is the same one: agree with the server on
 * the first paint, then correct a tick later in an effect. The one transition
 * this can affect happens on the first season boundary, several seconds after
 * hydration, so the correction is never visible.
 */
export function usePerfTier(): "high" | "low" {
  const [tier, setTier] = useState<"high" | "low">("high");

  useEffect(() => {
    const root = document.documentElement;
    const sync = () =>
      setTier(root.getAttribute(PERF_ATTRIBUTE) === "low" ? "low" : "high");

    sync();

    // Not fixed at mount - PerfWatchdog can demote several seconds in, same
    // as SmoothScroll already watches for (components/motion/smooth-scroll.tsx).
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributeFilter: [PERF_ATTRIBUTE] });
    return () => observer.disconnect();
  }, []);

  return tier;
}
