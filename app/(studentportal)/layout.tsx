import type { ReactNode } from "react";
import { PortalShell } from "@/components/student-portal/portal-shell";

/**
 * The signed-in area.
 *
 * A route GROUP - `(portal)` is in brackets, so it adds no segment to any URL
 * and the routes underneath stay at `/dashboard`, `/modules` and so on. All
 * it does is give those ten screens one layout, which is the whole point: the
 * rail, the header and the page measure are decided once here rather than
 * imported by each page and drifting apart.
 *
 * There is no auth check because there is no auth - this is a front-end
 * prototype and every route is reachable directly, which is what lets the
 * client be shown any screen without walking through a login first.
 */
export default function PortalLayout({ children }: { children: ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
