"use client";

import { SEASONS } from "@/content/seasons";

/**
 * A calendar for the page: four segments across the very top edge, the current
 * one filling as its six seconds elapse.
 *
 * It earns its place three times over - it tells a visitor who looked away
 * that the page has state, it is how the prototype gets demoed without waiting
 * 24 seconds for winter, and it keeps all four seasons reachable for anyone
 * with reduced motion, for whom nothing advances on its own.
 */
export function YearRibbon({
  index,
  onSelect,
  className,
}: {
  index: number;
  onSelect: (index: number) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex items-stretch gap-1.5 ${className ?? ""}`}
      role="group"
      aria-label="Season"
    >
      {SEASONS.map((season, i) => {
        const isActive = i === index;
        const isDone = i < index;

        return (
          <button
            key={season.key}
            type="button"
            onClick={() => onSelect(i)}
            aria-current={isActive ? "true" : undefined}
            className="group relative flex-1 cursor-pointer pt-2.5 pb-1 text-left"
          >
            <span className="sr-only">Show {season.name}</span>

            <span className="relative block h-[2px] w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--season-text)_18%,transparent)]">
              {isDone ? (
                <span className="absolute inset-0 bg-[color-mix(in_oklab,var(--season-accent)_55%,transparent)]" />
              ) : null}
              {isActive ? (
                // Re-keyed on every season change so the fill animation
                // restarts exactly on the boundary.
                <span
                  key={index}
                  className="ribbon-fill absolute inset-0 bg-[var(--season-accent)]"
                />
              ) : null}
            </span>

            <span
              aria-hidden="true"
              className={`mt-2 hidden text-[0.66rem] font-medium uppercase tracking-[0.14em] transition-colors duration-500 sm:block ${isActive
                  ? "text-[var(--season-accent)]"
                  : "text-[var(--season-text-muted)] group-hover:text-[var(--season-text)]"
                }`}
            >
              {season.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
