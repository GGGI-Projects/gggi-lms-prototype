/**
 * The console's navigation map, for both staff areas.
 *
 * Data, not markup - same reason as the portal's: the rail and the drawer are
 * two layouts of one list, and a second copy is how one of them quietly loses
 * an entry.
 *
 * SEVEN AREAS for SEVEN ROLES - `admin` now belongs to the Super
 * Administrator alone (the old flat `admin` role it used to share is
 * retired, BR-31), plus one small area each for `lecturer`, `registrar` (the
 * Provincial Registrar), `module-admin`, `laws-admin`, `tools-admin` and
 * `list-manager`. A GLOBAL role gets its own area too, not just an
 * instance-scoped one: Laws/Tools Administrator and List Manager touch no
 * Module, lecturer or learner at all (§4.30-§4.32's own purpose statements
 * say so explicitly), and the shared `/admin` shell's dashboard and its
 * mostly-ungated "Students"/"Modules"/"Lecturers" rows would hand them
 * exactly that reach if they opened it - see the long note on `ConsoleShell`.
 *
 * The areas are grouped differently on purpose. An administrator's rail is
 * split by WHAT KIND OF THING it is about - people, learning, platform -
 * because they move between unrelated jobs all day. A lecturer's is split
 * by WHERE THE WORK IS: the material, then the learners reading it, then their
 * own account. The five scoped roles' rails are each the smallest of the lot,
 * because the job itself is small: one queue, one library, one Module, and
 * whatever it already let in - not a subset of the admin rail with rows
 * missing, a genuinely different, smaller tool.
 *
 * RESTRICTED ENTRIES ARE SHOWN, NOT HIDDEN. An administrator sees "Team" and
 * "Audit log" in the rail with a padlock beside them, and opening either gets
 * a screen that says who may read it and why. Hiding them would be tidier and
 * worse: someone who cannot see that a capability exists cannot ask to be
 * given it, cannot report that it is missing, and has no way to understand the
 * shape of their own account. The lock is the explanation.
 */

import type { ComponentType } from "react";
import type { Capability } from "@/lib/permissions";
import type { StaffRole } from "@/lib/permissions";
import {
  CertificateIcon,
  DashboardIcon,
  LawIcon,
  ProfileIcon,
  ModulesIcon,
  SettingsIcon,
  ToolIcon,
} from "@/components/student-portal/icons";
import {
  InboxIcon,
  LecturerIcon,
  LibraryIcon,
  LogIcon,
  MegaphoneIcon,
  StarIcon,
  StudentsIcon,
  TagIcon,
  TeamIcon,
} from "@/components/console/icons";

// The base rule - exact match or a path prefix - is the portal's. Both staff
// rails once needed one more rule on top of it (a lecture or quiz page had to
// light up "Lectures"/"Quizzes" rather than "Modules"), but neither entry has
// a rail slot any more, so there is nothing left for the console to add - the
// portal's rule is re-exported outright.
export { isActive } from "@/components/student-portal/nav";

export type ConsoleArea =
  | "admin"
  | "lecturer"
  | "registrar"
  | "module-admin"
  | "laws-admin"
  | "tools-admin"
  | "list-manager";

/** Where each area's console home page lives, and what its rail calls
 *  itself - the one place both are decided, so `ConsoleShell` never repeats
 *  a many-way ternary to answer either question. */
export const AREA_HOME: Record<ConsoleArea, string> = {
  admin: "/admin",
  lecturer: "/lecturer",
  registrar: "/registrar",
  "module-admin": "/module-admin",
  "laws-admin": "/laws-admin",
  "tools-admin": "/tools-admin",
  "list-manager": "/list-manager",
};

export const AREA_LABEL: Record<ConsoleArea, string> = {
  admin: "Console",
  lecturer: "Lecturer",
  registrar: "Registrar",
  "module-admin": "Module admin",
  "laws-admin": "Laws admin",
  "tools-admin": "Tools admin",
  "list-manager": "List manager",
};

/** The one role each non-`admin` area ever renders as - `ConsoleShell` reads
 *  this to seed its viewpoint state, rather than a growing if/else chain
 *  repeated every time a new single-role area is added. `admin` maps to
 *  `super-admin`, its own default, for the same reason. */
export const AREA_ROLE: Record<ConsoleArea, StaffRole> = {
  admin: "super-admin",
  lecturer: "lecturer",
  registrar: "provincial-registrar",
  "module-admin": "module-admin",
  "laws-admin": "laws-admin",
  "tools-admin": "tools-admin",
  "list-manager": "list-manager",
};

/** Only `admin` and `lecturer` send or receive an announcement or a message
 *  under this codebase's reading of docs/SRS.md's BR-25 extension - every
 *  other scoped role's reach there is flagged as an inferred, unconfirmed
 *  extension (Appendix D, item 11), not something to build ahead of the
 *  client actually asking for it. `ConsoleShell` reads this to decide
 *  whether an area's topbar even has a bell to show. */
export const AREA_HAS_COMMS: Record<ConsoleArea, boolean> = {
  admin: true,
  lecturer: true,
  registrar: false,
  "module-admin": false,
  "laws-admin": false,
  "tools-admin": false,
  "list-manager": false,
};

/** Where the topbar's own avatar link goes. Only `admin` and `lecturer` have
 *  a dedicated profile screen; every other area's avatar link falls back to
 *  its own home rather than a page that does not exist. */
export const AREA_PROFILE: Record<ConsoleArea, string> = {
  admin: "/admin/profile",
  lecturer: "/lecturer/profile",
  registrar: "/registrar",
  "module-admin": "/module-admin",
  "laws-admin": "/laws-admin",
  "tools-admin": "/tools-admin",
  "list-manager": "/list-manager",
};

/** What the topbar's search box hints at, per area - each role's own words
 *  for what it would actually be searching. */
export const AREA_SEARCH_PLACEHOLDER: Record<ConsoleArea, string> = {
  admin: "Search learners, modules, references",
  lecturer: "Search your lectures",
  registrar: "Search applications and learners",
  "module-admin": "Search your modules",
  "laws-admin": "Search laws",
  "tools-admin": "Search tools",
  "list-manager": "Search option lists",
};

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Only lights up on an exact match - for the two area home pages. */
  exact?: boolean;
  /**
   * What the entry needs. Missing it draws the padlock and sends the page to
   * its restricted state; it never removes the row.
   */
  capability?: Capability;
};

export type NavGroup = { label: string; items: NavItem[] };

const ADMIN_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: DashboardIcon, exact: true },
    ],
  },
  {
    label: "People",
    items: [
      {
        href: "/admin/team",
        label: "Console team",
        icon: TeamIcon,
        capability: "manageAdmins",
      },
      { href: "/admin/lecturers", label: "Lecturers", icon: LecturerIcon },
      { href: "/admin/students", label: "Students", icon: StudentsIcon },
    ],
  },
  {
    // Laws, Tools and Tags moved out to their own areas (`laws-admin`,
    // `tools-admin`, `list-manager`) once those became real roles rather
    // than capabilities borrowed from the flat `admin` role - see the note
    // at the top of this file. The Super Administrator still reaches them
    // (they hold every one of those capabilities too) through the viewpoint
    // switcher, the same way they already reach `/lecturer` and `/registrar`.
    label: "Learning",
    items: [
      { href: "/admin/modules", label: "Modules", icon: ModulesIcon },
      { href: "/admin/materials", label: "Materials", icon: LibraryIcon },
      { href: "/admin/reviews", label: "Reviews", icon: StarIcon },
      {
        href: "/admin/certificates",
        label: "Certificates",
        icon: CertificateIcon,
      },
    ],
  },
  {
    label: "Communications",
    items: [
      { href: "/admin/communications", label: "Communications", icon: MegaphoneIcon },
    ],
  },
  {
    label: "Platform",
    items: [
      {
        href: "/admin/audit",
        label: "Audit log",
        icon: LogIcon,
        capability: "readAuditLog",
      },
      { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
      { href: "/admin/profile", label: "Your profile", icon: ProfileIcon },
    ],
  },
];

const LECTURER_NAV: NavGroup[] = [
  {
    label: "Teaching",
    items: [
      {
        href: "/lecturer",
        label: "Dashboard",
        icon: DashboardIcon,
        exact: true,
      },
      {
        href: "/lecturer/modules",
        label: "Modules",
        icon: ModulesIcon,
      },
      { href: "/lecturer/materials", label: "Materials", icon: LibraryIcon },
    ],
  },
  {
    label: "Learners",
    items: [
      { href: "/lecturer/learners", label: "Enrolled students", icon: StudentsIcon },
    ],
  },
  {
    label: "Communications",
    items: [
      { href: "/lecturer/communications", label: "Communications", icon: MegaphoneIcon },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/lecturer/profile", label: "Your profile", icon: ProfileIcon },
      { href: "/lecturer/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

/**
 * The Provincial Registrar's rail - deliberately three items and nothing
 * more. No Communications, no Settings, no "Your profile": docs/SRS.md's own
 * BR-25 extension explicitly declines to invent messaging or announcement
 * reach for this role ("none were requested, and inventing reach for them
 * would be scope creep"), and no profile-editing screen was asked for
 * either. A short rail here is the accurate rail, not an unfinished one.
 */
const REGISTRAR_NAV: NavGroup[] = [
  {
    label: "Registrations",
    items: [
      {
        href: "/registrar",
        label: "Dashboard",
        icon: DashboardIcon,
        exact: true,
      },
      { href: "/registrar/applications", label: "Applications", icon: InboxIcon },
      { href: "/registrar/learners", label: "Learners", icon: StudentsIcon },
    ],
  },
];

/**
 * A Module Administrator's rail (§4.29). No Communications, same reasoning
 * as the registrar's - docs/SRS.md flags extending messaging reach to this
 * role as an inferred, unconfirmed extension (Appendix D, item 11), not
 * something to build ahead of client confirmation.
 */
const MODULE_ADMIN_NAV: NavGroup[] = [
  {
    label: "My modules",
    items: [
      {
        href: "/module-admin",
        label: "Dashboard",
        icon: DashboardIcon,
        exact: true,
      },
      { href: "/module-admin/modules", label: "Modules", icon: ModulesIcon },
      { href: "/module-admin/reviews", label: "Reviews", icon: StarIcon },
      {
        href: "/module-admin/certificates",
        label: "Certificates",
        icon: CertificateIcon,
      },
    ],
  },
];

/**
 * Laws Administrator, Tools Administrator and List Manager each get ONE
 * ITEM, not a dashboard plus a list - the client's own description of each
 * ("manages some documents related to Laws of environment", and so on) is
 * one library or one set of lists, not a role with numbers worth charting.
 * The item IS the home page (`exact: true`), the same way a one-screen role
 * needs no separate landing page above its one screen.
 */
const LAWS_ADMIN_NAV: NavGroup[] = [
  {
    label: "Laws",
    items: [{ href: "/laws-admin", label: "Laws", icon: LawIcon, exact: true }],
  },
];

const TOOLS_ADMIN_NAV: NavGroup[] = [
  {
    label: "Tools",
    items: [{ href: "/tools-admin", label: "Tools", icon: ToolIcon, exact: true }],
  },
];

const LIST_MANAGER_NAV: NavGroup[] = [
  {
    label: "Option lists",
    items: [
      { href: "/list-manager", label: "Option lists", icon: TagIcon, exact: true },
    ],
  },
];

export function navFor(area: ConsoleArea): NavGroup[] {
  switch (area) {
    case "admin":
      return ADMIN_NAV;
    case "lecturer":
      return LECTURER_NAV;
    case "registrar":
      return REGISTRAR_NAV;
    case "module-admin":
      return MODULE_ADMIN_NAV;
    case "laws-admin":
      return LAWS_ADMIN_NAV;
    case "tools-admin":
      return TOOLS_ADMIN_NAV;
    case "list-manager":
      return LIST_MANAGER_NAV;
  }
}

/** Which viewpoints the switcher offers, and where each of them lands. */
export const VIEWPOINTS: {
  role: StaffRole;
  area: ConsoleArea;
  home: string;
}[] = [
  { role: "super-admin", area: "admin", home: AREA_HOME.admin },
  {
    role: "module-admin",
    area: "module-admin",
    home: AREA_HOME["module-admin"],
  },
  { role: "laws-admin", area: "laws-admin", home: AREA_HOME["laws-admin"] },
  {
    role: "tools-admin",
    area: "tools-admin",
    home: AREA_HOME["tools-admin"],
  },
  {
    role: "list-manager",
    area: "list-manager",
    home: AREA_HOME["list-manager"],
  },
  {
    role: "provincial-registrar",
    area: "registrar",
    home: AREA_HOME.registrar,
  },
  { role: "lecturer", area: "lecturer", home: AREA_HOME.lecturer },
];
