"use client";

import { useState } from "react";
import Link from "next/link";
import { ActionButton } from "@/components/ui/action-button";
import { CheckIcon, LockIcon } from "@/components/student-portal/icons";
import { META } from "@/lib/theme";

/**
 * "Mark as complete", and what a lecture already marked complete shows
 * instead.
 *
 * MARKING COMPLETE IS A CLAIM, so it is checked. A lecture is not "complete"
 * because a learner says so - it is complete once its own gate is cleared,
 * the same quiz-and-fill-in-the-blank-questions pass that unlocks the next
 * lecture (see `lectureGateCleared()` in `lib/portal.ts`). Pressing the
 * button before that is true does not quietly no-op; it explains exactly
 * what is still outstanding and links straight to it, so the one click that
 * failed is also the click that fixes it.
 *
 * COMPLETE IS A TAG, NOT A BUTTON - but a small pill sitting where a
 * full-width button used to be read as a demotion, not an achievement, so
 * this borrows the same weight `<QuizCallout>` on this same page gives a
 * passed quiz: a tinted block with an icon of its own, not a corner label.
 * The moment a learner finishes something is exactly the wrong place to
 * shrink the feedback down. There is deliberately no way to un-mark a
 * lecture from here: a claim that was checked on the way in does not need
 * an undo path that was never checked at all.
 *
 * In a prototype with no backend, the check itself is real - it reads the
 * same page-load facts as the rest of the lecture page - but the RESULT of
 * pressing it lives only in this component's own state, same as before.
 */
export function CompleteButton({
  /** True when the mock data already has this lecture finished. */
  initiallyComplete,
  /** Whether this lecture's quiz - and its fill-in-the-blank questions, if
   *  it has any - are already passed. The one thing that decides whether
   *  "complete" can be claimed. */
  gateCleared,
  /** What is still outstanding, shown only when a mark-complete attempt is
   *  blocked. Absent whenever `gateCleared` is true. */
  blockedReason,
  /** Where "keep going" sends a blocked learner. */
  quizHref,
  className = "",
}: {
  initiallyComplete: boolean;
  gateCleared: boolean;
  blockedReason?: string;
  quizHref: string;
  className?: string;
}) {
  const [complete, setComplete] = useState(initiallyComplete);
  const [touched, setTouched] = useState(false);
  const [blocked, setBlocked] = useState(false);

  function markComplete() {
    if (!gateCleared) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    setComplete(true);
    setTouched(true);
  }

  if (complete) {
    return (
      <div className={className}>
        <div className="flex items-center gap-4 rounded-sm border border-primary/25 bg-tint-mist px-5 py-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-paper">
            <CheckIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-ink">Completed</p>
            <p className={META.base}>Nice work - this lecture is done.</p>
          </div>
        </div>

        {touched ? (
          <p role="status" className="mt-3 text-sm text-muted">
            Design prototype - progress is not saved between visits.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <ActionButton
        variant="line"
        size="sm"
        className="w-full"
        onClick={markComplete}
      >
        Mark as complete
      </ActionButton>

      {blocked ? (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2.5 rounded-sm border border-accent-600/35 bg-accent-pale px-4 py-3 text-sm leading-relaxed text-ink"
        >
          <LockIcon className="mt-0.5 size-4 shrink-0 text-accent-strong" />
          <p className="min-w-0 flex-1">
            {blockedReason}{" "}
            <Link
              href={quizHref}
              className="font-semibold text-primary"
              onClick={() => setBlocked(false)}
            >
              <span className="link-wipe">Continue</span>
            </Link>
          </p>
        </div>
      ) : null}
    </div>
  );
}
