"use client";

import { createContext, useContext } from "react";
import type { StaffRole } from "@/lib/permissions";

/**
 * WHICH ROLE THE CONSOLE IS BEING VIEWED AS.
 *
 * The honest description first: this prototype has no authentication and no
 * server. Nothing here enforces a permission - it DEMONSTRATES one. Every
 * route is reachable directly, exactly as in the student portal, which is what
 * lets the client be shown any screen without walking through a sign-in. When
 * this is built for real, `role` arrives from the session on the server and
 * these components read it as a prop; the capability model in `lib/admin.ts`
 * is written so that swap changes no screen.
 *
 * The role lives in React state in the shell rather than in the URL or in
 * storage, and that is deliberate:
 *
 *   - The URL would put `?view=admin` on every link in the console, and one
 *     forgotten link silently promotes whoever follows it.
 *   - `localStorage` cannot be read while the server renders, so the first
 *     paint would be one role and the second another - a visible flash on
 *     every page load, to remember a demo setting.
 *
 * State in the shell survives every navigation inside the console, because the
 * layout stays mounted. A full page reload resets to the super administrator,
 * which is the right default for someone opening the console cold.
 */
export type RoleContextValue = {
  role: StaffRole;
  /**
   * Who that viewpoint is, resolved on the server and passed through the shell.
   * It rides along with the role because the two always change together, and
   * because a client component reading a name out of `lib/admin` would pull
   * the whole data layer into the browser to do it.
   */
  account: { name: string; initials: string; avatarUrl: string };
  /** Absent in the lecturer area, where the role is not a choice. */
  setRole?: (role: StaffRole) => void;
};

const RoleContext = createContext<RoleContextValue>({
  role: "super-admin",
  account: { name: "", initials: "", avatarUrl: "" },
});

export const RoleProvider = RoleContext.Provider;

export function useRole(): RoleContextValue {
  return useContext(RoleContext);
}
