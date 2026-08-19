import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { CONSOLE, META } from "@/lib/theme";
import {
  BY_SECTOR,
  MONTHLY,
  PLATFORM,
  WEEKLY_ACTIVE,
} from "@/content/operations";
import {
  completionSplit,
  enrolmentsByModule,
  formatNumber,
  monthOverMonth,
  queues,
  recentLectures,
  students,
} from "@/lib/admin";
import { formatDate } from "@/lib/portal";
import {
  Badge,
  MetricCard,
  PageBody,
  PageHeader,
  Panel,
  PrototypeNote,
  QueueCard,
  Section,
} from "@/components/console/ui";
import { ConfirmAction } from "@/components/console/actions";
import {
  AreaChart,
  BarChart,
  DonutChart,
  RankedBars,
  Sparkline,
} from "@/components/console/charts";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * The platform, on one screen.
 *
 * ORDERED BY WHAT SOMEBODY DOES WITH IT, not by what is easiest to draw.
 * Whoever opens this has one of three reasons: something is waiting for them,
 * a number moved, or they need to find one person. So the queues come FIRST -
 * above the charts - because they are the only part of this page that is a
 * request. Charts describe; a queue asks.
 *
 * Every figure here is derived in `lib/admin.ts` and checked in development
 * against the platform totals. A dashboard whose numbers do not add up is
 * worse than no dashboard, because people act on it.
 */
export default function AdminDashboard() {
  const waiting = queues();
  const register = students();
  const split = completionSplit();

  return (
    <PageBody>
      <PageHeader
        eyebrow="Console"
        title="Platform overview"
        lead={`Everything on ${BRAND.name} ${BRAND.suffix} since it opened on ${formatDate(PLATFORM.launchedOn)} - ${formatNumber(PLATFORM.learners)} learners across five published modules.`}
        actions={
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <ConfirmAction
                label="Export data"
                question="Export the platform's dashboard figures?"
                detail="A single file with the numbers on this screen - learners, enrolments, certificates and monthly trends - as they stand right now."
                confirmLabel="Generate the export"
                tone="info"
                done="Prototype - no file was produced."
              />
            </div>
            <div>
              <Link
                href="/admin/modules"
                className="link-wipe self-end text-lg font-semibold text-primary"
              >
                Manage modules
              </Link>
            </div>
          </div>
        }
      />

      {/* ---------------------------------------------------------- queues */}
      <section className={CONSOLE.stack} aria-labelledby="waiting-heading">
        <h2 id="waiting-heading" className="sr-only">
          Waiting for attention
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <QueueCard
            count={waiting.pendingReviews}
            label={
              waiting.flaggedReviews
                ? `Reviews to moderate · ${waiting.flaggedReviews} flagged`
                : "Reviews to moderate"
            }
            href="/admin/reviews"
            urgent={waiting.flaggedReviews > 0}
          />
          <QueueCard
            count={waiting.draftModules}
            label="Draft modules"
            href="/admin/modules"
          />
          <QueueCard
            count={waiting.unassignedLecturers}
            label="Lecturers with no module"
            href="/admin/lecturers"
          />
          <QueueCard
            count={waiting.suspendedLearners}
            label="Suspended learner accounts"
            href="/admin/students"
            urgent={waiting.suspendedLearners > 0}
          />
        </div>
      </section>

      {/* --------------------------------------------------------- metrics */}
      <section className={CONSOLE.stack} aria-labelledby="figures-heading">
        <h2 id="figures-heading" className="sr-only">
          Headline figures
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Registered learners"
            value={formatNumber(PLATFORM.learners)}
            delta={monthOverMonth("signups")}
            hint="sign-ups on last month"
          />
          <MetricCard
            label="Active in the last 30 days"
            value={formatNumber(PLATFORM.activeLearners)}
            hint={`${Math.round((PLATFORM.activeLearners / PLATFORM.learners) * 100)}% of everyone registered`}
            chart={
              <Sparkline
                values={WEEKLY_ACTIVE}
                label="Weekly active learners over the last twelve weeks"
              />
            }
          />
          <MetricCard
            label="Enrolments"
            value={formatNumber(PLATFORM.enrolments)}
            delta={monthOverMonth("enrolments")}
            hint="new enrolments on last month"
          />
          <MetricCard
            label="Certificates issued"
            value={formatNumber(PLATFORM.certificates)}
            delta={monthOverMonth("completions")}
            hint="issued on last month"
          />
        </div>
      </section>

      {/* ---------------------------------------------------------- charts */}
      <div className={`${CONSOLE.stack} grid gap-4 xl:grid-cols-4`}>
        <Panel className="xl:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl tracking-tight text-ink">
                Sign-ups, month by month
              </h2>
              <p className={`mt-1 ${META.base}`}>
                Twelve months to today. August is a part month.
              </p>
            </div>
            <Badge tone="active">
              {monthOverMonth("signups") > 0 ? "Growing" : "Steady"}
            </Badge>
          </div>

          <div className="mt-7">
            <AreaChart
              caption="New learner registrations per month"
              points={MONTHLY.map((point, index) => ({
                label: point.label,
                value: point.signups,
                muted: index === MONTHLY.length - 1,
              }))}
            />
          </div>
        </Panel>

        <Panel className="xl:col-span-2">
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Where enrolments stand
          </h2>
          <p className={`mt-1 ${META.base}`}>
            Every enrolment on the platform, by state.
          </p>

          <div className="mt-8">
            <DonutChart
              slices={split}
              total={PLATFORM.enrolments}
              totalLabel="enrolments"
              caption="Enrolments by state"
            />
          </div>

          <p className={`mt-7 border-t border-surface-deep pt-5 ${META.base}`}>
            {PLATFORM.completionRate}% of enrolments reach a certificate. The
            average quiz score across the platform is {PLATFORM.averageScore}%.
          </p>
        </Panel>
      </div>

      <div className={CONSOLE.stack}>
        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Enrolments by module
          </h2>
          <p className={`mt-1 ${META.base}`}>
            Published modules only. The inner bar is how many of those
            enrolments finished.
          </p>

          <div className="mt-7">
            <BarChart
              caption="Enrolments and completions by module"
              innerLabel="Completed"
              data={enrolmentsByModule().map((entry) => ({
                label: entry.label,
                value: entry.value,
                inner: entry.completions,
              }))}
            />
          </div>
        </Panel>
      </div>

      {/* ----------------------------------------------------------- lists */}
      <div className={`${CONSOLE.stack} grid gap-4 xl:grid-cols-3`}>
        <Section
          title="Latest registrations"
          className="xl:col-span-2"
          action={
            <Link
              href="/admin/students"
              className="link-wipe text-lg font-semibold text-primary"
            >
              All learners
            </Link>
          }
        >
          <ul className="divide-y divide-surface-deep rounded-sm border border-surface-deep bg-paper-raised">
            {register.slice(0, 5).map((student) => (
              <li key={student.id}>
                <Link
                  href={`/admin/students/${student.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-surface/70"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-tint-mist font-display text-sm font-bold tracking-tight text-primary"
                  >
                    {student.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-semibold text-ink">
                      <span className="link-wipe">{student.name}</span>
                    </span>
                    <span className={`block truncate ${META.base}`}>
                      {student.organisation} · {student.district}
                    </span>
                  </span>
                  <span className={`shrink-0 ${META.base}`}>
                    {formatDate(student.joined)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Recently updated material">
          <ul className="divide-y divide-surface-deep rounded-sm border border-surface-deep bg-paper-raised">
            {recentLectures(5).map((mod) => (
              <li key={`${mod.module.id}-${mod.id}`} className="px-5 py-4">
                <p className="truncate text-lg font-semibold text-ink">
                  {mod.number}. {mod.title}
                </p>
                <p className={`mt-0.5 truncate ${META.base}`}>
                  {mod.module.title}
                </p>
                <p className={`mt-2 flex flex-wrap items-center gap-2 ${META.base}`}>
                  <Badge tone={mod.state === "published" ? "done" : "warn"}>
                    {mod.state === "in-review" ? "In review" : "Published"}
                  </Badge>
                  {mod.author ? mod.author.name : "No author recorded"}
                  {mod.updatedOn ? ` · ${formatDate(mod.updatedOn)}` : null}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <div className={`${CONSOLE.stack} grid gap-4 xl:grid-cols-3`}>
        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Where learners work
          </h2>
          <p className={`mt-1 ${META.base}`}>
            Self-declared at sign-up, as a share of everyone registered.
          </p>
          <div className="mt-6">
            <RankedBars
              caption="Learners by sector"
              unit="Per cent of learners"
              data={BY_SECTOR.map((entry) => ({
                label: entry.label,
                value: entry.percent,
              }))}
            />
          </div>
        </Panel>

        <Panel className="xl:col-span-2">
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Completions, month by month
          </h2>
          <p className={`mt-1 ${META.base}`}>
            Certificates issued. The first two months have none, which is what
            a five-hour module taking a few weeks looks like from the start.
          </p>
          <div className="mt-7">
            <AreaChart
              caption="Certificates issued per month"
              tone="second"
              points={MONTHLY.map((point, index) => ({
                label: point.label,
                value: point.completions,
                muted: index === MONTHLY.length - 1,
              }))}
            />
          </div>
        </Panel>
      </div>

      <PrototypeNote className={CONSOLE.stack}>
        Every figure on this page comes from the prototype&rsquo;s own sample
        data and is checked against the platform totals when the site is built.
        Nothing here is live.
      </PrototypeNote>
    </PageBody>
  );
}
