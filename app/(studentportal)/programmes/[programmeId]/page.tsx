import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/ui/action-button";
import { ProgrammeScene } from "@/components/art/scenes";
import { ModuleRow } from "@/components/student-portal/module-row";
import {
  Badge,
  DefinitionList,
  PageBody,
  PageHeader,
  Panel,
  ProgressBar,
  ProgressRing,
} from "@/components/student-portal/ui";
import {
  ArrowRightIcon,
  CertificateIcon,
  CheckIcon,
  QuizIcon,
} from "@/components/student-portal/icons";
import { PROGRAMMES } from "@/content/site";
import {
  formatDate,
  formatDuration,
  moduleState,
  progressFor,
  quizStatus,
} from "@/lib/portal";
import { BODY, EYEBROW, HEADING, META } from "@/lib/theme";

type Params = { params: Promise<{ programmeId: string }> };

/** All five are known at build time, so all five are prerendered. */
export function generateStaticParams() {
  return PROGRAMMES.map((programme) => ({ programmeId: programme.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { programmeId } = await params;
  const programme = PROGRAMMES.find((entry) => entry.id === programmeId);
  if (!programme) return { title: "Programme not found" };

  return { title: programme.title, description: programme.summary };
}

/**
 * A single programme, from the inside.
 *
 * The page answers three questions in the order they get asked: where am I in
 * this, what is in it, and what do I get at the end. So the progress panel is
 * pinned beside the contents rather than sitting above them - a learner
 * scrolling a ten-module list should not have to scroll back up to see how far
 * through it they are.
 *
 * The contents list is the page. Everything else is framing, and it is kept
 * short enough that the first module row is visible without scrolling on a
 * laptop.
 */
export default async function ProgrammePage({ params }: Params) {
  const { programmeId } = await params;
  const progress = progressFor(programmeId);

  // An unknown id is a 404 rather than an empty page. The prototype has five
  // programmes and a hand-typed URL is the only way to get here otherwise.
  if (!progress) notFound();

  const { programme, modules, enrolment, status, nextModule, certificate } =
    progress;

  const done = status === "completed";
  const resumeHref = nextModule
    ? `/programmes/${programme.id}/modules/${nextModule.id}`
    : `/programmes/${programme.id}/modules/${modules[0].id}`;

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/programmes", label: "All programmes" }}
        eyebrow={`Programme ${programme.number}`}
        title={programme.title}
        lead={programme.summary}
        actions={
          <ActionButton href={resumeHref} variant="solid" size="sm" className="group">
            {done ? "Review" : progress.enrolled ? "Resume" : "Enrol and start"}
            <ArrowRightIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
          </ActionButton>
        }
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        {/* ------------------------------------------------------- main */}
        <div className="min-w-0 lg:col-span-8">
          <ProgrammeScene
            scene={programme.scene}
            className="h-40 w-full rounded-md object-cover sm:h-52"
          />

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge>{programme.level}</Badge>
            <Badge>{modules.length} modules</Badge>
            <Badge>{formatDuration(progress.minutesTotal)} of material</Badge>
            <Badge tone="info">Free · self-paced</Badge>
          </div>

          <section className="mt-10">
            <h2 className={HEADING.card}>What you will cover</h2>
            <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {programme.topics.map((topic) => (
                <li key={topic} className={`flex items-start gap-3 ${BODY.base}`}>
                  <span className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-accent" />
                  {topic}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className={HEADING.card}>Programme contents</h2>
              <p className={META.base}>
                {progress.completedCount} of {modules.length} completed
              </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-sm border border-surface-deep bg-paper-raised">
              <div className="divide-y divide-surface-deep">
                {modules.map((module) => (
                  <ModuleRow
                    key={module.id}
                    programmeId={programme.id}
                    module={module}
                    state={moduleState(progress, module.id)}
                    quiz={quizStatus(programme.id, module.id)}
                    score={enrolment?.quizScores[module.id]}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ------------------------------------------------------ aside */}
        <aside className="lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <Panel>
              <div className="flex items-center gap-5">
                <ProgressRing
                  percent={progress.percent}
                  label={programme.title}
                  size={64}
                />
                <div className="min-w-0">
                  <p className={EYEBROW.muted}>Your progress</p>
                  <p className="mt-2 text-lg font-semibold leading-snug text-ink">
                    {done
                      ? "Programme complete"
                      : progress.enrolled
                        ? `${progress.completedCount} of ${modules.length} modules`
                        : "Not started yet"}
                  </p>
                </div>
              </div>

              <ProgressBar
                percent={progress.percent}
                label={`${programme.title} progress`}
                className="mt-6"
              />

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-surface-deep pt-5">
                <div>
                  <dt className={META.base}>Time studied</dt>
                  <dd className="mt-1 font-display text-lg text-ink">
                    {formatDuration(progress.minutesDone)}
                  </dd>
                </div>
                <div>
                  <dt className={META.base}>Time remaining</dt>
                  <dd className="mt-1 font-display text-lg text-ink">
                    {formatDuration(
                      progress.minutesTotal - progress.minutesDone,
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-6">
                <ActionButton
                  href={resumeHref}
                  variant="solid"
                  size="sm"
                  className="group w-full"
                >
                  {done ? "Review programme" : progress.enrolled ? "Resume" : "Start module 01"}
                  <ArrowRightIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
                </ActionButton>
              </div>
            </Panel>

            <CertificatePanel
              programmeTitle={programme.title}
              certificateHref={certificate ? `/certificates/${certificate.id}` : undefined}
              reference={certificate?.reference}
              issuedOn={certificate?.issuedOn}
              modulesLeft={modules.length - progress.completedCount}
              quizzesLeft={
                modules.length - progress.quizzesPassed
              }
            />

            <Panel>
              <p className={EYEBROW.muted}>Programme facts</p>
              <DefinitionList
                className="mt-4"
                items={[
                  { term: "Level", value: programme.level },
                  { term: "Modules", value: modules.length },
                  {
                    term: "Material",
                    value: formatDuration(progress.minutesTotal),
                  },
                  { term: "Quizzes", value: `${modules.length} · unlimited attempts` },
                  { term: "Cost", value: "Free" },
                  {
                    term: "Enrolled",
                    value: enrolment ? formatDate(enrolment.enrolledOn) : "Not yet",
                  },
                ]}
              />
            </Panel>
          </div>
        </aside>
      </div>
    </PageBody>
  );
}

/**
 * The credential, stated as a condition rather than a promise.
 *
 * Before it is earned this panel says exactly what is left - so many modules,
 * so many quizzes - because "keep going!" is not information. After it is
 * earned it becomes the link to the certificate itself.
 */
function CertificatePanel({
  programmeTitle,
  certificateHref,
  reference,
  issuedOn,
  modulesLeft,
  quizzesLeft,
}: {
  programmeTitle: string;
  certificateHref?: string;
  reference?: string;
  issuedOn?: string;
  modulesLeft: number;
  quizzesLeft: number;
}) {
  if (certificateHref) {
    return (
      <article className="relative isolate overflow-hidden rounded-sm bg-primary-950 px-7 py-7 text-tint">
        <p className={EYEBROW.onDark}>Certificate earned</p>
        <p className="mt-4 text-lg leading-relaxed">
          You completed {programmeTitle} and its quizzes.
        </p>
        <p className="mt-4 font-display text-lg tracking-tight text-paper">
          {reference}
        </p>
        <p className="mt-1 text-sm text-primary-500">
          Issued {issuedOn ? formatDate(issuedOn) : null}
        </p>
        <Link
          href={certificateHref}
          className="link-wipe mt-5 inline-flex items-center gap-2 text-lg font-semibold text-accent-soft"
        >
          View certificate
          <ArrowRightIcon className="size-4" />
        </Link>
      </article>
    );
  }

  return (
    <Panel>
      <div className="flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-pale text-accent-strong">
          <CertificateIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-ink">
            Certificate on completion
          </p>
          <p className={`mt-2 ${BODY.base}`}>
            Finish every module and pass every quiz and it issues immediately,
            carrying a reference anyone can check.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5 border-t border-surface-deep pt-5">
        <li className={`flex items-center gap-3 ${META.base}`}>
          <CheckIcon className="size-4 shrink-0 text-primary" />
          {modulesLeft === 0
            ? "All modules completed"
            : `${modulesLeft} ${modulesLeft === 1 ? "module" : "modules"} left`}
        </li>
        <li className={`flex items-center gap-3 ${META.base}`}>
          <QuizIcon className="size-4 shrink-0 text-primary" />
          {quizzesLeft === 0
            ? "All quizzes passed"
            : `${quizzesLeft} ${quizzesLeft === 1 ? "quiz" : "quizzes"} to pass`}
        </li>
      </ul>
    </Panel>
  );
}
