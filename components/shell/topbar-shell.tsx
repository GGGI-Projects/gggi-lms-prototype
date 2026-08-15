"use client";

import type { ReactNode } from "react";
import { MenuIcon, SearchIcon } from "@/components/student-portal/icons";

/**
 * The signed-in header's frame: the sticky bar, the phone-only hamburger, a
 * slot for the compact logo that only shows below `lg` (where the rail is
 * off screen), the search box, and a slot for whatever sits on the right.
 * Console and portal build the exact same bar around different content - a
 * role label and a "Public site" link in one, nothing of the sort in the
 * other - so only the frame moved here.
 */
export function TopbarShell({
  onMenu,
  mobileLogo,
  searchPlaceholder,
  searchAriaLabel,
  searchMaxWidth = "max-w-sm",
  actions,
}: {
  onMenu: () => void;
  /** The compact logo shown only below `lg`. */
  mobileLogo: ReactNode;
  searchPlaceholder: string;
  /** Defaults to `searchPlaceholder` when the two would say the same thing. */
  searchAriaLabel?: string;
  searchMaxWidth?: string;
  actions: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 h-(--header-h) shrink-0 border-b border-surface-deep bg-paper">
      <div className="flex h-full items-center gap-3 px-5 sm:px-8">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open navigation"
          className="grid size-10 shrink-0 place-items-center rounded-sm text-ink transition-colors hover:bg-surface lg:hidden"
        >
          <MenuIcon className="size-6" />
        </button>

        {mobileLogo}

        {/* Decorative in the prototype - nothing is indexed behind it - but a
            signed-in header without a search box is unreadable as a design. */}
        <div className={`relative hidden flex-1 lg:block ${searchMaxWidth}`}>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-light" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            aria-label={searchAriaLabel ?? searchPlaceholder}
            className="field py-2.5 pl-12"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">{actions}</div>
      </div>
    </header>
  );
}
