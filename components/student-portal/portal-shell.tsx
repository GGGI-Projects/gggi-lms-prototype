"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BRAND } from "@/lib/brand";
import { LeafMark } from "@/components/art/scenes";
import { LEARNER } from "@/content/portal";
import { PORTAL_NAV, isActive } from "@/components/student-portal/nav";
import { InitialsAvatar } from "@/components/student-portal/ui";
import { BellIcon, SignOutIcon } from "@/components/student-portal/icons";
import { RailShell, RailGroup } from "@/components/shell/rail-shell";
import { RailLink } from "@/components/shell/rail-link";
import { MobileNavDrawer } from "@/components/shell/mobile-nav-drawer";
import { TopbarShell } from "@/components/shell/topbar-shell";

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
 * The rail's frame, the mobile drawer and the topbar's frame are shared with
 * the console - see `components/shell/` - because the two are the same
 * chrome around different content, not two designs. What is genuinely the
 * portal's own is what's inside those slots: `PORTAL_NAV`, the learner card,
 * and a topbar with no role switcher.
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

      <MobileNavDrawer open={menuOpen} onClose={closeMenu}>
        <Rail className="relative flex w-full" />
      </MobileNavDrawer>

      <div className="flex flex-1 flex-col lg:pl-(--rail)">
        <Topbar onMenu={() => setMenu({ open: true, path: pathname })} />

        {/* `min-w-0` is load-bearing: without it a wide child - the lecture
            page's materials table, a long reference number - stretches the
            flex column instead of scrolling inside its own box, and the whole
            page gains a horizontal scrollbar. */}
        <main className="min-w-0 flex-1 pb-24">{children}</main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- rail */

/** The rail's content, used twice - fixed to the left edge on a desktop, and
 *  inside the mobile drawer on a phone. Position comes from the caller via
 *  `className`, which `<RailShell>` takes as-is. */
function Rail({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <RailShell
      className={className}
      logoHref="/dashboard"
      logoLabel={`${BRAND.name} ${BRAND.suffix} - dashboard`}
      navLabel="Portal"
      logo={
        <>
          <span className="grid size-10 place-items-center rounded-full bg-accent text-primary-950 transition-transform duration-500 ease-out-expo group-hover:-rotate-12">
            <LeafMark className="size-10" />
          </span>
          <span className="font-display whitespace-nowrap text-lg leading-none tracking-tight">
            {BRAND.name}
            {BRAND.suffix ? (
              <span className="text-primary-500"> {BRAND.suffix}</span>
            ) : null}
          </span>
        </>
      }
      foot={<LearnerCard />}
    >
      {PORTAL_NAV.map((group) => (
        <RailGroup key={group.label} label={group.label}>
          {group.items.map((item) => (
            <li key={item.href}>
              <RailLink
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(pathname, item)}
              />
            </li>
          ))}
        </RailGroup>
      ))}
    </RailShell>
  );
}

function LearnerCard() {
  return (
    <div className="shrink-0 border-t border-primary-800/80 px-4 py-4">
      <div className="flex items-center gap-3 rounded-sm px-3 py-2">
        <InitialsAvatar initials={LEARNER.initials} className="size-10 text-lg" />
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

/* ------------------------------------------------------------------ topbar */

function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <TopbarShell
      onMenu={onMenu}
      searchPlaceholder="Search modules and lectures"
      searchMaxWidth="max-w-md"
      mobileLogo={
        // The mark only appears below `lg`, where the rail is not on screen.
        // Showing it in both places would put two wordmarks on one row.
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 text-ink lg:hidden"
          aria-label={`${BRAND.name} ${BRAND.suffix} - dashboard`}
        >
          <span className="grid size-10 place-items-center rounded-full bg-primary text-paper">
            <LeafMark className="size-10" />
          </span>
          <span className="font-display hidden whitespace-nowrap text-lg leading-none tracking-tight sm:inline">
            {BRAND.name}
          </span>
        </Link>
      }
      actions={
        <>
          {/* Decorative in the prototype - it has no index behind it - but
              the portal is unreadable as a design without it. */}
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
            <InitialsAvatar initials={LEARNER.initials} className="size-9 text-base" />
            <span className="hidden text-lg font-semibold text-ink sm:inline">
              {LEARNER.name.split(" ")[0]}
            </span>
          </Link>
        </>
      }
    />
  );
}
