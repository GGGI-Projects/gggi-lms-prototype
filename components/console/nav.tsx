/**
 * The console's navigation map, for both staff areas.
 *
 * Data, not markup - same reason as the portal's: the rail and the drawer are
 * two layouts of one list, and a second copy is how one of them quietly loses
 * an entry.
 *
 * The two areas are grouped differently on purpose. An administrator's rail is
 * split by WHAT KIND OF THING it is about - people, learning, platform -
 * because they move between unrelated jobs all day. An instructor's is split
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
  QuizIcon,
  SettingsIcon,
} from "@/components/student-portal/icons";
import {
  InstructorIcon,
  LibraryIcon,
  LogIcon,
  LecturesIcon,
  StarIcon,
  StudentsIcon,
  TeamIcon,
} from "@/components/console/icons";

// The base rule - exact match or a path prefix - is the portal's, wrapped
// rather than re-exported outright. See `isActive` below for why the console
// needs one more rule the portal never has to.
import { isActive as pathIsActive } from "@/components/student-portal/nav";

export type ConsoleArea = "admin" | "instructor";

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
      { href: "/admin/instructors", label: "Instructors", icon: InstructorIcon },
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

const INSTRUCTOR_NAV: NavGroup[] = [
  {
    label: "Teaching",
    items: [
      {
        href: "/instructor",
        label: "Dashboard",
        icon: DashboardIcon,
        exact: true,
      },
      {
        href: "/instructor/modules",
        label: "Modules",
        icon: ModulesIcon,
      },
      { href: "/instructor/lectures", label: "Lectures", icon: LecturesIcon },
      { href: "/instructor/quizzes", label: "Quizzes", icon: QuizIcon },
      { href: "/instructor/materials", label: "Materials", icon: LibraryIcon },
    ],
  },
  {
    label: "Learners",
    items: [
      { href: "/instructor/learners", label: "Enrolled students", icon: StudentsIcon },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/instructor/profile", label: "Your profile", icon: ProfileIcon },
      { href: "/instructor/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

export function navFor(area: ConsoleArea): NavGroup[] {
  return area === "admin" ? ADMIN_NAV : INSTRUCTOR_NAV;
}

/**
 * A lecture and its quiz live at `/instructor/modules/[id]/lectures/[id]`
 * and `.../quiz` - nested under a module in the URL, because a lecture
 * belongs to one. But the rail item that should light up there is Lectures,
 * or Quizzes on the quiz page, because that is the job an instructor is
 * doing on that screen, not the path it happens to hang off. Left to the
 * portal's plain prefix rule, both pages would light up Modules instead -
 * the one item that is actually wrong, since neither page is the module
 * list or its overview.
 *
 * Admin's equivalent pages sit under `/admin/modules/...` and are
 * unaffected: these patterns only match the instructor's URLs, and the admin
 * rail has no Lectures or Quizzes entry to redirect the highlight to anyway -
 * an administrator reading a lecture correctly stays on Modules.
 */
const INSTRUCTOR_QUIZ_PAGE =
  /^\/instructor\/modules\/[^/]+\/lectures\/[^/]+\/quiz(?:\/|$)/;
const INSTRUCTOR_LECTURE_PAGE =
  /^\/instructor\/modules\/[^/]+\/lectures\/[^/]+(?:\/|$)/;

export function isActive(pathname: string, item: NavItem): boolean {
  if (INSTRUCTOR_QUIZ_PAGE.test(pathname)) {
    return item.href === "/instructor/quizzes";
  }
  if (INSTRUCTOR_LECTURE_PAGE.test(pathname)) {
    return item.href === "/instructor/lectures";
  }
  return pathIsActive(pathname, item);
}

/** Which viewpoints the switcher offers, and where each of them lands. */
export const VIEWPOINTS: {
  role: StaffRole;
  area: ConsoleArea;
  home: string;
}[] = [
  { role: "super-admin", area: "admin", home: "/admin" },
  { role: "admin", area: "admin", home: "/admin" },
  { role: "instructor", area: "instructor", home: "/instructor" },
];
