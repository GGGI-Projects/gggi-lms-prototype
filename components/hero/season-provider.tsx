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
};

const SeasonContext = createContext<SeasonState>({
  index: 0,
  jumpTo: () => { },
});

export const useSeason = () => useContext(SeasonContext);

/**
 * Owns the year.
 *
 * The `year` animation itself is NOT on this element - it is on the header and
 * on the hero section, the only two subtrees that read the season tokens. See
 * the note on `.season-clock` in globals.css for why that split matters. What
 * lives here is the root that `getAnimations({ subtree: true })` walks, so the
 * index can be read off whichever copy of the clock it finds first.
 *
 * The clock is never paused. It was, while the hero was off screen, and the
 * consequence showed up somewhere else entirely: the header is fixed, so it is
 * on screen for the whole page and reads the same tokens - stopping the year
 * left its buttons and wordmark frozen on whatever colour the moment of
 * scrolling away happened to catch. The hero's ambience still stops; see
 * `data-active` in globals.css.
 */
export function SeasonProvider({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [syncKey, setSyncKey] = useState(0);
  const index = useSeasonIndex(root, syncKey);

  const jumpTo = useCallback((next: number) => {
    jumpToSeason(root.current, next);
    // The index is read off a schedule that sleeps until the boundary it last
    // calculated, so moving the clock by hand has to tell it to look again.
    setSyncKey((key) => key + 1);
  }, []);

  const value = useMemo(() => ({ index, jumpTo }), [index, jumpTo]);

  return (
    <div ref={root} className="season-root flex min-h-full flex-1 flex-col">
      <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
    </div>
  );
}
