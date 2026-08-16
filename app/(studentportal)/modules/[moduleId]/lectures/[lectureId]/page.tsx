import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/ui/action-button";
import { CompleteButton } from "@/components/student-portal/complete-button";
import { MaterialsList } from "@/components/student-portal/materials-list";
import { VideoStage } from "@/components/student-portal/video-stage";
import {
  Badge,
  PageBody,
  PageHeader,
  Panel,
  ProgressBar,
} from "@/components/student-portal/ui";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  QuizIcon,
  ReadingIcon,
  VideoIcon,
} from "@/components/student-portal/icons";
import { LECTURES, type ContentBlock } from "@/content/curriculum";
import { MODULES } from "@/content/site";
import {
  QUIZ_LENGTH,
  formatDuration,
  lectureNeighbours,
  progressFor,
  quizStatus,
} from "@/lib/portal";
import { BODY, EYEBROW, HEADING, META } from "@/lib/theme";

type Params = { params: Promise<{ moduleId: string; lectureId: string }> };

/** Every lecture of every module - 42 pages, all known at build time. */
export function generateStaticParams() {
  return MODULES.flatMap((mdl) =>
    (LECTURES[mdl.id] ?? []).map((lecture) => ({
      moduleId: mdl.id,
      lectureId: lecture.id,
    })),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { moduleId, lectureId } = await params;
  const mod = LECTURES[moduleId]?.find((entry) => entry.id === lectureId);
  if (!mod) return { title: "Lecture not found" };

  return { title: mod.title, description: mod.summary };
}

/**
 * A single lecture - where the learning actually happens.
 *
 * The lecture page has to hold THREE KINDS OF THING in one column: a recorded
 * video, written material, and files to take away. It renders them in
 * whatever order the lecture declares rather than in fixed slots, because the
 * order carries meaning - a reading lecture opens with its argument, a video
 * lecture opens with the video and uses the writing to say what the video
 * assumed. Fixed slots would put a "Video" heading above an empty frame on
 * eighteen of these pages.
 *
 * The right column is a MAP, not a menu: where this lecture sits in the
 * module, how much of it is done, and the two controls that move you on.
 * It is sticky, so a learner reading 900 words of written material can still
 * see they are on lecture four of nine.
 */
export default async function LecturePage({ params }: Params) {
  const { moduleId, lectureId } = await params;
  const progress = progressFor(moduleId);
  // `mod`, not `lecture`: kept short, and consistent with the abbreviation
  // the rest of the console already uses for this entity.
  const mod = progress?.lectures.find((entry) => entry.id === lectureId);

  if (!progress || !mod) notFound();

  const { module: mdl, lectures, enrolment } = progress;
  const { index, previous, next } = lectureNeighbours(moduleId, lectureId);
  const completed = Boolean(enrolment?.completedLectureIds.includes(mod.id));
  const quiz = quizStatus(moduleId, mod.id);
  const score = enrolment?.quizScores[mod.id];
  const KindIcon = mod.kind === "video" ? VideoIcon : ReadingIcon;

  return (
    <PageBody>
      <PageHeader
        back={{ href: `/modules/${mdl.id}`, label: mdl.title }}
        eyebrow={`Lecture ${mod.number} of ${lectures.length}`}
        title={mod.title}
        lead={mod.summary}
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge icon={<KindIcon className="size-3.5" />}>
          {mod.kind === "video" ? "Video lecture" : "Reading lecture"}
        </Badge>
        <Badge icon={<ClockIcon className="size-3.5" />}>
          {formatDuration(mod.minutes)}
        </Badge>
        {completed ? (
          <Badge tone="done" icon={<CheckIcon className="size-3.5" />}>
            Completed
          </Badge>
        ) : null}
        {quiz === "passed" ? (
          <Badge tone="done">Quiz passed · {score}%</Badge>
        ) : quiz === "failed" ? (
          <Badge tone="warn">Quiz not passed · {score}%</Badge>
        ) : null}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        {/* ------------------------------------------------------- main */}
        <article className="min-w-0 lg:col-span-8">
          <section className="rounded-sm border-l-2 border-accent bg-surface/50 px-6 py-6">
            <h2 className={EYEBROW.muted}>In this lecture</h2>
            <ul className="mt-4 space-y-3">
              {mod.objectives.map((objective) => (
                <li
                  key={objective}
                  className={`flex items-start gap-3 ${BODY.lead}`}
                >
                  <CheckIcon className="mt-1.5 size-4 shrink-0 text-accent-strong" />
                  {objective}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-10 space-y-12">
            {mod.content.map((block, i) => (
              <Block
                key={`${block.type}-${i}`}
                block={block}
                scene={mdl.scene}
              />
            ))}
          </div>

          <QuizCallout
            href={`/modules/${mdl.id}/lectures/${mod.id}/quiz`}
            status={quiz}
            score={score}
          />

          <LectureFooterNav
            moduleId={mdl.id}
            previous={previous}
            next={next}
            index={index}
            total={lectures.length}
          />
        </article>

        {/* ------------------------------------------------------ aside */}
        <aside className="lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <Panel>
              <p className={EYEBROW.muted}>Your progress</p>
              <p className="mt-3 text-lg font-semibold text-ink">
                {progress.completedCount} of {lectures.length} lectures
              </p>
              <ProgressBar
                percent={progress.percent}
                label={`${mdl.title} progress`}
                className="mt-3"
              />

              <CompleteButton
                initiallyComplete={completed}
                className="mt-6"
              />

              {next ? (
                <div className="mt-3">
                  <ActionButton
                    href={`/modules/${mdl.id}/lectures/${next.id}`}
                    variant="solid"
                    size="sm"
                    className="group w-full"
                  >
                    Next lecture
                    <ArrowRightIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
                  </ActionButton>
                </div>
              ) : null}
            </Panel>

            <ContentsPanel
              moduleId={mdl.id}
              lectures={lectures}
              currentId={mod.id}
              completedIds={enrolment?.completedLectureIds ?? []}
            />
          </div>
        </aside>
      </div>
    </PageBody>
  );
}

/* ------------------------------------------------------------------ blocks */

/**
 * One content block.
 *
 * A `switch` over the union rather than three optional props on the lecture, so
 * a fourth kind - an exercise, an embedded dataset - is a new case here and a
 * new member of `ContentBlock`, with TypeScript pointing at this function
 * until it is handled.
 */
function Block({
  block,
  scene,
}: {
  block: ContentBlock;
  scene: Parameters<typeof VideoStage>[0]["scene"];
}) {
  switch (block.type) {
    case "video":
      return (
        <section>
          <h2 className={HEADING.card}>{block.title}</h2>
          <div className="mt-5">
            <VideoStage
              title={block.title}
              minutes={block.minutes}
              scene={scene}
            />
          </div>
          {/* The caption stands in for the video itself while there is no
              file behind the player, so it is set as reading rather than as a
              caption under the frame. */}
          <p className={`measure-wide mt-6 ${BODY.base}`}>{block.caption}</p>
        </section>
      );

    case "text":
      return (
        <section>
          <h2 className={HEADING.card}>{block.heading}</h2>
          <p className={`measure-wide mt-4 ${BODY.base}`}>{block.body}</p>
        </section>
      );

    case "materials":
      return (
        <section>
          <h2 className={HEADING.card}>Materials</h2>
          <p className={`measure-wide mt-3 ${BODY.base}`}>
            Yours to keep, and usable away from the platform.
          </p>
          <div className="mt-5">
            <MaterialsList items={block.items} />
          </div>
        </section>
      );
  }
}

/* ------------------------------------------------------------------- quiz */

/**
 * The end of the lecture.
 *
 * It is a block rather than a line, because finishing the reading and not
 * taking the quiz is the single most common way a learner ends up short of a
 * certificate without knowing it. What it says changes with the state: an
 * invitation, a retake, or a result.
 */
function QuizCallout({
  href,
  status,
  score,
}: {
  href: string;
  status: ReturnType<typeof quizStatus>;
  score?: number;
}) {
  const passed = status === "passed";

  return (
    <section className="mt-12">
      <div
        className={`flex flex-col gap-6 rounded-sm border px-6 py-7 sm:flex-row sm:items-center sm:gap-8 sm:px-8 ${passed
            ? "border-primary/25 bg-tint-mist"
            : "border-accent-600/35 bg-accent-pale"
          }`}
      >
        <span
          className={`grid size-12 shrink-0 place-items-center rounded-full ${passed ? "bg-primary text-paper" : "bg-accent text-primary-950"
            }`}
        >
          {passed ? (
            <CheckIcon className="size-6" />
          ) : (
            <QuizIcon className="size-6" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className={HEADING.card}>
            {passed ? "Quiz passed" : "Lecture quiz"}
          </h2>
          <p className={`mt-2 ${BODY.base}`}>
            {passed
              ? `You scored ${score}%. You can take it again at any time - the highest score is the one that counts.`
              : status === "failed"
                ? `You scored ${score}% last time. There is no limit on attempts - this is a foundation, not a filter.`
                : `${QUIZ_LENGTH} questions, taken whenever you are ready. Retake it as many times as you need.`}
          </p>
        </div>

        <ActionButton href={href} variant="solid" size="sm" className="group shrink-0">
          {status === "not-attempted" ? "Take the quiz" : "Take it again"}
          <ArrowRightIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
        </ActionButton>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- navigation */

function LectureFooterNav({
  moduleId,
  previous,
  next,
  index,
  total,
}: {
  moduleId: string;
  previous?: { id: string; number: string; title: string };
  next?: { id: string; number: string; title: string };
  index: number;
  total: number;
}) {
  return (
    <nav
      aria-label="Lecture navigation"
      className="mt-12 grid gap-4 border-t border-surface-deep pt-8 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          href={`/modules/${moduleId}/lectures/${previous.id}`}
          className="group flex items-center gap-4 rounded-sm border border-surface-deep bg-paper-raised px-5 py-4 transition-colors duration-300 hover:border-muted-light"
        >
          <ChevronLeftIcon className="size-5 shrink-0 text-muted transition-transform duration-500 ease-out-expo group-hover:-translate-x-1" />
          <span className="min-w-0">
            <span className={`block ${META.base}`}>Previous</span>
            <span className="mt-0.5 block truncate font-semibold text-ink">
              {previous.number}. {previous.title}
            </span>
          </span>
        </Link>
      ) : (
        // An empty cell rather than a collapsed grid, so "Next" stays on the
        // right on the first lecture of a module.
        <div className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={`/modules/${moduleId}/lectures/${next.id}`}
          className="group flex items-center gap-4 rounded-sm border border-surface-deep bg-paper-raised px-5 py-4 text-right transition-colors duration-300 hover:border-muted-light sm:justify-end"
        >
          <span className="min-w-0">
            <span className={`block ${META.base}`}>Next</span>
            <span className="mt-0.5 block truncate font-semibold text-ink">
              {next.number}. {next.title}
            </span>
          </span>
          <ChevronRightIcon className="size-5 shrink-0 text-muted transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
        </Link>
      ) : (
        <div className="flex items-center justify-end gap-3 rounded-sm border border-dashed border-muted-light px-5 py-4">
          <span className={META.base}>
            Lecture {index + 1} of {total} - this is the last one
          </span>
        </div>
      )}
    </nav>
  );
}

/* --------------------------------------------------------------- contents */

/** The module's lectures, compressed to fit a sidebar. */
function ContentsPanel({
  moduleId,
  lectures,
  currentId,
  completedIds,
}: {
  moduleId: string;
  lectures: { id: string; number: string; title: string; minutes: number }[];
  currentId: string;
  completedIds: string[];
}) {
  return (
    <Panel className="p-0!">
      <p className={`${EYEBROW.muted} px-6 pt-6`}>Module contents</p>

      {/* Capped and scrollable: a ten-lecture list at full height pushes the
          sticky panel past the viewport, and a sticky element taller than the
          screen stops sticking. */}
      <ol className="mt-4 max-h-[26rem] overflow-y-auto pb-2">
        {lectures.map((lecture) => {
          const current = lecture.id === currentId;
          const done = completedIds.includes(lecture.id);

          return (
            <li key={lecture.id}>
              <Link
                href={`/modules/${moduleId}/lectures/${lecture.id}`}
                aria-current={current ? "page" : undefined}
                className={`flex items-start gap-3 px-6 py-2.5 transition-colors duration-300 ${current
                    ? "bg-accent-pale/70 font-semibold text-ink"
                    : "text-ink-soft hover:bg-surface/60 hover:text-ink"
                  }`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-sm ${done
                      ? "bg-primary text-paper"
                      : current
                        ? "bg-accent text-primary-950"
                        : "border border-surface-deep text-muted"
                    }`}
                >
                  {done ? <CheckIcon className="size-3" /> : lecture.number}
                </span>
                <span className="min-w-0 flex-1 leading-snug">
                  {lecture.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
