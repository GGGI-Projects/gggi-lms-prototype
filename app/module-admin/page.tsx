import type { Metadata } from "next";
import { CONSOLE } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import {
  certificateRegister,
  formatNumber,
  lectureLoad,
  reviewsForModule,
  staffById,
} from "@/lib/admin";
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
 * The Module Administrator's first screen (FR-MODADM-090) - the old
 * Administrator dashboard's shape, narrowed to one Module (or the several
 * this account holds - Appendix D, item 9) instead of the whole platform.
 */
export default function ModuleAdminDashboard() {
  const member = staffById(SESSION["module-admin"]);
  if (!member) throw new Error("[module-admin] no session account");

  const load = lectureLoad(member);
  const reviews = load.modules.flatMap((mdl) => reviewsForModule(mdl.id));
  const pending = reviews.filter((review) => review.status === "pending").length;
  const certificates = certificateRegister().filter((record) =>
    load.modules.some((mdl) => mdl.id === record.moduleId),
  );
  const ratedModules = load.modules.filter((mdl) => mdl.reviewCount > 0);
  const averageRating = ratedModules.length
    ? ratedModules.reduce((sum, mdl) => sum + mdl.rating, 0) / ratedModules.length
    : null;

  return (
    <PageBody>
      <PageHeader
        eyebrow={
          load.modules.length === 1
            ? load.modules[0].title
            : `${load.modules.length} modules`
        }
        title="Dashboard"
        lead="Your own module's numbers only - never the platform's whole totals."
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          label="Lectures published"
          value={load.published}
          hint={`${load.unwritten} still to write`}
        />
        <MetricCard
          label="Learners reached"
          value={formatNumber(load.learners)}
          hint="across your modules"
        />
        <MetricCard
          label="Average rating"
          value={averageRating === null ? "-" : averageRating.toFixed(1)}
          hint="from published reviews"
        />
        <MetricCard
          label="Certificates given"
          value={certificates.filter((record) => record.status === "issued").length}
          hint={`${certificates.length} ever issued`}
        />
      </div>

      <div className={CONSOLE.stack}>
        <Section title="Waiting on you">
          <div className="grid gap-4 sm:grid-cols-2">
            <QueueCard
              count={pending}
              label="Reviews to moderate"
              href="/module-admin/reviews"
            />
            <QueueCard
              count={load.modules.length}
              label={load.modules.length === 1 ? "Your module" : "Your modules"}
              href="/module-admin/modules"
            />
          </div>
        </Section>
      </div>

      <PrototypeNote className="mt-6">
        Nothing here is a queue you must clear - it is what the Super
        Administrator&rsquo;s own dashboard shows for the whole platform,
        narrowed to what you actually run.
      </PrototypeNote>
    </PageBody>
  );
}
