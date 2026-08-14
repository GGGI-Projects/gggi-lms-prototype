"use client";

import { useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { CheckIcon } from "@/components/student-portal/icons";

/**
 * "Mark as complete".
 *
 * The one control on the module page that changes state, and in a prototype
 * with no backend it changes state for exactly as long as the page is open.
 * It says so once it has been pressed rather than pretending to have saved -
 * the same choice the sign-up form makes, and for the same reason: a client
 * who presses it, navigates away and comes back to find the tick gone will
 * spend the rest of the demo wondering what else is broken.
 *
 * It stays pressable after the fact so a learner can un-mark a module they
 * ticked by accident. A completion control that only goes one way is one
 * people are afraid to press.
 */
export function CompleteButton({
  /** True when the mock data already has this module finished. */
  initiallyComplete,
  className = "",
}: {
  initiallyComplete: boolean;
  className?: string;
}) {
  const [complete, setComplete] = useState(initiallyComplete);
  const [touched, setTouched] = useState(false);

  function toggle() {
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

      {touched ? (
        <p role="status" className="mt-3 text-sm text-muted">
          Design prototype - progress is not saved between visits.
        </p>
      ) : null}
    </div>
  );
}
