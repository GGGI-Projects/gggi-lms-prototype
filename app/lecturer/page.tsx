import type { Metadata } from "next";
import Link from "next/link";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import {
  formatNumber,
  learnersFor,
  lectureLoad,
  quizNeedsAttention,
  quizStatsFor,
  reviewsForModule,
  staffById,
} from "@/lib/admin";
import { uploadsBy } from "@/lib/materials";
import { formatDate } from "@/lib/portal";
import {
  Badge,
  Callout,
  MetricCard,
  PageBody,
  PageHeader,
  Panel,
  ProgressBar,
  PrototypeNote,
  QueueCard,
  Section,
} from "@/components/console/ui";
import { ConfirmAction } from "@/components/console/actions";
import { LECTURE_STATE_LABEL, LECTURE_STATE_TONE } from "@/components/console/status";
import { StarFilledIcon } from "@/components/console/icons";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * The lecturer's first screen.
 *
 * IT ASKS TWO QUESTIONS AND REFUSES A THIRD. What do I still have to write,
 * and is what I wrote landing - that is the job. The third question, who
 * exactly is behind those numbers, is not a lecturer's to browse: they see
 * progress in aggregate and named learners only through their own modules.
 *
 * The order is unfinished work first, then how the finished work is doing.
 * Charts describe; a queue asks - and an author opening this at nine in the
 * morning is looking for the ask.
 */
export default function LecturerDashboard() {
  const member = staffById(SESSION.lecturer);
  if (!member) throw new Error("[lecturer] no session account");

  const load = lectureLoad(member);
  const learners = learnersFor(member);
  const uploads = uploadsBy(member.id);
  const unusedUploads = uploads.filter((entry) => entry.usage.length === 0);

  const reviews = load.modules.flatMap((mdl) =>
    reviewsForModule(mdl.id).filter(
      (review) => review.status === "published",
    ),
  );
  const outstanding = load.lectures.filter((mod) => mod.state !== "published");

  const quizzes = load.lectures
    .filter((mod) => mod.hasContent)
    .map((mod) => ({ mod, stats: quizStatsFor(mod.id) }));
  const weakQuizzes = quizzes.filter((quiz) => quizNeedsAttention(quiz.stats));

  const rated = load.modules.filter((mdl) => mdl.rating > 0);
  const rating = rated.length
    ? rated.reduce((sum, mdl) => sum + mdl.rating, 0) / rated.length
    : 0;

  return (
    <PageBody>
      <PageHeader
        eyebrow="Lecturer"
        title={`Good to see you, ${member.name.split(" ")[0]}.`}
        lead={
          load.modules.length
            ? `You write for ${load.modules.length === 1 ? "one module" : `${load.modules.length} modules`}, reaching ${formatNumber(load.learners)} learners.`
            : "Nothing has been assigned to you yet."
        }
        actions={
          <div className="flex flex-wrap items-center gap-4">
            <div>

              <ConfirmAction
                label="Export data"
                question="Export your teaching data?"
                detail="A single file covering your modules, lectures and how their quizzes are doing - everything on this screen."
                confirmLabel="Generate the export"
                tone="info"
                done="Prototype - no file was produced."
              />
            </div>
            <div>
              <Link href="/lecturer/lectures" className="link-wipe self-end text-lg font-semibold text-primary">
                <span aria-hidden="true" className="btn-wave" />
                <span className="btn-label">Your lectures</span>
              </Link>
            </div>
          </div>
        }
      />

      {
        !load.modules.length ? (
          <div className={CONSOLE.stack}>
            <Callout tone="info" title="Waiting for an assignment">
              An administrator has to assign you a module before you can write
              anything. Until then this console is empty, and that is the platform
              working correctly rather than a fault.
            </Callout>
          </div>
        ) : null
      }

      {/* ---------------------------------------------------------- queues */}
      <section className={CONSOLE.stack} aria-labelledby="waiting-heading">
        <h2 id="waiting-heading" className="sr-only">
          Waiting on you
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <QueueCard
            count={load.unwritten}
            label="Lectures still to write"
            href="/lecturer/lectures"
            urgent={load.unwritten > 0}
          />
          <QueueCard
            count={weakQuizzes.length}
            label="Quizzes worth a look"
            href="/lecturer/quizzes"
            urgent={weakQuizzes.length > 0}
          />
          <QueueCard
            count={unusedUploads.length}
            label="Files you uploaded, unused"
            href="/lecturer/materials"
          />
        </div>
      </section>

      {/* --------------------------------------------------------- figures */}
      <section className={CONSOLE.stack} aria-labelledby="figures-heading">
        <h2 id="figures-heading" className="sr-only">
          Your figures
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Lectures published"
            value={load.published}
            hint="live for learners"
          />
          <MetricCard
            label="Learners"
            value={load.learners ? formatNumber(load.learners) : "-"}
            hint="enrolled on your modules"
          />
          <MetricCard
            label="Quizzes"
            value={quizzes.length}
            hint={
              weakQuizzes.length
                ? `${weakQuizzes.length} sending people back`
                : "all healthy"
            }
          />
          <MetricCard
            label="Average rating"
            value={rating ? rating.toFixed(1) : "-"}
            hint="across your modules"
          />
        </div>
      </section>

      {
        outstanding.length ? (
          <Section
            title="What is waiting on you"
            description="Everything of yours that is not yet in front of a learner."
            className={CONSOLE.stack}
            action={
              <Link
                href="/lecturer/lectures"
                className="link-wipe text-lg font-semibold text-primary"
              >
                All lectures
              </Link>
            }
          >
            <ul className="divide-y divide-surface-deep rounded-sm border border-surface-deep bg-paper-raised">
              {outstanding.map((mod) => (
                <li key={`${mod.module.id}-${mod.id}`}>
                  <Link
                    href={`/lecturer/modules/${mod.module.id}/lectures/${mod.id}`}
                    className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors duration-200 hover:bg-surface/70"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-semibold text-ink">
                        <span className="link-wipe">
                          {mod.number}. {mod.title}
                        </span>
                      </span>
                      <span className={`block truncate ${META.base}`}>
                        {mod.module.title}
                        {mod.updatedOn
                          ? ` · last edited ${formatDate(mod.updatedOn)}`
                          : " · never edited"}
                      </span>
                    </span>
                    <Badge tone={LECTURE_STATE_TONE[mod.state]}>
                      {LECTURE_STATE_LABEL[mod.state]}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        ) : null
      }

      {/* ------------------------------------------------------- modules */}
      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <Section
          title="Your modules"
          className="lg:col-span-2"
          action={
            <Link
              href="/lecturer/modules"
              className="link-wipe text-lg font-semibold text-primary"
            >
              All modules
            </Link>
          }
        >
          <ul className="space-y-4">
            {load.modules.map((mdl) => {
              const written = Math.round(
                (mdl.publishedLectures / mdl.lectureCount) * 100,
              );

              return (
                <li
                  key={mdl.id}
                  className="rounded-sm border border-surface-deep bg-paper-raised p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/lecturer/modules/${mdl.id}`}
                        className="block text-lg font-semibold text-ink"
                      >
                        <span className="link-wipe">{mdl.title}</span>
                      </Link>
                      <p className={`mt-1 ${META.base}`}>
                        {mdl.enrolments
                          ? `${formatNumber(mdl.enrolments)} learners enrolled`
                          : "Not open to learners yet"}
                      </p>
                    </div>
                    <Badge tone={mdl.status === "draft" ? "neutral" : "done"}>
                      {mdl.status === "draft" ? "Draft" : "Published"}
                    </Badge>
                  </div>

                  <div className="mt-5 flex items-center gap-4">
                    <ProgressBar
                      percent={written}
                      label={`${mdl.title}: ${written}% of lectures published`}
                      className="flex-1"
                    />
                    <span className="shrink-0 tabular-nums text-sm text-muted">
                      {mdl.publishedLectures}/{mdl.lectureCount} written
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section
          title="What learners said"
          action={
            <Link
              href="/lecturer/modules"
              className="link-wipe text-sm font-semibold text-primary"
            >
              By module
            </Link>
          }
        >
          {reviews.length ? (
            <ul className="space-y-3">
              {reviews.slice(0, 4).map((review) => (
                <li
                  key={review.id}
                  className="rounded-sm border border-surface-deep bg-paper-raised px-5 py-4"
                >
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <StarFilledIcon
                        key={index}
                        className={`size-4 ${index < review.rating ? "text-accent" : "text-surface-deep"}`}
                      />
                    ))}
                    <span className="sr-only">{review.rating} out of 5</span>
                  </span>
                  <p className={`mt-2 ${BODY.base}`}>{review.body}</p>
                  <p className={`mt-2 ${META.base}`}>
                    {formatDate(review.submittedOn)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <Panel>
              <p className={BODY.base}>
                Nothing published yet. Reviews appear here once an administrator
                has moderated them.
              </p>
            </Panel>
          )}
        </Section>
      </div>

      {/* ------------------------------------------------ quizzes & learners */}
      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-2`}>
        <Section
          title="How the quizzes are doing"
          action={
            <Link
              href="/lecturer/quizzes"
              className="link-wipe text-lg font-semibold text-primary"
            >
              All quizzes
            </Link>
          }
        >
          {quizzes.some((quiz) => quiz.stats) ? (
            <ul className="divide-y divide-surface-deep rounded-sm border border-surface-deep bg-paper-raised">
              {[...quizzes]
                .filter((quiz) => quiz.stats)
                .sort(
                  (a, b) =>
                    (a.stats?.averageScore ?? 0) - (b.stats?.averageScore ?? 0),
                )
                .slice(0, 4)
                .map(({ mod, stats }) => (
                  <li key={mod.id} className="px-5 py-4">
                    <Link
                      href={`/lecturer/modules/${mod.module.id}/lectures/${mod.id}/quiz`}
                      className="block truncate text-lg font-semibold text-ink"
                    >
                      <span className="link-wipe">
                        {mod.number}. {mod.title}
                      </span>
                    </Link>
                    <div className="mt-2 flex items-center gap-3">
                      <ProgressBar
                        percent={stats?.passRate ?? 0}
                        label={`${mod.title}: ${stats?.passRate}% pass rate`}
                        className="flex-1"
                      />
                      <span className="shrink-0 tabular-nums text-sm text-muted">
                        {stats?.passRate}% pass
                      </span>
                      {quizNeedsAttention(stats) ? (
                        <Badge tone="warn">Low</Badge>
                      ) : null}
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <Panel>
              <p className={BODY.base}>
                No quiz results are recorded for your modules in this
                prototype.
              </p>
            </Panel>
          )}
        </Section>

        <Section
          title="Your learners"
          action={
            <Link
              href="/lecturer/learners"
              className="link-wipe text-lg font-semibold text-primary"
            >
              All learners
            </Link>
          }
        >
          <Panel>
            <p className={BODY.base}>
              {learners.length} of the learners in this prototype&rsquo;s sample
              are enrolled on your modules, and{" "}
              {load.published} published lectures stand between them and a
              certificate.
            </p>
            <p className={`mt-3 ${META.base}`}>
              One person stopping at lecture four is a person. Eleven stopping at
              lecture four is the lecture.
            </p>
          </Panel>
        </Section>
      </div>

      <PrototypeNote className={CONSOLE.stack}>
        You are seeing this console as {member.name}. Switch viewpoint at the
        foot of the navigation.
      </PrototypeNote>
    </PageBody >
  );
}
