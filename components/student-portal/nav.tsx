/**
 * The portal's navigation map.
 *
 * Data, not markup: the rail and the mobile drawer are two different layouts
 * of the same list, and a second copy of it is how one of them ends up missing
 * "Certificates" for a release.
 *
 * TWO GROUPS, and the split is deliberate. The first four entries are the
 * product - the things a learner came here to do. The last two are the
 * account, which is where everything that is about them rather than about the
 * material goes. A single flat list of six puts "Settings" at the same weight
 * as "Modules".
 */

import type { ComponentType } from "react";
import {
  CertificateIcon,
  DashboardIcon,
  ProfileIcon,
  ModulesIcon,
  QuizIcon,
  SettingsIcon,
} from "@/components/student-portal/icons";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /**
   * When true the entry only lights up on an exact match. `/dashboard` has no
   * children, and without this every other route starting with a slash would
   * still have to be checked against it.
   */
  exact?: boolean;
};

export const PORTAL_NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Learning",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: DashboardIcon, exact: true },
      { href: "/modules", label: "Modules", icon: ModulesIcon },
      { href: "/quizzes", label: "Quizzes", icon: QuizIcon },
      { href: "/certificates", label: "Certificates", icon: CertificateIcon },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/profile", label: "Profile", icon: ProfileIcon },
      { href: "/settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

/**
 * A nav entry is active for its own route AND everything under it, so
 * "Modules" stays lit while the learner is four segments deep inside a
 * lecture. The `/` is load-bearing: without it `/modules` would also match a
 * hypothetical `/modules-archive`.
 */
export function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
