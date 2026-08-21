"use client";

import { useState } from "react";
import Link from "next/link";
import { ActionButton } from "@/components/ui/action-button";
import { CheckIcon, LockIcon } from "@/components/student-portal/icons";

/**
 * "Mark as complete".
 *
 * MARKING COMPLETE IS A CLAIM, so it is checked. A lecture is not "complete"
 * because a learner says so - it is complete once its own gate is cleared,
 * the same quiz-and-fill-in-the-blank-questions pass that unlocks the next
 * lecture (see `lectureGateCleared()` in `lib/portal.ts`). Pressing this button
 * before that is true does not quietly no-op or silently untick itself
 * later; it explains exactly what is still outstanding and links straight to
 * it, so the one click that failed is also the click that fixes it.
 *
 * UN-MARKING NEEDS NO CHECK. Taking a tick away is never gated - a learner
 * revisiting a lecture they already cleared can always say "not yet" again
 * without re-proving anything. Only the move from incomplete to complete is
 * checked, which is also why toggling back on after an un-mark is checked
 * again: the gate is what is true right now, not what was true once.
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

  function toggle() {
    if (!complete && !gateCleared) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    setComplete((state) => !state);
    setTouched(true);
  }

  return (
    <div className={className}>
      <ActionButton
        variant={complete ? "solid" : "line"}
        size="sm"
        className="w-full"
        onClick={toggle}
      >
        {complete ? <CheckIcon className="size-5" /> : null}
        {complete ? "Completed" : "Mark as complete"}
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
      ) : touched ? (
        <p role="status" className="mt-3 text-sm text-muted">
          Design prototype - progress is not saved between visits.
        </p>
      ) : null}
    </div>
  );
}
