import type { Metadata } from "next";
import { CONSOLE } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import { learnersFor, staffById } from "@/lib/admin";
import { applicationStats, pendingApplications } from "@/lib/applications";
import {
  MetricCard,
  PageBody,
  PageHeader,
  PrototypeNote,
  QueueCard,
  Section,
} from "@/components/console/ui";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * The Provincial Registrar's first screen.
 *
 * ONE PROVINCE'S OWN NUMBERS, per FR-REG-060 - applications pending, decided
 * this month, and a headcount of learners already administered. Never the
 * platform's own totals: those belong to the Super Administrator's dashboard,
 * which sees every province and this one does not.
 */
export default function RegistrarDashboard() {
  const member = staffById(SESSION["provincial-registrar"]);
  if (!member || !member.province) {
    throw new Error("[registrar] no session account, or no province assigned");
  }

  const stats = applicationStats(member.province);
  const queue = pendingApplications(member.province);
  const learners = learnersFor(member);

  return (
    <PageBody>
      <PageHeader
        eyebrow={`${member.province} Province`}
        title="Dashboard"
        lead={`Applications and learners for ${member.province} Province only - never another province's, and never the platform's own totals.`}
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          label="Pending applications"
          value={stats.pending}
          hint="waiting on a decision"
          goodWhen="down"
        />
        <MetricCard
          label="Approved this month"
          value={stats.approvedThisMonth}
          hint="August 2026"
        />
        <MetricCard
          label="Rejected this month"
          value={stats.rejectedThisMonth}
          hint="August 2026"
          goodWhen="down"
        />
        <MetricCard
          label="Active learners"
          value={stats.activeLearners}
          hint={`of ${learners.length} registered here`}
        />
      </div>

      <div className={CONSOLE.stack}>
        <Section
          title="Waiting on you"
          description="The one queue this console has - shared with every other Provincial Registrar appointed to this province."
        >
          <QueueCard
            count={queue.length}
            label="Registration applications"
            href="/registrar/applications"
          />
        </Section>
      </div>

      <PrototypeNote className="mt-6">
        Approving or rejecting an application here does not create or change a
        real account. See <code>docs/SRS.md</code> §4.33 for what this screen
        represents once it is built for real.
      </PrototypeNote>
    </PageBody>
  );
}
