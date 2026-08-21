"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BRAND } from "@/lib/brand";
import { LeafMark } from "@/components/art/scenes";
import {
  can,
  ROLE_LABEL,
  ROLE_SUMMARY,
  type StaffRole,
} from "@/lib/permissions";
import {
  navFor,
  isActive,
  VIEWPOINTS,
  type ConsoleArea,
  type NavItem,
} from "@/components/console/nav";
import { RoleProvider, useRole } from "@/components/console/role-context";
import { Avatar } from "@/components/student-portal/ui";
import { SignOutIcon } from "@/components/student-portal/icons";
import {
  ChevronDownIcon,
  ExternalIcon,
  LockIcon,
} from "@/components/console/icons";
import { RailShell, RailGroup } from "@/components/shell/rail-shell";
import { RailLink } from "@/components/shell/rail-link";
import { MobileNavDrawer } from "@/components/shell/mobile-nav-drawer";
import { TopbarShell } from "@/components/shell/topbar-shell";
import { NotificationBell } from "@/components/notifications/notification-bell";
import type { NotificationSummary } from "@/lib/comms";

/**
 * The frame every staff screen sits in.
 *
 * THE SAME MATERIAL AS THE PORTAL, on purpose. A dark `primary-950` rail, the
 * ambient bloom, the landscape ribbon at its foot, the 40px leaf mark on the
 * same gutter, the same 4.25rem header - because this is the same product seen
 * from a different desk, not a separate admin tool bolted to the side of it.
 * An administrator who opens the console and finds a grey Bootstrap panel has
 * been told, wordlessly, that the polished thing is the marketing site. That
 * chrome now literally IS the portal's - the rail's frame, the mobile drawer
 * and the topbar's frame are shared components in `components/shell/`, so the
 * two cannot drift into two designs by accident.
 *
 * What is different is only what the job is different about: a wider content
 * column for registers and charts (`CONSOLE.container`), navigation that knows
 * about permissions, and a header that says which role you are looking as.
 */
export type ConsoleAccount = { name: string; initials: string; avatarUrl: string };

export function ConsoleShell({
  area,
  accounts,
  notifications,
  children,
}: {
  area: ConsoleArea;
  /**
   * Who you are in each viewpoint - READ ON THE SERVER and handed down. The
   * shell is a client component because it holds the viewpoint and the
   * drawer; importing `lib/admin` to look up a name would send the whole
   * curriculum and every register to the browser to draw an avatar.
   */
  accounts: Record<StaffRole, ConsoleAccount>;
  /** Same reason as `accounts` - the bell's own feed for every viewpoint,
   *  computed once on the server (see `sessionNotifications` in
   *  `lib/comms.ts`) rather than fetched again per role switch. Pending
   *  reviews are not folded in here - that queue already has its own home
   *  on the dashboard and the Reviews screen, and is a moderation to-do
   *  rather than something anyone sent anyone. */
  notifications: Record<StaffRole, NotificationSummary[]>;
  children: ReactNode;
}) {
  const pathname = usePathname();

  /**
   * The viewpoint. In the lecturer area it is not a choice - there is one
   * lecturer role and nothing to switch between - so `setRole` is only
   * handed down in the admin area, and the switcher renders as a plain label
   * rather than a menu.
   */
  const [role, setRole] = useState<StaffRole>(
    area === "lecturer" ? "lecturer" : "super-admin",
  );

  // The drawer's open state, tied to the route it was opened on, so any
  // navigation closes it without an effect firing a second render. Same
  // device as the student portal's shell, and the same reasoning.
  const [menu, setMenu] = useState({ open: false, path: pathname });
  const menuOpen = menu.open && menu.path === pathname;
  const closeMenu = () => setMenu({ open: false, path: pathname });

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu({ open: false, path: pathname });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, pathname]);

  return (
    <RoleProvider
      value={{
        role,
        account: accounts[role],
        setRole: area === "admin" ? setRole : undefined,
      }}
    >
      <div className="flex flex-1 flex-col [--header-h:4.25rem] [--rail:17.5rem]">
        <Rail
          area={area}
          role={role}
          accounts={accounts}
          className="fixed inset-y-0 left-0 z-40 hidden w-(--rail) lg:flex"
        />

        <MobileNavDrawer open={menuOpen} onClose={closeMenu}>
          <Rail
            area={area}
            role={role}
            accounts={accounts}
            className="relative flex w-full"
          />
        </MobileNavDrawer>

        <div className="flex flex-1 flex-col lg:pl-(--rail)">
          <Topbar
            area={area}
            role={role}
            account={accounts[role]}
            notifications={notifications[role]}
            onMenu={() => setMenu({ open: true, path: pathname })}
          />

          {/* `min-w-0` is load-bearing: without it a wide table stretches the
              flex column instead of scrolling inside its own box, and the
              whole page gains a horizontal scrollbar. */}
          <main className="min-w-0 flex-1 pb-24">{children}</main>
        </div>
      </div>
    </RoleProvider>
  );
}

/* -------------------------------------------------------------------- rail */

function Rail({
  area,
  role,
  accounts,
  className = "",
}: {
  area: ConsoleArea;
  role: StaffRole;
  accounts: Record<StaffRole, ConsoleAccount>;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <RailShell
      className={className}
      logoHref={area === "admin" ? "/admin" : "/lecturer"}
      logoLabel={`${BRAND.name} ${BRAND.suffix} - console home`}
      navLabel="Console"
      logo={
        <>
          <span className="grid size-10 place-items-center rounded-full bg-accent text-primary-950 transition-transform duration-500 ease-out-expo group-hover:-rotate-12">
            <LeafMark className="size-10" />
          </span>
          <span className="min-w-0">
            <span className="font-display block truncate text-lg leading-none tracking-tight">
              {BRAND.name}
            </span>
            {/* Which surface you are on. The portal's wordmark says
                "Academy" here; saying it again would leave the two products
                indistinguishable at a glance in a screenshot. */}
            <span className="label-eyebrow mt-1 block text-primary-500">
              {area === "admin" ? "Console" : "Lecturer"}
            </span>
          </span>
        </>
      }
      foot={<ViewpointCard role={role} accounts={accounts} />}
    >
      {navFor(area).map((group) => (
        <RailGroup key={group.label} label={group.label}>
          {group.items.map((item) => (
            <li key={item.href}>
              <RailNavItem item={item} role={role} pathname={pathname} />
            </li>
          ))}
        </RailGroup>
      ))}
    </RailShell>
  );
}

function RailNavItem({
  item,
  role,
  pathname,
}: {
  item: NavItem;
  role: StaffRole;
  pathname: string;
}) {
  const locked = item.capability ? !can(role, item.capability) : false;

  return (
    <RailLink
      href={item.href}
      label={item.label}
      icon={item.icon}
      active={isActive(pathname, item)}
      lockedNote={
        locked ? `(restricted - ${ROLE_LABEL["super-admin"]} only)` : undefined
      }
      lockIcon={LockIcon}
    />
  );
}

/**
 * Who you are, and - in the admin area - a way to be someone else.
 *
 * The switcher is a PROTOTYPE DEVICE and says so. It sits at the foot of the
 * rail rather than in the header because it changes identity, not view
 * options, and because that is where the portal puts the person.
 */
function ViewpointCard({
  role,
  accounts,
}: {
  role: StaffRole;
  accounts: Record<StaffRole, ConsoleAccount>;
}) {
  const account = accounts[role];

  return (
    <div className="shrink-0 border-t border-primary-800/80 px-4 py-4">
      <RoleSwitcher role={role} accounts={accounts} />

      <Link
        href={BRAND.routes.login}
        className="mt-1 flex items-center gap-3 rounded-sm px-3 py-2.5 text-lg text-tint transition-colors duration-300 hover:bg-primary-900/70 hover:text-paper"
      >
        <SignOutIcon className="size-5 shrink-0 text-primary-500" />
        Sign out
      </Link>

      <p className="sr-only">
        Signed in as {account.name}, {ROLE_LABEL[role]}.
      </p>
    </div>
  );
}

function RoleSwitcher({
  role,
  accounts,
}: {
  role: StaffRole;
  accounts: Record<StaffRole, ConsoleAccount>;
}) {
  const router = useRouter();
  // Read back out of the provider this renders inside, rather than
  // prop-drilling `setRole` through the rail and the drawer to reach it.
  const { setRole } = useRole();
  const [open, setOpen] = useState(false);
  const account = accounts[role];

  // No switcher in the lecturer area: there is one lecturer role, and a
  // menu with a single entry is a control that does nothing.
  if (!setRole) {
    return (
      <div className="flex items-center gap-3 rounded-sm px-3 py-2">
        <Avatar
          src={account.avatarUrl}
          initials={account.initials}
          className="size-10 text-lg"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-paper">{account.name}</p>
          <p className="truncate text-sm text-primary-500">{ROLE_LABEL[role]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left transition-colors duration-300 hover:bg-primary-900/70"
      >
        <Avatar
          src={account.avatarUrl}
          initials={account.initials}
          className="size-10 text-lg"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-paper">
            {account.name}
          </span>
          <span className="block truncate text-sm text-primary-500">
            {ROLE_LABEL[role]}
          </span>
        </span>
        <ChevronDownIcon
          className={`size-4 shrink-0 text-primary-500 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 z-10 mb-2 w-full overflow-hidden rounded-sm border border-primary-800 bg-primary-900 shadow-lg">
          <p className="label-eyebrow border-b border-primary-800 px-4 py-3 text-primary-500">
            View the console as
          </p>
          <ul>
            {VIEWPOINTS.map((viewpoint) => (
              <li key={viewpoint.role}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setRole(viewpoint.role);
                    // Leaving the admin area is a navigation, not a state
                    // change - the lecturer console is a different set of
                    // screens, not the same ones with fewer buttons.
                    if (viewpoint.area === "lecturer") {
                      router.push(viewpoint.home);
                    }
                  }}
                  className={`block w-full px-4 py-3 text-left transition-colors duration-200 hover:bg-primary-800 ${
                    viewpoint.role === role ? "bg-primary-800/60" : ""
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold text-paper">
                    {ROLE_LABEL[viewpoint.role]}
                    {viewpoint.role === role ? (
                      <span className="size-1.5 rounded-full bg-accent" />
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm leading-snug text-tint">
                    {ROLE_SUMMARY[viewpoint.role]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="border-t border-primary-800 px-4 py-3 text-sm leading-snug text-primary-500">
            Prototype control. There is no sign-in behind it - it changes what
            this console lets you do so the difference can be seen.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ topbar */

function Topbar({
  area,
  role,
  account,
  notifications,
  onMenu,
}: {
  area: ConsoleArea;
  role: StaffRole;
  account: ConsoleAccount;
  notifications: NotificationSummary[];
  onMenu: () => void;
}) {
  return (
    <TopbarShell
      onMenu={onMenu}
      searchPlaceholder={
        area === "admin"
          ? "Search learners, modules, references"
          : "Search your lectures"
      }
      searchAriaLabel="Search the console"
      mobileLogo={
        <Link
          href={area === "admin" ? "/admin" : "/lecturer"}
          className="flex items-center gap-2.5 text-ink lg:hidden"
          aria-label={`${BRAND.name} ${BRAND.suffix} - console home`}
        >
          <span className="grid size-10 place-items-center rounded-full bg-primary text-paper">
            <LeafMark className="size-10" />
          </span>
        </Link>
      }
      actions={
        <>
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-sm px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface hover:text-ink sm:inline-flex"
          >
            <ExternalIcon className="size-4" />
            Public site
          </Link>

          <NotificationBell
            items={notifications}
            seeAllHref={area === "admin" ? "/admin/notifications" : "/lecturer/notifications"}
          />

          <Link
            href={area === "admin" ? "/admin/profile" : "/lecturer/profile"}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-surface sm:pr-4"
          >
            <Avatar
              src={account.avatarUrl}
              initials={account.initials}
              className="size-9 text-base"
            />
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-lg font-semibold leading-tight text-ink">
                {account.name.split(" ")[0]}
              </span>
              <span className="block truncate text-sm leading-tight text-muted">
                {ROLE_LABEL[role]}
              </span>
            </span>
          </Link>
        </>
      }
    />
  );
}
