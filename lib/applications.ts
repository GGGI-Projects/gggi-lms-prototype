/**
 * Registration-application derivations for the Provincial Registrar console
 * (docs/SRS.md §4.33) and the Super Administrator's own National / Head
 * Office queue (FR-REG-040).
 *
 * EVERY FUNCTION HERE TAKES A PROVINCE, NEVER A ROLE OR A STAFF MEMBER - the
 * scoping itself (which province a signed-in registrar may see) is the
 * console page's job, the same split `lib/admin.ts`'s `learnersFor()` keeps:
 * a derivation answers "what belongs to this province," and the page decides
 * whose province that is.
 *
 * "THIS MONTH" IS AUGUST 2026, matching this platform's fixed "today" of 15
 * August 2026 (see the note on `content/applications.ts`'s dates, and
 * `content/comms.ts`'s `isNew`/`unreadFor` note it follows). A real build
 * reads the clock; this one reads a constant, so the count on FR-REG-060's
 * dashboard never quietly drifts as the calendar in this document moves on
 * without the sample data moving with it.
 */

import { APPLICATIONS, type RegistrationApplication } from "@/content/applications";
import type { LearnerProvince } from "@/content/laws";
import { students } from "@/lib/admin";

const CURRENT_MONTH = "2026-08";

function inCurrentMonth(isoDate: string): boolean {
  return isoDate.startsWith(CURRENT_MONTH);
}

/** Every application routed to one province (or "National / Head Office"),
 *  newest first. */
export function applicationsFor(province: LearnerProvince): RegistrationApplication[] {
  return APPLICATIONS.filter((application) => application.province === province).sort(
    (a, b) => b.submittedOn.localeCompare(a.submittedOn),
  );
}

/** The queue - what still needs a decision. Oldest first, so the
 *  application that has waited longest sits at the top. */
export function pendingApplications(province: LearnerProvince): RegistrationApplication[] {
  return applicationsFor(province)
    .filter((application) => application.status === "pending")
    .sort((a, b) => a.submittedOn.localeCompare(b.submittedOn));
}

/** What has already been decided - approved and rejected together, most
 *  recently decided first, the same "what was asked, then what was decided"
 *  shape the review queue already uses (`ReviewsBoard`). */
export function decidedApplications(province: LearnerProvince): RegistrationApplication[] {
  return applicationsFor(province)
    .filter((application) => application.status !== "pending")
    .sort((a, b) => (b.decidedOn ?? "").localeCompare(a.decidedOn ?? ""));
}

export type ApplicationStats = {
  pending: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  /** Active learners this province's Registrar (or, for National / Head
   *  Office, the Super Administrator) already administers - never a
   *  platform-wide figure (FR-REG-060). */
  activeLearners: number;
};

/** The registrar dashboard's own numbers, per FR-REG-060 - this province's
 *  queue and headcount only, never the platform's. */
export function applicationStats(province: LearnerProvince): ApplicationStats {
  const decided = decidedApplications(province);

  return {
    pending: pendingApplications(province).length,
    approvedThisMonth: decided.filter(
      (application) =>
        application.status === "approved" &&
        inCurrentMonth(application.decidedOn ?? ""),
    ).length,
    rejectedThisMonth: decided.filter(
      (application) =>
        application.status === "rejected" &&
        inCurrentMonth(application.decidedOn ?? ""),
    ).length,
    activeLearners: students().filter(
      (student) => student.province === province && student.status === "active",
    ).length,
  };
}
