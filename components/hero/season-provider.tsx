"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { jumpToSeason, useSeasonIndex } from "./use-season";

type SeasonState = {
  index: number;
  jumpTo: (index: number) => void;
  /** Called by the hero when it enters or leaves the viewport. */
  setRunning: (running: boolean) => void;
};

const SeasonContext = createContext<SeasonState>({
  index: 0,
  jumpTo: () => { },
  setRunning: () => { },
});

export const useSeason = () => useContext(SeasonContext);

/**
 * Owns the year.
 *
 * The `year` animation itself is NOT on this element - it is on the header and
 * on the hero section, the only two subtrees that read the season tokens. See
 * the note on `.season-clock` in globals.css for why that split matters. What
 * lives here is the shared ancestor the two of them need: somewhere to hang
 * the pause flag so both clocks stop and start on the same style update, and a
 * root for `getAnimations({ subtree: true })` to walk.
 *
 * `running` is driven by the hero, because the hero is the thing whose
 * visibility decides whether any of this is worth computing. The header is
 * always on screen, but it is not the reason the clock exists - and its own
 * design note says the bar should settle once the page below it goes light,
 * which is exactly what a paused clock gives it.
 */
export function SeasonProvider({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(true);
  const [syncKey, setSyncKey] = useState(0);
  const index = useSeasonIndex(root, running, syncKey);

  const jumpTo = useCallback((next: number) => {
    jumpToSeason(root.current, next);
    // The index is read off a schedule that sleeps until the boundary it last
    // calculated, so moving the clock by hand has to tell it to look again.
    setSyncKey((key) => key + 1);
  }, []);

  // `setRunning` is a setState function, so it is already stable; the value
  // only changes identity when the season does, exactly as before.
  const value = useMemo(
    () => ({ index, jumpTo, setRunning }),
    [index, jumpTo],
  );

  return (
    <div
      ref={root}
      // Deliberately NOT `data-active`, which is what the self-observing
      // sections use. This attribute must only ever pause `.season-clock`; if
      // it shared their name, the hero scrolling away would also stop the
      // marquee sitting right beneath it. globals.css explains the pair.
      data-clock={running ? "running" : "paused"}
      className="season-root flex min-h-full flex-1 flex-col"
    >
      <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
    </div>
  );
}
