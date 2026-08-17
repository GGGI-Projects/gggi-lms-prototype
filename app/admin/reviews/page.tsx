import type { Metadata } from "next";
import Link from "next/link";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { REVIEWS } from "@/content/operations";
import { MANAGED_MODULES } from "@/content/staff";
import {
  managedModule,
  reviewsByStatus,
  staffName,
  studentById,
} from "@/lib/admin";
import { formatDate, formatDateLong } from "@/lib/portal";
import {
  Badge,
  Callout,
  MetricCard,
  PageBody,
  PageHeader,
  PrototypeNote,
} from "@/components/console/ui";
import { ModerationActions } from "@/components/console/actions";
import { IfCan } from "@/components/console/permission";
import { ReviewsBoard, type ReviewCard } from "@/components/console/reviews-board";
import {
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_TONE,
} from "@/components/console/status";
import { FlagIcon, StarFilledIcon } from "@/components/console/icons";

export const metadata: Metadata = { title: "Reviews" };

/**
 * Moderation.
 *
 * A QUEUE, not a table. Every other list in the console answers "where is
 * this one" and is a register; this one answers "what is next" and needs the
 * whole review on screen - you cannot moderate a truncated sentence. So the
 * waiting ones are laid out in full at the top, and everything already decided
 * is underneath in a quieter form, kept because "why was mine rejected" is a
 * question somebody will be asked.
 *
 * FLAGGED REVIEWS COME FIRST inside the queue. Not because they matter more,
 * but because they are the ones where leaving it until tomorrow has a cost.
 */
export default function ReviewsPage() {
  const pending = [...reviewsByStatus("pending")].sort(
    (a, b) => Number(Boolean(b.flagged)) - Number(Boolean(a.flagged)),
  );
  const published = reviewsByStatus("published");
  const rejected = reviewsByStatus("rejected");
  const average =
    published.reduce((sum, review) => sum + review.rating, 0) /
    (published.length || 1);

  return (
    <PageBody>
      <PageHeader
        eyebrow="Learning"
        title="Reviews"
        lead="Learners can review a module once they have finished a lecture of it. Nothing appears on a public page until somebody here has read it."
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          label="Waiting"
          value={pending.length}
          hint={
            pending.some((review) => review.flagged)
              ? `${pending.filter((review) => review.flagged).length} flagged`
              : "nothing flagged"
          }
          goodWhen="down"
        />
        <MetricCard
          label="Published"
          value={published.length}
          hint="on module pages"
        />
        <MetricCard label="Rejected" value={rejected.length} hint="with a reason recorded" />
        <MetricCard
          label="Average rating"
          value={average.toFixed(1)}
          hint="across published reviews"
        />
      </div>

      <div className={CONSOLE.stack}>
        <ReviewsBoard
          pending={pending.map((review) => {
            const mdl = managedModule(review.moduleId);
            const student = studentById(review.studentId);

            const card: ReviewCard = {
              id: review.id,
              moduleId: review.moduleId,
              row: (
                <li
                  key={review.id}
                  className={`rounded-sm border bg-paper-raised p-6 sm:p-7 ${
                    review.flagged ? "border-clay/40" : "border-surface-deep"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-ink">
                        {student ? (
                          <Link
                            href={`/admin/students/${student.id}`}
                            className="link-wipe"
                          >
                            {review.studentName}
                          </Link>
                        ) : (
                          review.studentName
                        )}
                      </p>
                      <p className={`mt-0.5 ${META.base}`}>
                        {mdl?.title} · submitted{" "}
                        {formatDateLong(review.submittedOn)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                      {review.flagged ? (
                        <Badge tone="warn" icon={<FlagIcon className="size-3.5" />}>
                          Flagged automatically
                        </Badge>
                      ) : null}
                      <Stars rating={review.rating} />
                    </div>
                  </div>

                  <blockquote className={`mt-5 border-l-2 border-surface-deep pl-5 ${BODY.base}`}>
                    {review.body}
                  </blockquote>

                  {review.flagged ? (
                    <div className="mt-5">
                      <Callout title="Why this was flagged">
                        It contains what looks like a telephone number. Reviews
                        are public, and a learner posting their own contact
                        details on a government training platform is usually a
                        mistake rather than a choice.
                      </Callout>
                    </div>
                  ) : null}

                  <IfCan
                    capability="moderateReviews"
                    fallback={
                      <ModerationActions
                        reviewId={review.id}
                        author={review.studentName}
                        disabled
                      />
                    }
                  >
                    <ModerationActions
                      reviewId={review.id}
                      author={review.studentName}
                    />
                  </IfCan>
                </li>
              ),
            };
            return card;
          })}
          decided={[...published, ...rejected]
            .sort((a, b) => b.submittedOn.localeCompare(a.submittedOn))
            .map((review) => {
              const card: ReviewCard = {
                id: review.id,
                moduleId: review.moduleId,
                row: (
                  <li key={review.id} className="px-5 py-5 sm:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-lg font-semibold text-ink">
                          {review.studentName}
                          <span className={`ml-2 font-normal ${META.base}`}>
                            {managedModule(review.moduleId)?.title}
                          </span>
                        </p>
                        <p className={`mt-2 ${BODY.base}`}>{review.body}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <Stars rating={review.rating} />
                        <Badge tone={REVIEW_STATUS_TONE[review.status]}>
                          {REVIEW_STATUS_LABEL[review.status]}
                        </Badge>
                      </div>
                    </div>

                    <p className={`mt-3 ${META.base}`}>
                      {review.decidedBy
                        ? `${review.status === "published" ? "Published" : "Rejected"} by ${staffName(review.decidedBy)}`
                        : "Decided"}
                      {review.decidedOn ? ` on ${formatDate(review.decidedOn)}` : null}
                      {review.reason ? ` · ${review.reason}` : null}
                    </p>
                  </li>
                ),
              };
              return card;
            })}
          modules={MANAGED_MODULES.map((mdl) => ({
            id: mdl.id,
            title: mdl.title,
          }))}
        />
      </div>

      <PrototypeNote className="mt-6">
        Moderating here changes what this screen shows and nothing else - no
        review is written, and the learner is not notified. The queue is{" "}
        {REVIEWS.length} reviews in total.
      </PrototypeNote>
    </PageBody>
  );
}

/** Five stars, of which `rating` are filled. The number is announced, not drawn. */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <StarFilledIcon
          key={index}
          className={`size-4 ${index < rating ? "text-accent" : "text-surface-deep"}`}
        />
      ))}
      <span className="sr-only">{rating} out of 5</span>
    </span>
  );
}
