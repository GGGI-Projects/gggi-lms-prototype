import Link from "next/link";
import type { ReactNode } from "react";
import { RibbonScene } from "@/components/art/scenes";

/**
 * A rail's frame: dark ground, the ambient bloom, the header row the logo
 * sits in, the scrollable nav landmark, and the landscape ribbon at the
 * foot. Console and portal built this exact aside twice, down to the blur
 * radius - only the logo's content, the nav's items and the foot (a role
 * switcher in one, a learner card in the other) are actually theirs.
 */
export function RailShell({
  className = "",
  logoHref,
  logoLabel,
  logo,
  navLabel,
  children,
  foot,
}: {
  className?: string;
  logoHref: string;
  logoLabel: string;
  /** The logo row's content, inside the `group` link - an icon and however
   *  the caller's wordmark is laid out. */
  logo: ReactNode;
  navLabel: string;
  /** The nav groups, already rendered. */
  children: ReactNode;
  foot: ReactNode;
}) {
  return (
    <aside
      className={`isolate flex-col overflow-hidden bg-primary-950 text-tint ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/3 -z-10 size-[26rem] rounded-full bg-primary-600/25 blur-[110px]"
      />

      <div className="flex h-(--header-h) shrink-0 items-center px-7">
        <Link
          href={logoHref}
          className="group flex items-center gap-2.5 text-paper"
          aria-label={logoLabel}
        >
          {logo}
        </Link>
      </div>

      <nav
        aria-label={navLabel}
        data-lenis-prevent
        className="scroll-rail flex-1 overflow-y-auto px-4 pb-6 pt-4"
      >
        {children}
      </nav>

      {foot}

      <RibbonScene className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 w-full opacity-50" />
    </aside>
  );
}

/**
 * A group of rail entries under a heading - "People", "Learning", "Account".
 * The one piece of nav markup left to the caller is the `<li>` list itself,
 * since that is where a console item's padlock differs from a portal item's.
 */
export function RailGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <p className="label-eyebrow px-3 pb-2.5 text-primary-500">{label}</p>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}
