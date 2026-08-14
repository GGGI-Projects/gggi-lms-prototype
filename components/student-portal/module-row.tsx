import Link from "next/link";
import type { Module } from "@/content/curriculum";
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
  type ModuleState,
  type QuizStatus,
} from "@/lib/portal";
import { META } from "@/lib/theme";

/**
 * One module in a programme's contents.
 *
 * The status marker on the left is the row's whole hierarchy. A finished
 * module carries a filled check, the one you are on carries a play triangle in
 * amber, and everything else carries its own number in outline - which is the
 * same treatment the landing page gives its programme numerals, at a size that
 * fits a list.
 *
 * NOTHING IS LOCKED. Every row is a link, including modules far ahead of where
 * the learner has reached. The platform promises self-paced study with nothing
 * held back, and a padlock on row seven is that promise being quietly
 * withdrawn - see `moduleState()` in `lib/portal.ts`.
 */
export function ModuleRow({
  programmeId,
  module,
  state,
  quiz,
  score,
}: {
  programmeId: string;
  module: Module;
  state: ModuleState;
  quiz: QuizStatus;
  score?: number;
}) {
  const done = state === "completed";
  const current = state === "current";
  const Icon = module.kind === "video" ? VideoIcon : ReadingIcon;

  return (
    <Link
      href={`/programmes/${programmeId}/modules/${module.id}`}
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
          module.number
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-display text-lg leading-snug tracking-tight text-ink sm:text-xl">
            {module.title}
          </span>
          {current ? <Badge tone="active">You are here</Badge> : null}
        </span>

        <span className="mt-1.5 line-clamp-2 block text-lg leading-relaxed text-ink-soft">
          {module.summary}
        </span>

        <span className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 ${META.base}`}>
          <span className="inline-flex items-center gap-1.5">
            <Icon className="size-4" />
            {module.kind === "video" ? "Video" : "Reading"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="size-4" />
            {formatDuration(module.minutes)}
          </span>
          {/* The quiz state is shown on the module it belongs to rather than
              only on the quizzes page, because this is where a learner is
              looking when they wonder whether they finished something. */}
          {quiz === "passed" ? (
            <span className="font-medium text-primary">Quiz passed · {score}%</span>
          ) : quiz === "failed" ? (
            <span className="font-medium text-clay">Quiz not passed · {score}%</span>
          ) : done ? (
            <span className="font-medium text-accent-strong">Quiz to take</span>
          ) : null}
        </span>
      </span>

      <ChevronRightIcon className="mt-3 size-5 shrink-0 text-muted-light transition-transform duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-ink" />
    </Link>
  );
}
