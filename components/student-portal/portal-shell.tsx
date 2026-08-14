"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BRAND } from "@/lib/brand";
import { LeafMark, RibbonScene } from "@/components/art/scenes";
import { LEARNER } from "@/content/portal";
import { PORTAL_NAV, isActive, type NavItem } from "@/components/student-portal/nav";
import {
  BellIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
  SignOutIcon,
} from "@/components/student-portal/icons";

/**
 * The frame every signed-in screen sits in.
 *
 * A DARK RAIL against light content, which is the same split the account pages
 * already make - `<AuthAside>` is a dark teal panel on the left with the
 * landscape ribbon at its foot, and this is that panel continuing to exist
 * after sign-in. Someone who signs up and lands on the dashboard should not
 * feel they have arrived at a different product, and a portal built on white
 * chrome with a grey sidebar would say exactly that.
 *
 * What carries over, deliberately: `primary-950` ground, `tint` body text on
 * it, amber as the only highlight, the 36px leaf mark on the same left gutter,
 * and the ribbon cropped by the column. What is new is only what a portal
 * needs and a marketing page does not - persistent navigation, and a header
 * that identifies who is signed in.
 *
 * QUIET, like the account pages. No seasonal clock, no cursor halo, no scroll
 * reveals. A learner is here to work through material, and a page that
 * animates every time they navigate is a page they are fighting.
 *
 * It is a client component because the rail has to know which route is active
 * and the drawer has to open - both of which are state. The pages it wraps stay
 * server components; `children` passes straight through.
 */
export function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  /**
   * The drawer's open state, TIED TO THE ROUTE IT WAS OPENED ON.
   *
   * Any navigation has to close it - tapping a nav entry otherwise changes the
   * page underneath and leaves the panel sitting over it. The obvious way to
   * do that is an effect on `pathname` that calls `setMenuOpen(false)`, and it
   * is the wrong way: that is a second render pass after every navigation,
   * fired to correct state React could have derived in the first one.
   *
   * Storing the path alongside the flag means "open" simply stops being true
   * the moment the route changes, with no effect and no extra render.
   */
  const [menu, setMenu] = useState({ open: false, path: pathname });
  const menuOpen = menu.open && menu.path === pathname;
  const closeMenu = () => setMenu({ open: false, path: pathname });

  // Escape closes it too - the drawer covers the whole screen on a phone and
  // the only other way out is a 44px button in one corner.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu({ open: false, path: pathname });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, pathname]);

  return (
    // Both measurements live here and nowhere else: the rail is `w-(--rail)`,
    // the content is padded by the same value, and the sticky header is
    // `h-(--header-h)` - the same 4.25rem the account pages use, so the mark
    // sits at the same height before and after signing in.
    <div className="flex flex-1 flex-col [--header-h:4.25rem] [--rail:17.5rem]">
      <Rail className="fixed inset-y-0 left-0 z-40 hidden w-(--rail) lg:flex" />

      <MobileDrawer open={menuOpen} onClose={closeMenu} />

      <div className="flex flex-1 flex-col lg:pl-(--rail)">
        <Topbar onMenu={() => setMenu({ open: true, path: pathname })} />

        {/* `min-w-0` is load-bearing: without it a wide child - the module
            page's materials table, a long reference number - stretches the
            flex column instead of scrolling inside its own box, and the whole
            page gains a horizontal scrollbar. */}
        <main className="min-w-0 flex-1 pb-24">{children}</main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- rail */

function Rail({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`relative isolate flex-col overflow-hidden bg-primary-950 text-tint ${className}`}
    >
      {/* The same ambient bloom as the closing CTA and the account panel, so
          all three dark grounds on the site read as one material. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/3 -z-10 size-[26rem] rounded-full bg-primary-600/25 blur-[110px]"
      />

      <div className="flex h-(--header-h) shrink-0 items-center px-7">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2.5 text-paper"
          aria-label={`${BRAND.name} ${BRAND.suffix} - dashboard`}
        >
          <span className="grid size-9 place-items-center rounded-full bg-accent text-primary-950 transition-transform duration-500 ease-out-expo group-hover:-rotate-12">
            <LeafMark className="size-5" />
          </span>
          <span className="font-display whitespace-nowrap text-lg leading-none tracking-tight">
            {BRAND.name}
            {BRAND.suffix ? (
              <span className="text-primary-500"> {BRAND.suffix}</span>
            ) : null}
          </span>
        </Link>
      </div>

      <nav
        aria-label="Portal"
        className="flex-1 overflow-y-auto px-4 pb-6 pt-4"
      >
        {PORTAL_NAV.map((group) => (
          <div key={group.label} className="mb-7 last:mb-0">
            <p className="label-eyebrow px-3 pb-3 text-primary-500">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <RailLink item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <LearnerCard />

      <RibbonScene className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 w-full opacity-50" />
    </aside>
  );
}

function RailLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = isActive(pathname, item);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      // `aria-current` rather than relying on the colour alone: the active
      // entry is a fact about the page, not a decoration on a link.
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-lg transition-colors duration-300 ${active
          ? "bg-primary-800/70 font-semibold text-paper"
          : "text-tint hover:bg-primary-900/70 hover:text-paper"
        }`}
    >
      {/* The amber marker is what makes the active row unmistakable at a
          glance; the ground change alone is two steps of the same teal. */}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"
          }`}
      />
      <Icon
        className={`size-5 shrink-0 transition-colors duration-300 ${active ? "text-accent" : "text-primary-500 group-hover:text-tint"
          }`}
      />
      {item.label}
    </Link>
  );
}

function LearnerCard() {
  return (
    <div className="shrink-0 border-t border-primary-800/80 px-4 py-4">
      <div className="flex items-center gap-3 rounded-sm px-3 py-2">
        <Avatar className="size-10 text-lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-paper">{LEARNER.name}</p>
          <p className="truncate text-sm text-primary-500">{LEARNER.role}</p>
        </div>
      </div>

      {/* Sign-out returns to the sign-in page, which is the only honest
          destination in a prototype with no session to end. */}
      <Link
        href={BRAND.routes.login}
        className="mt-1 flex items-center gap-3 rounded-sm px-3 py-2.5 text-lg text-tint transition-colors duration-300 hover:bg-primary-900/70 hover:text-paper"
      >
        <SignOutIcon className="size-5 shrink-0 text-primary-500" />
        Sign out
      </Link>
    </div>
  );
}

/** The learner's initials, used in the rail and in the header. */
export function Avatar({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-accent font-display font-bold leading-none tracking-tight text-primary-950 ${className}`}
    >
      {LEARNER.initials}
    </span>
  );
}

/* ------------------------------------------------------------------ topbar */

function Topbar({ onMenu }: { onMenu: () => void }) {
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

        {/* The mark only appears below `lg`, where the rail is not on screen.
            Showing it in both places would put two wordmarks on one row. */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 text-ink lg:hidden"
          aria-label={`${BRAND.name} ${BRAND.suffix} - dashboard`}
        >
          <span className="grid size-9 place-items-center rounded-full bg-primary text-paper">
            <LeafMark className="size-5" />
          </span>
          <span className="font-display hidden whitespace-nowrap text-lg leading-none tracking-tight sm:inline">
            {BRAND.name}
          </span>
        </Link>

        {/* Decorative in the prototype - it has no index behind it - but the
            portal is unreadable as a design without it: search is how anyone
            with three enrolments actually finds a module. */}
        <div className="relative hidden max-w-md flex-1 lg:block">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-light" />
          <input
            type="search"
            placeholder="Search programmes and modules"
            aria-label="Search programmes and modules"
            className="field py-2.5 pl-12"
          />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid size-10 place-items-center rounded-sm text-ink-soft transition-colors hover:bg-surface hover:text-ink"
          >
            <BellIcon className="size-5" />
            <span
              aria-hidden="true"
              className="absolute right-2 top-2 size-2 rounded-full bg-accent ring-2 ring-paper"
            />
          </button>

          <Link
            href="/profile"
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-surface sm:pr-4"
          >
            <Avatar className="size-9 text-base" />
            <span className="hidden text-lg font-semibold text-ink sm:inline">
              {LEARNER.name.split(" ")[0]}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ drawer */

/**
 * The rail again, on a phone.
 *
 * Always in the DOM and moved by transform rather than mounted on demand: the
 * panel is the same markup as the rail, and mounting it on open means the
 * first tap pays for rendering it before anything can slide. `inert` is what
 * keeps a closed drawer out of the tab order and away from a screen reader -
 * `translate-x-full` alone hides it visually and leaves seven focusable links
 * sitting off the left edge of the page.
 */
function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
      inert={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-primary-950/60 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"
          }`}
      />

      <div
        className={`absolute inset-y-0 left-0 flex w-[19rem] max-w-[86%] transition-transform duration-400 ease-out-expo ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <Rail className="flex w-full" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="absolute right-3 top-4 grid size-10 place-items-center rounded-sm text-tint transition-colors hover:bg-primary-900 hover:text-paper"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
