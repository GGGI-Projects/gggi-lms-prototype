"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
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
 * The `.season-root` class carries the `year` animation, which is what makes
 * the registered colour properties inherit into BOTH the header and the hero -
 * they are siblings, so the clock has to sit above them. Sections further down
 * never reference the season tokens, so wrapping the whole page costs nothing.
 */
export function SeasonProvider({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const index = useSeasonIndex(root);

  const jumpTo = useCallback(
    (next: number) => jumpToSeason(root.current, next),
    [],
  );

  const value = useMemo(() => ({ index, jumpTo }), [index, jumpTo]);

  return (
    <div ref={root} className="season-root flex min-h-full flex-1 flex-col">
      <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>
    </div>
  );
}
