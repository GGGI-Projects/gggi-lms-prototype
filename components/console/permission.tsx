"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ROLE_LABEL } from "@/lib/permissions";
import { can, RESTRICTION, type Capability } from "@/lib/permissions";
import { useRole } from "@/components/console/role-context";
import { BODY, HEADING, META } from "@/lib/theme";
import { LockIcon, ShieldIcon } from "@/components/console/icons";

/**
 * The permission boundary, as the interface draws it.
 *
 * These are CLIENT components wrapping SERVER-RENDERED children: the page
 * itself stays a server component, builds its content, and hands it here as a
 * prop. That keeps the data work on the server and puts only the decision in
 * the browser - which is where the viewpoint lives in this prototype. See the
 * note in `role-context.tsx` for the honest account of what that does and does
 * not enforce.
 */

/**
 * A whole screen a role may not read.
 *
 * It names the role that CAN read it and says why the line is drawn there,
 * because "Access denied" answers none of the three questions the person
 * standing in front of it has: what is this, who has it, and what do I do now.
 */
export function Restricted({
  capability,
  children,
}: {
  capability: Capability;
  children: ReactNode;
}) {
  const { role } = useRole();
  if (can(role, capability)) return <>{children}</>;

  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <span
        aria-hidden="true"
        className="mx-auto grid size-14 place-items-center rounded-full bg-tint-mist text-primary"
      >
        <ShieldIcon className="size-7" />
      </span>

      <h2 className={`mt-6 ${HEADING.card}`}>Restricted to the super administrator</h2>

      <p className={`mt-4 ${BODY.base}`}>
        {RESTRICTION[capability] ??
          "This area is limited to accounts with a higher level of access."}
      </p>

      <p className={`mt-6 ${META.base}`}>
        You are viewing the console as {ROLE_LABEL[role]}. Switch viewpoint at
        the foot of the navigation to see this screen.
      </p>

      <div className="mt-8">
        <Link href="/admin" className="link-wipe text-lg font-semibold text-primary">
          Back to the dashboard
        </Link>
      </div>
    </div>
  );
}

/**
 * One control a role may not use.
 *
 * Shows the control, disabled, with the reason underneath - rather than
 * removing it. Same reasoning as the padlocks in the rail: a button you cannot
 * see is a permission you cannot ask for. `fallback` is for the handful of
 * places where a disabled control would be nonsense rather than informative.
 */
export function IfCan({
  capability,
  children,
  fallback,
}: {
  capability: Capability;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { role } = useRole();
  if (can(role, capability)) return <>{children}</>;
  return <>{fallback ?? null}</>;
}

/** The explanation that sits under a locked control. */
export function LockedNote({ capability }: { capability: Capability }) {
  const { role } = useRole();
  if (can(role, capability)) return null;

  return (
    <p className={`flex items-start gap-2 ${META.base}`}>
      <LockIcon className="mt-0.5 size-4 shrink-0 text-muted-light" />
      <span>{RESTRICTION[capability] ?? "Restricted for your role."}</span>
    </p>
  );
}

/** Names the current viewpoint inside a sentence. */
export function CurrentRole() {
  const { role } = useRole();
  return <>{ROLE_LABEL[role]}</>;
}
