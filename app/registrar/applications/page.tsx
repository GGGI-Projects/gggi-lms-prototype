import type { Metadata } from "next";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import { staffById, staffName } from "@/lib/admin";
import { applicationStats, decidedApplications, pendingApplications } from "@/lib/applications";
import {
  Badge,
  MetricCard,
  PageBody,
  PageHeader,
  PrototypeNote,
  Section,
} from "@/components/console/ui";
import { ApplicationActions } from "@/components/console/actions";
import {
  APPLICATION_STATUS_LABEL,
  APPLICATION_STATUS_TONE,
} from "@/components/console/status";
import { formatDate, formatDateLong } from "@/lib/portal";

export const metadata: Metadata = { title: "Applications" };

/**
 * The registration application queue (docs/SRS.md §4.33, FR-REG-010).
 *
 * A QUEUE, not a register - same reasoning as `/admin/reviews`: what is
 * waiting is laid out in full at the top, because approving or rejecting
 * needs the whole application on screen, and what has already been decided
 * sits underneath in a quieter form, kept because "why was mine rejected" is
 * a question an applicant will ask.
 *
 * NO FILTER CONTROL, unlike the review queue - this list is already narrowed
 * to one province before it reaches the page (FR-REG-010), so there is
 * nothing left here to filter by.
 */
export default function RegistrarApplicationsPage() {
  const member = staffById(SESSION["provincial-registrar"]);
  if (!member || !member.province) {
    throw new Error("[registrar] no session account, or no province assigned");
  }

  const stats = applicationStats(member.province);
  const pending = pendingApplications(member.province);
  const decided = decidedApplications(member.province);

  return (
    <PageBody>
      <PageHeader
        eyebrow={`${member.province} Province`}
        title="Applications"
        lead="Approve or reject as submitted - a Provincial Registrar never edits an applicant's own details (FR-REG-025)."
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-3`}>
        <MetricCard label="Waiting" value={stats.pending} goodWhen="down" />
        <MetricCard label="Approved this month" value={stats.approvedThisMonth} hint="August 2026" />
        <MetricCard label="Rejected this month" value={stats.rejectedThisMonth} hint="August 2026" />
      </div>

      <div className={CONSOLE.stack}>
        <Section
          title="Waiting on you"
          description="Oldest first - the one that has waited longest sits at the top."
        >
          {pending.length ? (
            <ul className="space-y-4">
              {pending.map((application) => (
                <li
                  key={application.id}
                  className="rounded-sm border border-surface-deep bg-paper-raised p-6 sm:p-7"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-ink">
                        {application.name}
                      </p>
                      <p className={`mt-0.5 ${META.base}`}>{application.email}</p>
                    </div>
                    <Badge tone={APPLICATION_STATUS_TONE.pending}>
                      {APPLICATION_STATUS_LABEL.pending}
                    </Badge>
                  </div>

                  <p className={`mt-4 ${BODY.base}`}>
                    Submitted {formatDateLong(application.submittedOn)}
                    {application.sector ? ` · ${application.sector}` : null}
                  </p>

                  <ApplicationActions
                    applicationId={application.id}
                    name={application.name}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-sm border border-dashed border-muted-light bg-paper-raised px-8 py-12 text-center">
              <p className={BODY.base}>
                Nothing waiting. Every application to {member.province} Province
                has already been decided.
              </p>
            </div>
          )}
        </Section>

        <Section title="Decided" className={CONSOLE.stack}>
          {decided.length ? (
            <ul className="divide-y divide-surface-deep rounded-sm border border-surface-deep bg-paper-raised">
              {decided.map((application) => (
                <li key={application.id} className="px-5 py-5 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-ink">
                        {application.name}
                      </p>
                      <p className={`mt-1 ${META.base}`}>{application.email}</p>
                    </div>
                    <Badge tone={APPLICATION_STATUS_TONE[application.status]}>
                      {APPLICATION_STATUS_LABEL[application.status]}
                    </Badge>
                  </div>

                  <p className={`mt-3 ${META.base}`}>
                    {application.status === "approved" ? "Approved" : "Rejected"}
                    {application.decidedBy
                      ? ` by ${staffName(application.decidedBy)}`
                      : null}
                    {application.decidedOn
                      ? ` on ${formatDate(application.decidedOn)}`
                      : null}
                    {application.reason ? ` · ${application.reason}` : null}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p
              className={`rounded-sm border border-dashed border-muted-light bg-paper-raised px-6 py-8 text-center ${BODY.base}`}
            >
              Nothing decided yet.
            </p>
          )}
        </Section>
      </div>

      <PrototypeNote className="mt-6">
        Deciding here changes what this screen shows and nothing else - no
        account is created, and the applicant is not emailed.
      </PrototypeNote>
    </PageBody>
  );
}
