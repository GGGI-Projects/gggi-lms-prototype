/**
 * The console's navigation map, for both staff areas.
 *
 * Data, not markup - same reason as the portal's: the rail and the drawer are
 * two layouts of one list, and a second copy is how one of them quietly loses
 * an entry.
 *
 * The two areas are grouped differently on purpose. An administrator's rail is
 * split by WHAT KIND OF THING it is about - people, learning, platform -
 * because they move between unrelated jobs all day. A lecturer's is split
 * by WHERE THE WORK IS: the material, then the learners reading it, then their
 * own account. One rail organised by the other's logic reads as somebody
 * else's tool.
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
  ProfileIcon,
  ModulesIcon,
  SettingsIcon,
} from "@/components/student-portal/icons";
import {
  LecturerIcon,
  LibraryIcon,
  LogIcon,
  StarIcon,
  StudentsIcon,
  TeamIcon,
} from "@/components/console/icons";

// The base rule - exact match or a path prefix - is the portal's. Both staff
// rails once needed one more rule on top of it (a lecture or quiz page had to
// light up "Lectures"/"Quizzes" rather than "Modules"), but neither entry has
// a rail slot any more, so there is nothing left for the console to add - the
// portal's rule is re-exported outright.
export { isActive } from "@/components/student-portal/nav";

export type ConsoleArea = "admin" | "lecturer";

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
      { href: "/admin/students", label: "Students", icon: StudentsIcon },
      { href: "/admin/lecturers", label: "Lecturers", icon: LecturerIcon },
      {
        href: "/admin/team",
        label: "Administrators",
        icon: TeamIcon,
        capability: "manageAdmins",
      },
    ],
  },
  {
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
    label: "Account",
    items: [
      { href: "/lecturer/profile", label: "Your profile", icon: ProfileIcon },
      { href: "/lecturer/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

export function navFor(area: ConsoleArea): NavGroup[] {
  return area === "admin" ? ADMIN_NAV : LECTURER_NAV;
}

/** Which viewpoints the switcher offers, and where each of them lands. */
export const VIEWPOINTS: {
  role: StaffRole;
  area: ConsoleArea;
  home: string;
}[] = [
  { role: "super-admin", area: "admin", home: "/admin" },
  { role: "admin", area: "admin", home: "/admin" },
  { role: "lecturer", area: "lecturer", home: "/lecturer" },
];
