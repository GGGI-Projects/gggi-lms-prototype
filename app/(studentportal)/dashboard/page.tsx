import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton } from "@/components/ui/action-button";
import { ModuleScene } from "@/components/art/scenes";
import { ModuleCard } from "@/components/student-portal/module-card";
import {
  EmptyState,
  PageBody,
  PageHeader,
  Panel,
  ProgressBar,
  Section,
  StatTile,
} from "@/components/student-portal/ui";
import {
  ArrowRightIcon,
  CertificateIcon,
  CheckIcon,
  ClockIcon,
  ModulesIcon,
  QuizIcon,
  ReadingIcon,
  VideoIcon,
} from "@/components/student-portal/icons";
import { LEARNER, type ActivityItem } from "@/content/portal";
import {
  allProgress,
  allQuizzes,
  enrolledProgress,
  formatDate,
  formatDuration,
  learnerTotals,
  recentActivity,
  resumePoint,
} from "@/lib/portal";
import { BODY, EYEBROW, HEADING, META, PORTAL } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your modules, your progress and your certificates.",
};

/**
 * The screen a learner sees most.
 *
 * ORDERED BY WHAT THEY CAME FOR. Almost everyone opening this page is here to
 * carry on with the lecture they stopped on, so that is the first thing under
 * the greeting and it is a full-width block rather than one card in a grid.
 * The totals row sits below it, not above: it is reassurance, and reassurance
 * does not go in front of the door.
 *
 * Nothing on this page animates on scroll. The landing page's reveals exist to
 * hold the attention of someone deciding; this is a tool, and a tool that
 * re-animates its own contents every time you open it is one you learn to
 * scroll past.
 */
export default function DashboardPage() {
  const totals = learnerTotals();
  const resume = resumePoint();
  const enrolled = enrolledProgress();
  const catalogue = allProgress().filter((entry) => !entry.enrolled);
  const activity = recentActivity();

  // Lectures finished whose gate is still not cleared - quiz unpassed, or
  // (where the lecture has any) written questions unpassed. This is the one
  // thing on the platform that is genuinely outstanding - everything else is
  // optional - so it gets a panel rather than a line in the activity feed.
  const outstanding = allQuizzes().filter(
    (quiz) => quiz.lectureCompleted && !quiz.gateCleared,
  );

  return (
    <PageBody>
      <PageHeader
        eyebrow="Your dashboard"
        title={`Welcome back, ${LEARNER.name.split(" ")[0]}.`}
        lead={
          enrolled.length
            ? `You are enrolled in ${enrolled.length} modules and have finished ${totals.lecturesCompleted} lectures. Everything is where you left it.`
            : "Nothing is enrolled yet. Every module is free, self-paced, and open to you right now."
        }
      />

      {resume ? (
        <div className="mt-10">
          <ContinueCard progress={resume} />
        </div>
      ) : null}

      <dl className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          value={totals.modules}
          label="Modules enrolled"
          hint={`${catalogue.length} more available`}
        />
        <StatTile
          value={totals.lecturesCompleted}
          label="Lectures completed"
          hint="Across all modules"
        />
        <StatTile
          value={`${totals.hours}h`}
          label="Time studied"
          hint="Counted from completed lectures"
        />
        <StatTile
          value={totals.certificates}
          label="Certificates earned"
          hint="Each one carries a reference"
        />
      </dl>

      <div className={`grid gap-10 lg:grid-cols-12 ${PORTAL.stack}`}>
        <div className="lg:col-span-8">
          <Section
            title="Your modules"
            action={
              <Link
                href="/modules"
                className="link-wipe inline-flex items-center gap-1.5 text-lg font-semibold text-primary"
              >
                Browse all
                <ArrowRightIcon className="size-4" />
              </Link>
            }
          >
            {enrolled.length ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {enrolled.map((entry) => (
                  <ModuleCard key={entry.module.id} progress={entry} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="You have not enrolled yet"
                body="Pick the subject closest to your work. You can enrol in as many as you like and leave whenever you want - your place is held."
                action={
                  <ActionButton href="/modules" variant="solid" size="sm">
                    Browse modules
                  </ActionButton>
                }
              />
            )}
          </Section>
        </div>

        <div className="space-y-10 lg:col-span-4">
          <OutstandingQuizzes items={outstanding} />
          <ActivityFeed items={activity} />
        </div>
      </div>

      {catalogue.length ? (
        <Section
          className={PORTAL.stack}
          title="Room for another"
          description="Each module is self-contained, so there is no order to follow and nothing to finish first."
        >
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {catalogue.map((entry) => (
              <ModuleCard key={entry.module.id} progress={entry} />
            ))}
          </div>
        </Section>
      ) : null}
    </PageBody>
  );
}

/* -------------------------------------------------------------- continue */

/**
 * The resume block.
 *
 * The dark ground is the account pages' panel and the rail, appearing a third
 * time - it is the platform's way of saying "this is yours" - and it makes the
 * one action on this screen impossible to miss without the page needing a
 * second accent colour to shout with.
 */
function ContinueCard({
  progress,
}: {
  progress: NonNullable<ReturnType<typeof resumePoint>>;
}) {
  const mod = progress.nextLecture;
  if (!mod) return null;

  const href = `/modules/${progress.module.id}/lectures/${mod.id}`;
  const Icon = mod.kind === "video" ? VideoIcon : ReadingIcon;

  return (
    <article className="relative isolate overflow-hidden rounded-lg bg-primary-950 px-7 py-8 text-tint sm:px-10 sm:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 -z-10 size-[30rem] rounded-full bg-primary-600/25 blur-[120px]"
      />

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="min-w-0 flex-1">
          <p className={EYEBROW.onDark}>Continue where you left off</p>

          <h2 className="font-display mt-4 text-2xl leading-snug tracking-tight text-paper text-balance sm:text-3xl">
            {mod.number}. {mod.title}
          </h2>

          <p className="measure-wide mt-4 text-lg leading-relaxed">
            {mod.summary}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-primary-500">
            <span className="inline-flex items-center gap-2">
              <ModulesIcon className="size-4" />
              {progress.module.title}
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon className="size-4" />
              {mod.kind === "video" ? "Video lecture" : "Reading lecture"}
            </span>
            <span className="inline-flex items-center gap-2">
              <ClockIcon className="size-4" />
              {formatDuration(mod.minutes)}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ActionButton href={href} variant="solid" size="md" className="group">
              Resume lecture
              <ArrowRightIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
            </ActionButton>
            <Link
              href={`/modules/${progress.module.id}`}
              className="link-wipe text-lg font-semibold text-accent-soft"
            >
              See the whole module
            </Link>
          </div>
        </div>

        <div className="w-full shrink-0 lg:w-72">
          <ModuleScene
            scene={progress.module.scene}
            className="h-32 w-full rounded-md object-cover lg:h-40"
          />
          <div className="mt-5 flex items-baseline justify-between gap-4">
            <p className="text-sm text-primary-500">
              {progress.completedCount} of {progress.lectureCount} lectures done
            </p>
            <p className="font-display text-lg leading-none text-paper">
              {progress.percent}%
            </p>
          </div>
          <ProgressBar
            percent={progress.percent}
            label={`${progress.module.title} progress`}
            // The track has to be lighter than the ground it sits on here; the
            // page-palette `surface-deep` all but disappears on `primary-950`.
            className="mt-2.5 bg-primary-800"
          />
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------- side panels */

function OutstandingQuizzes({
  items,
}: {
  items: ReturnType<typeof allQuizzes>;
}) {
  return (
    <section>
      <h2 className={HEADING.card}>Quizzes to take</h2>
      <div className="mt-6">
        {items.length ? (
          <Panel className="p-0! divide-y divide-surface-deep">
            {items.slice(0, 4).map((quiz) => (
              <Link
                key={`${quiz.module.id}-${quiz.lecture.id}`}
                href={quiz.href}
                className="group flex items-start gap-4 px-6 py-5 transition-colors hover:bg-surface/60"
              >
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-accent-pale text-accent-strong">
                  <QuizIcon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-snug text-ink">
                    {quiz.lecture.title}
                  </span>
                  <span className={`mt-1 block ${META.base}`}>
                    {quiz.module.title}
                  </span>
                </span>
                <ArrowRightIcon className="mt-1 size-4 shrink-0 text-muted transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
              </Link>
            ))}
          </Panel>
        ) : (
          <Panel>
            <div className="flex items-start gap-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint-mist text-primary">
                <CheckIcon className="size-5" />
              </span>
              <p className={BODY.base}>
                Nothing outstanding. Every lecture you have finished has a
                passed quiz - and any written questions it carries - behind
                it.
              </p>
            </div>
          </Panel>
        )}
      </div>
    </section>
  );
}

/**
 * `kind` chooses the icon and only the icon. The feed is a single list in one
 * treatment - four coloured rows would imply four categories a learner is
 * meant to distinguish, and there is nothing to do with the distinction.
 */
const ACTIVITY_ICON = {
  lecture: ReadingIcon,
  quiz: QuizIcon,
  certificate: CertificateIcon,
  enrolment: ModulesIcon,
} as const;

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <section>
      <h2 className={HEADING.card}>Recent activity</h2>
      <div className="mt-6">
        {items.length ? (
          <ol className="space-y-1">
            {items.map((item) => {
              const Icon = ACTIVITY_ICON[item.kind];
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-start gap-4 rounded-sm px-3 py-3 transition-colors hover:bg-surface/70"
                  >
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-surface-deep bg-paper-raised text-muted">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">
                        {item.title}
                      </span>
                      <span className={`mt-0.5 block ${META.base}`}>
                        {item.detail} · {formatDate(item.on)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : (
          <Panel>
            <p className={BODY.base}>
              Nothing here yet. Your progress appears as you work through a
              module.
            </p>
          </Panel>
        )}
      </div>
    </section>
  );
}
