"use client";

import type { ReactNode } from "react";
import { can } from "@/lib/permissions";
import { useRole } from "@/components/console/role-context";
import { LOCKED, LockedGroupProvider } from "@/components/console/locked-context";

/**
 * Makes every settings group inside it read-only for a role that may not
 * change platform settings.
 *
 * It passes the decision down a CONTEXT rather than a prop, because the groups
 * are server-rendered on the page and handed here as children - a client
 * component cannot reach into finished children and add a prop to each one
 * without `cloneElement`, which breaks silently the first time somebody wraps
 * a group in a `<div>`.
 *
 * Read-only rather than hidden: an administrator who cannot see that reviews
 * are held for approval cannot explain to a learner why theirs has not
 * appeared. Hiding the setting does not protect it, it moves the question to a
 * phone call.
 */
export function SettingsGate({ children }: { children: ReactNode }) {
  const { role } = useRole();
  const locked = !can(role, "managePlatformSettings");

  return (
    <LockedGroupProvider value={locked ? LOCKED : null}>
      {children}
    </LockedGroupProvider>
  );
}
