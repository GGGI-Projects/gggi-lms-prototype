/**
 * The portal's navigation map.
 *
 * Data, not markup: the rail and the mobile drawer are two different layouts
 * of the same list, and a second copy of it is how one of them ends up missing
 * "Certificates" for a release.
 *
 * THREE MAIN SECTIONS - Learn, Laws, Tools - are peers, the same weight
 * `docs/SRS.md` §1.2 gives them, so none of them sits under a group label
 * introducing it the way "Account" introduces Profile/Settings below. Only
 * "Learn" carries children: Dashboard, Modules and Certificates are sub-menus
 * of it, all three living under `/learn` (see `app/(studentportal)/learn/`),
 * so opening "Learn" itself lands on `/learn/dashboard` - its own default
 * sub-page, the same relationship "Laws" has to its own single page, just
 * with more than one destination underneath. Laws and Tools have nothing to
 * nest, so they render as plain entries rather than single-child groups.
 */

import type { ComponentType } from "react";
import {
  CertificateIcon,
  DashboardIcon,
  LawIcon,
  LearnIcon,
  ProfileIcon,
  ModulesIcon,
  SettingsIcon,
  ToolIcon,
} from "@/components/student-portal/icons";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /**
   * When true the entry only lights up on an exact match. `/learn/dashboard`
   * has no children, and without this every other route starting with a
   * slash would still have to be checked against it.
   */
  exact?: boolean;
  /**
   * Sub-menu entries, indented beneath this one - only "Learn" has any.
   * A parent with children is still itself a real link (to `/learn`, which
   * redirects to its own default child) rather than an inert heading, the
   * same "the section itself is one of its own destinations" shape "Laws"
   * and "Tools" already have without needing this field at all.
   */
  children?: NavItem[];
};

export const PORTAL_NAV: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      {
        href: "/learn",
        label: "Learn",
        icon: LearnIcon,
        children: [
          { href: "/learn/dashboard", label: "Dashboard", icon: DashboardIcon, exact: true },
          { href: "/learn/modules", label: "Modules", icon: ModulesIcon },
          { href: "/learn/certificates", label: "Certificates", icon: CertificateIcon },
        ],
      },
      { href: "/laws", label: "Laws", icon: LawIcon },
      { href: "/tools", label: "Tools", icon: ToolIcon },
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
 * "Learn" stays lit while the learner is four segments deep inside a
 * lecture, and "Modules" lights up alongside it once the route is specific
 * enough to be its own. The `/` is load-bearing: without it `/learn/modules`
 * would also match a hypothetical `/learn/modules-archive`.
 */
export function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
