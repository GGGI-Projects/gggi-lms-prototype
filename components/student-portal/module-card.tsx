import Link from "next/link";
import { ModuleScene } from "@/components/art/scenes";
import { Badge, ProgressBar } from "@/components/student-portal/ui";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "@/components/student-portal/icons";
import { formatDuration, type ModuleProgress } from "@/lib/portal";
import { BODY, META } from "@/lib/theme";

/**
 * One module, as a card.
 *
 * ONE component for both states, not two. An enrolled module and one the
 * learner has never opened are the same object at different points in its
 * life, and splitting them into `<EnrolledCard>` and `<CatalogueCard>` is how
 * the catalogue ends up with a different thumbnail crop and a title half a
 * step smaller than the dashboard's. What changes with the state is the FOOT
 * of the card - a progress bar and "Resume", or a duration and "Start" - and
 * nothing above it.
 *
 * The whole card is one link rather than a card containing a button: a card
 * with a single destination that only responds to a 120px target at the bottom
 * is a card people click three times before it works. The visible pill at the
 * foot is `aria-hidden` for the same reason - it is a label on this link, not
 * a second one.
 */
export function ModuleCard({ progress }: { progress: ModuleProgress }) {
  const { module: mdl, status, percent, lectureCount, completedCount } = progress;

  const href = `/modules/${mdl.id}`;
  const done = status === "completed";
  const started = status === "in-progress";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-surface-deep bg-paper-raised transition-colors duration-500 hover:border-muted-light">
      <ModuleScene
        scene={mdl.scene}
        className="h-28 w-full shrink-0 object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{mdl.level}</Badge>
          {done ? (
            <Badge tone="done" icon={<CheckIcon className="size-3.5" />}>
              Completed
            </Badge>
          ) : started ? (
            <Badge tone="active">In progress</Badge>
          ) : null}
        </div>

        <h3 className="font-display mt-4 text-2xl leading-snug tracking-tight text-ink">
          {/* The stretched link: it covers the card, so the target is the whole
              card while the accessible name stays the title alone. */}
          <Link href={href} className="after:absolute after:inset-0">
            {mdl.title}
          </Link>
        </h3>

        <p className={`mt-3 line-clamp-3 ${BODY.base}`}>{mdl.summary}</p>

        {/* Pushed to the bottom, so a row of cards with two-line and
            three-line titles still has its progress bars on one line. */}
        <div className="mt-6 flex-1" />

        {progress.enrolled ? (
          <>
            <div className="flex items-baseline justify-between gap-4">
              <p className={META.base}>
                {completedCount} of {lectureCount} lectures
              </p>
              <p className="font-display text-lg leading-none text-ink">
                {percent}%
              </p>
            </div>
            <ProgressBar
              percent={percent}
              label={`${mdl.title} progress`}
              className="mt-2.5"
            />
          </>
        ) : (
          <div className={`flex items-center gap-4 ${META.base}`}>
            <span>{lectureCount} lectures</span>
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="size-4" />
              {formatDuration(progress.minutesTotal)}
            </span>
          </div>
        )}

        <p
          aria-hidden="true"
          className="mt-5 inline-flex items-center gap-2 text-lg font-semibold text-primary"
        >
          {done ? "Review module" : started ? "Resume" : "Start this module"}
          <ArrowRightIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
        </p>
      </div>
    </article>
  );
}
