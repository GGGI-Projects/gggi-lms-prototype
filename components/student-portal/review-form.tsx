"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { StarFilledIcon } from "@/components/student-portal/icons";
import { BODY, EYEBROW, META } from "@/lib/theme";

/**
 * Rating a programme, from the certificate that proves it was finished.
 *
 * THE CERTIFICATE PAGE, NOT THE PROGRAMME PAGE. A review is worth reading
 * because the person writing it actually did the thing - the same reason
 * this platform issues a certificate at all - and the moment somebody has
 * just confirmed that is the moment they are holding this document, not
 * three clicks back into a programme they may not open again.
 *
 * ONE FORM, NOT A DIALOG. Rating something is not a workflow with steps to
 * step out of; it is one decision (how many stars) and one optional
 * sentence, and both fit in the space a "Download as PDF" button already
 * sits in.
 *
 * Nothing is sent anywhere - same rule as every other form on the portal.
 * What the note after submitting says is true of the finished platform too:
 * a review does not appear the moment it is written. `content/operations.ts`
 * carries `holdReviewsForApproval`, and every review in the sample data
 * either waited in that queue or was sent back from it.
 */
export function ReviewForm({ programmeTitle }: { programmeTitle: string }) {
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
          appeared anywhere, the same as every review already on the
          platform.
        </p>
      </div>
    );
  }

  const shown = hovered || rating;

  return (
    <div>
      <p className={EYEBROW.muted}>Rate this programme</p>
      <p className={`mt-4 ${BODY.base}`}>
        Worth five minutes if {programmeTitle} changed how you do the work -
        the next person deciding whether to enrol reads this before they read
        the syllabus.
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
            placeholder="What changed because of this programme, in the words you would use with a colleague deciding whether to take it."
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
