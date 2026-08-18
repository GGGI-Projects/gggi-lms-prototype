import Link from "next/link";
import type { Lecture } from "@/content/curriculum";
import { Badge } from "@/components/student-portal/ui";
import {
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  PlayIcon,
  ReadingIcon,
  VideoIcon,
} from "@/components/student-portal/icons";
import {
  formatDuration,
  type LectureState,
  type QuizStatus,
  type WrittenStatus,
} from "@/lib/portal";
import { META } from "@/lib/theme";

/**
 * One lecture in a module's contents.
 *
 * The status marker on the left is the row's whole hierarchy. A finished
 * lecture carries a filled check, the one you are on carries a play triangle in
 * amber, and everything else carries its own number in outline - which is the
 * same treatment the landing page gives its module numerals, at a size that
 * fits a list.
 *
 * EVERY ROW IS STILL A LINK, including lectures far ahead of where the
 * learner has reached - opening one directly is never blocked, so a curious
 * or returning learner can always see what is ahead. What IS gated now is the
 * "Next lecture" action on a lecture's own page, once its quiz - and its
 * written questions, if it has any - have to be passed first. That gate is
 * `lectureGateCleared()` in `lib/portal.ts`; this row only ever reports it,
 * never enforces it.
 */
export function LectureRow({
  moduleId,
  lecture,
  state,
  quiz,
  score,
  hasWritten = false,
  written = "not-required",
}: {
  moduleId: string;
  lecture: Lecture;
  state: LectureState;
  quiz: QuizStatus;
  score?: number;
  /** Whether this lecture has written questions at all - most do not. */
  hasWritten?: boolean;
  written?: WrittenStatus;
}) {
  const done = state === "completed";
  const current = state === "current";
  const Icon = lecture.kind === "video" ? VideoIcon : ReadingIcon;

  return (
    <Link
      href={`/modules/${moduleId}/lectures/${lecture.id}`}
      aria-current={current ? "step" : undefined}
      className={`group flex items-start gap-4 px-5 py-5 transition-colors duration-300 sm:gap-5 sm:px-6 ${current ? "bg-accent-pale/60" : "hover:bg-surface/60"
        }`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-full border text-sm font-semibold transition-colors duration-300 ${done
            ? "border-transparent bg-primary text-paper"
            : current
              ? "border-transparent bg-accent text-primary-950"
              : "border-surface-deep bg-paper-raised text-muted group-hover:border-muted-light group-hover:text-ink"
          }`}
      >
        {done ? (
          <CheckIcon className="size-4" />
        ) : current ? (
          <PlayIcon className="size-4" />
        ) : (
          lecture.number
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-display text-lg leading-snug tracking-tight text-ink sm:text-xl">
            {lecture.title}
          </span>
          {current ? <Badge tone="active">You are here</Badge> : null}
        </span>

        <span className="mt-1.5 line-clamp-2 block text-lg leading-relaxed text-ink-soft">
          {lecture.summary}
        </span>

        <span className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 ${META.base}`}>
          <span className="inline-flex items-center gap-1.5">
            <Icon className="size-4" />
            {lecture.kind === "video" ? "Video" : "Reading"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="size-4" />
            {formatDuration(lecture.minutes)}
          </span>
          {/* The quiz state is shown on the lecture it belongs to rather than
              only on the quizzes page, because this is where a learner is
              looking when they wonder whether they finished something. */}
          {quiz === "passed" ? (
            <span className="font-medium text-primary">Quiz passed · {score}%</span>
          ) : quiz === "failed" ? (
            <span className="font-medium text-clay">Quiz not passed · {score}%</span>
          ) : done ? (
            <span className="font-medium text-accent-strong">Quiz to take</span>
          ) : null}
          {hasWritten && written === "passed" ? (
            <span className="font-medium text-primary">Written passed</span>
          ) : hasWritten && written === "failed" ? (
            <span className="font-medium text-clay">Written not passed</span>
          ) : hasWritten && quiz === "passed" ? (
            <span className="font-medium text-accent-strong">Written to do</span>
          ) : null}
        </span>
      </span>

      <ChevronRightIcon className="mt-3 size-5 shrink-0 text-muted-light transition-transform duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-ink" />
    </Link>
  );
}
