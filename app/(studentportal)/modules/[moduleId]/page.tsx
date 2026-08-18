import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/ui/action-button";
import { ModuleScene } from "@/components/art/scenes";
import { LectureRow } from "@/components/student-portal/lecture-row";
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
import { MODULES } from "@/content/site";
import {
  formatDate,
  formatDuration,
  hasWrittenQuestions,
  lectureState,
  progressFor,
  quizStatus,
  writtenStatus,
} from "@/lib/portal";
import { BODY, EYEBROW, HEADING, META } from "@/lib/theme";

type Params = { params: Promise<{ moduleId: string }> };

/** All five are known at build time, so all five are prerendered. */
export function generateStaticParams() {
  return MODULES.map((mdl) => ({ moduleId: mdl.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { moduleId } = await params;
  const mdl = MODULES.find((entry) => entry.id === moduleId);
  if (!mdl) return { title: "Module not found" };

  return { title: mdl.title, description: mdl.summary };
}

/**
 * A single module, from the inside.
 *
 * The page answers three questions in the order they get asked: where am I in
 * this, what is in it, and what do I get at the end. So the progress panel is
 * pinned beside the contents rather than sitting above them - a learner
 * scrolling a ten-lecture list should not have to scroll back up to see how far
 * through it they are.
 *
 * The contents list is the page. Everything else is framing, and it is kept
 * short enough that the first lecture row is visible without scrolling on a
 * laptop.
 */
export default async function ModulePage({ params }: Params) {
  const { moduleId } = await params;
  const progress = progressFor(moduleId);

  // An unknown id is a 404 rather than an empty page. The prototype has five
  // modules and a hand-typed URL is the only way to get here otherwise.
  if (!progress) notFound();

  const { module: mdl, lectures, enrolment, status, nextLecture, certificate } =
    progress;

  const done = status === "completed";
  const resumeHref = nextLecture
    ? `/modules/${mdl.id}/lectures/${nextLecture.id}`
    : `/modules/${mdl.id}/lectures/${lectures[0].id}`;

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/modules", label: "All modules" }}
        eyebrow={`Module ${mdl.number}`}
        title={mdl.title}
        lead={mdl.summary}
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
          <ModuleScene
            scene={mdl.scene}
            className="h-40 w-full rounded-md object-cover sm:h-52"
          />

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge>{mdl.level}</Badge>
            <Badge>{lectures.length} lectures</Badge>
            <Badge>{formatDuration(progress.minutesTotal)} of material</Badge>
            <Badge tone="info">Free · self-paced</Badge>
          </div>

          <section className="mt-10">
            <h2 className={HEADING.card}>What you will cover</h2>
            <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {mdl.topics.map((topic) => (
                <li key={topic} className={`flex items-start gap-3 ${BODY.base}`}>
                  <span className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-accent" />
                  {topic}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className={HEADING.card}>Module contents</h2>
              <p className={META.base}>
                {progress.completedCount} of {lectures.length} completed
              </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-sm border border-surface-deep bg-paper-raised">
              <div className="divide-y divide-surface-deep">
                {lectures.map((lecture) => (
                  <LectureRow
                    key={lecture.id}
                    moduleId={mdl.id}
                    lecture={lecture}
                    state={lectureState(progress, lecture.id)}
                    quiz={quizStatus(mdl.id, lecture.id)}
                    score={enrolment?.quizScores[lecture.id]}
                    hasWritten={hasWrittenQuestions(lecture.id)}
                    written={writtenStatus(mdl.id, lecture.id)}
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
                  label={mdl.title}
                  size={64}
                />
                <div className="min-w-0">
                  <p className={EYEBROW.muted}>Your progress</p>
                  <p className="mt-2 text-lg font-semibold leading-snug text-ink">
                    {done
                      ? "Module complete"
                      : progress.enrolled
                        ? `${progress.completedCount} of ${lectures.length} lectures`
                        : "Not started yet"}
                  </p>
                </div>
              </div>

              <ProgressBar
                percent={progress.percent}
                label={`${mdl.title} progress`}
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
                  {done ? "Review module" : progress.enrolled ? "Resume" : "Start lecture 01"}
                  <ArrowRightIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
                </ActionButton>
              </div>
            </Panel>

            <CertificatePanel
              moduleTitle={mdl.title}
              certificateHref={certificate ? `/certificates/${certificate.id}` : undefined}
              reference={certificate?.reference}
              issuedOn={certificate?.issuedOn}
              lecturesLeft={lectures.length - progress.completedCount}
              quizzesLeft={
                lectures.length - progress.quizzesPassed
              }
            />

            <Panel>
              <p className={EYEBROW.muted}>Module facts</p>
              <DefinitionList
                className="mt-4"
                items={[
                  { term: "Level", value: mdl.level },
                  { term: "Lectures", value: lectures.length },
                  {
                    term: "Material",
                    value: formatDuration(progress.minutesTotal),
                  },
                  { term: "Quizzes", value: `${lectures.length} · unlimited attempts` },
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
 * Before it is earned this panel says exactly what is left - so many lectures,
 * so many quizzes - because "keep going!" is not information. After it is
 * earned it becomes the link to the certificate itself.
 */
function CertificatePanel({
  moduleTitle,
  certificateHref,
  reference,
  issuedOn,
  lecturesLeft,
  quizzesLeft,
}: {
  moduleTitle: string;
  certificateHref?: string;
  reference?: string;
  issuedOn?: string;
  lecturesLeft: number;
  quizzesLeft: number;
}) {
  if (certificateHref) {
    return (
      <article className="relative isolate overflow-hidden rounded-sm bg-primary-950 px-7 py-7 text-tint">
        <p className={EYEBROW.onDark}>Certificate earned</p>
        <p className="mt-4 text-lg leading-relaxed">
          You completed {moduleTitle} - every quiz, and every written question
          along with it, passed.
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
            Finish every lecture and pass every quiz - and any written
            questions a lecture carries - and it issues immediately, carrying
            a reference anyone can check.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5 border-t border-surface-deep pt-5">
        <li className={`flex items-center gap-3 ${META.base}`}>
          <CheckIcon className="size-4 shrink-0 text-primary" />
          {lecturesLeft === 0
            ? "All lectures completed"
            : `${lecturesLeft} ${lecturesLeft === 1 ? "lecture" : "lectures"} left`}
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
