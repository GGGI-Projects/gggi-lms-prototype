import type { Metadata } from "next";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import {
  lectureLoad,
  reviewsForModule,
  staffById,
  studentById,
} from "@/lib/admin";
import { formatDate } from "@/lib/portal";
import {
  Badge,
  Callout,
  MetricCard,
  PageBody,
  PageHeader,
  PersonTag,
  PrototypeNote,
} from "@/components/console/ui";
import { ModerationActions } from "@/components/console/actions";
import { IfCan } from "@/components/console/permission";
import {
  ReviewsBoard,
  type ReviewCard,
  type ReviewFilter,
} from "@/components/console/reviews-board";
import { FlagIcon, StarFilledIcon } from "@/components/console/icons";

export const metadata: Metadata = { title: "Reviews" };

/**
 * Moderation, scoped to this account's own module(s) (FR-MODADM-080) - the
 * same queue shape `/admin/reviews` uses, minus the half of it that page
 * carries and this role never touches: a Lecturer's own profile review can
 * follow that person across several Module Administrators' modules at once,
 * so that queue stays Super-Administrator-only (BR-30). Nothing here reads
 * `REVIEWS`'s lecturer-subject entries at all.
 */
export default function ModuleAdminReviewsPage() {
  const member = staffById(SESSION["module-admin"]);
  if (!member) throw new Error("[module-admin] no session account");

  const load = lectureLoad(member);
  const allReviews = load.modules.flatMap((mdl) => reviewsForModule(mdl.id));
  const pending = [...allReviews.filter((review) => review.status === "pending")].sort(
    (a, b) => Number(Boolean(b.flagged)) - Number(Boolean(a.flagged)),
  );
  const decided = allReviews.filter((review) => review.status !== "pending");
  const published = allReviews.filter((review) => review.status === "published");
  const average =
    published.reduce((sum, review) => sum + review.rating, 0) /
    (published.length || 1);

  return (
    <PageBody>
      <PageHeader
        eyebrow="My modules"
        title="Reviews"
        lead="Learners can review a module once they have finished one of its lectures. Nothing appears on the module page until you have read it."
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
        <MetricCard label="Published" value={published.length} hint="on your modules" />
        <MetricCard
          label="Rejected"
          value={allReviews.filter((review) => review.status === "rejected").length}
          hint="with a reason recorded"
        />
        <MetricCard
          label="Average rating"
          value={published.length ? average.toFixed(1) : "-"}
          hint="across published reviews"
        />
      </div>

      <div className={CONSOLE.stack}>
        <ReviewsBoard
          pending={pending.map((review) => {
            const mdl = load.modules.find(
              (entry) =>
                review.subject.kind === "module" && review.subject.moduleId === entry.id,
            );
            const student = studentById(review.studentId);
            const card: ReviewCard = {
              id: review.id,
              filterKey: mdl?.id ?? "",
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
                          <PersonTag
                            name={review.studentName}
                            avatarUrl={student.avatarUrl}
                            initials={student.initials}
                          />
                        ) : (
                          review.studentName
                        )}
                      </p>
                      <p className={`mt-0.5 ${META.base}`}>
                        {mdl?.title ?? "This module"} · submitted{" "}
                        {formatDate(review.submittedOn)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                      {review.flagged ? (
                        <Badge tone="warn" icon={<FlagIcon className="size-3.5" />}>
                          Flagged automatically
                        </Badge>
                      ) : null}
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <StarFilledIcon
                            key={index}
                            className={`size-4 ${
                              index < review.rating ? "text-accent" : "text-surface-deep"
                            }`}
                          />
                        ))}
                        <span className="sr-only">{review.rating} out of 5</span>
                      </span>
                    </div>
                  </div>

                  <blockquote
                    className={`mt-5 border-l-2 border-surface-deep pl-5 ${BODY.base}`}
                  >
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

                  <IfCan capability="moderateReviews">
                    <ModerationActions reviewId={review.id} author={review.studentName} />
                  </IfCan>
                </li>
              ),
            };
            return card;
          })}
          decided={[...decided]
            .sort((a, b) => b.submittedOn.localeCompare(a.submittedOn))
            .map((review) => {
              const mdl = load.modules.find(
                (entry) =>
                  review.subject.kind === "module" && review.subject.moduleId === entry.id,
              );
              const reviewer = studentById(review.studentId);
              const card: ReviewCard = {
                id: review.id,
                filterKey: mdl?.id ?? "",
                row: (
                  <li key={review.id} className="px-5 py-5 sm:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center text-lg font-semibold text-ink">
                          {reviewer ? (
                            <PersonTag
                              name={review.studentName}
                              avatarUrl={reviewer.avatarUrl}
                              initials={reviewer.initials}
                              size="xs"
                            />
                          ) : (
                            review.studentName
                          )}
                          <span className={`ml-2 font-normal ${META.base}`}>
                            {mdl?.title}
                          </span>
                        </p>
                        <p className={`mt-2 ${BODY.base}`}>{review.body}</p>
                      </div>
                      <Badge tone={review.status === "published" ? "done" : "warn"}>
                        {review.status === "published" ? "Published" : "Rejected"}
                      </Badge>
                    </div>
                  </li>
                ),
              };
              return card;
            })}
          filters={load.modules.map(
            (mdl): ReviewFilter => ({
              value: mdl.id,
              label: mdl.title,
              group: "Modules",
            }),
          )}
        />
      </div>

      <PrototypeNote className="mt-6">
        Moderating here changes what this screen shows and nothing else - no
        review is written, and the learner is not notified.
      </PrototypeNote>
    </PageBody>
  );
}
