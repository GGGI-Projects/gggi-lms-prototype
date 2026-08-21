"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { StarFilledIcon } from "@/components/student-portal/icons";
import { BODY, EYEBROW, META } from "@/lib/theme";

/**
 * Rating a lecturer, from their own public profile.
 *
 * SAME DEVICE AS `<ReviewForm>` for a module - one star rating, one optional
 * sentence, nothing sent anywhere - but reached from a different place and
 * gated by a different fact: a module review follows from holding its
 * certificate, a lecturer review follows from having finished one of their
 * lectures (see `learnerCompletedLectureBy()` in `lib/admin.ts`). The page
 * that renders this only does so once that check has already passed - see
 * `LecturerReviewGate` on the lecturer profile page for what a learner sees
 * before then.
 */
export function LecturerReviewForm({ lecturerName }: { lecturerName: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div>
        <p className={EYEBROW.muted}>Your review</p>
        <p className={`mt-4 ${BODY.base}`}>
          Thank you - this is a design prototype, so nothing was sent. A real
          review would wait for an administrator to approve it before it
          appeared on {lecturerName}&rsquo;s page, the same as every review
          already there.
        </p>
      </div>
    );
  }

  const shown = hovered || rating;

  return (
    <div>
      <p className={EYEBROW.muted}>Rate {lecturerName}</p>
      <p className={`mt-4 ${BODY.base}`}>
        Worth five minutes if their teaching changed how you do the work - the
        next learner deciding whether to trust this lecturer reads this
        before they open a single lecture.
      </p>

      <form
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (rating) setSent(true);
        }}
      >
        <fieldset>
          <legend className="text-lg font-semibold text-ink">
            Your rating
          </legend>
          <div
            className="mt-2 flex items-center gap-1"
            onMouseLeave={() => setHovered(0)}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHovered(value)}
                onFocus={() => setHovered(value)}
                onBlur={() => setHovered(0)}
                aria-label={`${value} out of 5 stars`}
                aria-pressed={rating === value}
                className="rounded-xs p-0.5 transition-transform duration-150 hover:scale-110 focus-visible:scale-110"
              >
                <StarFilledIcon
                  className={`size-7 transition-colors duration-150 ${
                    value <= shown ? "text-accent" : "text-surface-deep"
                  }`}
                />
              </button>
            ))}
            <span className={`ml-2 ${META.base}`}>
              {rating ? `${rating} out of 5` : "Not rated yet"}
            </span>
          </div>
        </fieldset>

        <label className="mt-6 block">
          <span className="text-lg font-semibold text-ink">
            Your review
          </span>
          <span className="ml-2 text-sm text-muted">Optional</span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            placeholder="What made their teaching worth it, in the words you would use with a colleague deciding whether to take their lecture."
            className="field mt-2"
          />
        </label>

        <div className="mt-6">
          <ActionButton type="submit" variant="solid" size="sm">
            Submit review
          </ActionButton>
          {!rating ? (
            <p className={`mt-2 ${META.base}`}>Choose a star rating first.</p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
