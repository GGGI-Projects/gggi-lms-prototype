"use client";

import {
  can,
  ROLE_LABEL,
  ROLE_SUMMARY,
  type Capability,
} from "@/lib/permissions";
import { useRole } from "@/components/console/role-context";
import { BODY, CARD, META } from "@/lib/theme";
import { CheckIcon, CloseIcon } from "@/components/student-portal/icons";

/**
 * Your own account, on your own profile page.
 *
 * The only place in the console that HAS to be client-rendered rather than
 * merely allowed to be: in this prototype the current account is whichever
 * viewpoint the switcher is on, and a profile page that greets an
 * administrator by the super administrator's name would make the whole role
 * demonstration read as broken.
 *
 * The name and initials come from the shell through the same context as the
 * role, so this file - like every other client component in the console -
 * never imports the data layer.
 */
export function AccountIdentity() {
  const { role, account } = useRole();

  return (
    <div className={`${CARD} p-6 sm:p-8`}>
      <div className="flex flex-wrap items-center gap-5">
        <span
          aria-hidden="true"
          className="grid size-16 shrink-0 place-items-center rounded-full bg-accent font-display text-2xl font-bold tracking-tight text-primary-950"
        >
          {account.initials}
        </span>
        <div className="min-w-0">
          <p className="font-display text-2xl tracking-tight text-ink">
            {account.name}
          </p>
          <p className={`mt-1 ${META.base}`}>{ROLE_LABEL[role]}</p>
        </div>
      </div>

      <p className={`measure-wide mt-6 ${BODY.base}`}>{ROLE_SUMMARY[role]}</p>
    </div>
  );
}

/**
 * Every capability, ticked or not.
 *
 * SHOWS THE ONES YOU DO NOT HAVE as well, greyed and crossed. A list of only
 * what you can do answers half the question - the useful half is usually
 * "why can I not see the audit log", and a list that omits it cannot answer
 * that at all.
 */
const CAPABILITY_LABEL: Record<Capability, string> = {
  viewConsole: "Open the console",
  manageAdmins: "Create and suspend administrator accounts",
  readAuditLog: "Read the audit log",
  managePlatformSettings: "Change platform settings",
  manageModules: "Create, publish and archive modules",
  manageLecturers: "Appoint and suspend lecturers",
  assignModules: "Assign modules to lecturers",
  viewAllLearners: "Open the learner register",
  manageLearners: "Suspend, reset and export learner accounts",
  moderateReviews: "Publish and reject reviews",
  manageCertificates: "Withdraw certificates",
  authorLectures: "Write and publish lectures",
  viewAssignedLearners: "See how learners are doing",
};

export function CapabilityList({ className = "" }: { className?: string }) {
  const { role } = useRole();

  return (
    <ul className={`space-y-2.5 ${className}`}>
      {(Object.keys(CAPABILITY_LABEL) as Capability[]).map((capability) => {
        const allowed = can(role, capability);
        return (
          <li key={capability} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                allowed ? "bg-primary text-paper" : "bg-surface-deep text-muted"
              }`}
            >
              {allowed ? (
                <CheckIcon className="size-3" />
              ) : (
                <CloseIcon className="size-3" />
              )}
            </span>
            <span
              className={`text-lg leading-snug ${
                allowed ? "text-ink" : "text-muted-light line-through"
              }`}
            >
              {CAPABILITY_LABEL[capability]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
