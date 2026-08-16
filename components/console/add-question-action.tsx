"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { ConfirmAction } from "@/components/console/actions";
import { Drawer } from "@/components/console/drawer";
import { IfCan, LockedNote } from "@/components/console/permission";
import { EditIcon, PlusIcon } from "@/components/console/icons";
import type { Question } from "@/content/portal";
import type { Capability } from "@/lib/permissions";

/**
 * Writing a question - added new or opened to change one already there.
 *
 * ONE FORM, TWO DOORS IN, same device as `content-block-actions.tsx`'s
 * video and text blocks: `<AddQuestionAction>` is the button under the
 * question list, `<EditQuestionAction>` is the "Edit" control on a question
 * already written, opening the same form with `initial` set. A question
 * that can be added and a question that can be edited are not two different
 * things to build - the second is the first with values already in the
 * fields.
 *
 * The correct option is a radio, not a checkbox beside each one - the same
 * dot-and-highlight the questions above already use to mark the right
 * answer, so writing one looks like reading one.
 *
 * Nothing here saves, same rule as every other write in this console: the
 * form is real, the fields behave, and the ending says what a finished
 * platform would have done.
 */
function QuestionForm({
  formId,
  questionNumber,
  initial,
}: {
  formId: string;
  questionNumber: number;
  initial?: Question;
}) {
  const [saved, setSaved] = useState(false);
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [options, setOptions] = useState(initial?.options ?? ["", "", "", ""]);
  const [answer, setAnswer] = useState(initial?.answer ?? 0);

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Question {questionNumber}
          </span>
          <textarea
            required
            rows={2}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="What happens to output when a panel is partially shaded?"
            className="field"
          />
        </label>

        <div>
          <span className="mb-2 block text-lg font-semibold text-ink">
            Options
          </span>
          <div className="grid gap-2.5">
            {options.map((option, index) => {
              const active = answer === index;
              return (
                <div key={index} className="flex items-center gap-3">
                  <label className="flex shrink-0 cursor-pointer items-center py-1">
                    <input
                      type="radio"
                      name="answer"
                      checked={active}
                      onChange={() => setAnswer(index)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={`grid size-5 place-items-center rounded-full border-2 ${
                        active ? "border-primary bg-primary" : "border-muted-light"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-paper" />
                    </span>
                  </label>
                  <input
                    required
                    value={option}
                    onChange={(event) => {
                      const next = [...options];
                      next[index] = event.target.value;
                      setOptions(next);
                    }}
                    placeholder={`Option ${index + 1}`}
                    className={`field flex-1 ${active ? "border-primary" : ""}`}
                  />
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-sm text-muted">
            The dot on the left marks the correct option.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Explanation
          </span>
          <textarea
            required
            rows={3}
            defaultValue={initial?.explanation}
            placeholder="What a learner reads after submitting, whether they got it right or not."
            className="field"
          />
        </label>
      </div>

      {saved ? (
        <p
          role="status"
          className="mt-6 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
        >
          Prototype - {initial ? "nothing was changed" : "the question was not added"}.{" "}
          {initial
            ? "A real save would update what a learner sees immediately."
            : "A real question would land at the end of the list, ready to reorder."}
        </p>
      ) : null}
    </form>
  );
}

/* -------------------------------------------------------------------- add */

/** The control that opens `<QuestionForm>` for a new question - styled the
 *  same as a module's "Add a video block", opening the drawer a question is
 *  written in. */
export function AddQuestionAction({
  capability,
  nextNumber,
}: {
  capability: Capability;
  nextNumber: number;
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();

  return (
    <>
      <IfCan
        capability={capability}
        fallback={<LockedNote capability={capability} />}
      >
        <ActionButton variant="mono" size="sm" onClick={() => setOpen(true)}>
          <PlusIcon className="size-4" />
          Add a question
        </ActionButton>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Add a question"
        description="Four options, one correct. The explanation is what a learner reads after submitting, whether they got it right or not."
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Add the question
          </ActionButton>
        }
      >
        <QuestionForm formId={formId} questionNumber={nextNumber} />
      </Drawer>
    </>
  );
}

/* ------------------------------------------------------------------- edit */

/** A question already written, opened to change it. */
export function EditQuestionAction({
  question,
  number,
  capability,
}: {
  question: Question;
  number: number;
  capability: Capability;
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();

  return (
    <>
      <IfCan capability={capability}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary"
        >
          <EditIcon className="size-4" />
          Edit
        </button>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Edit question"
        description={`Question ${number}. Four options, one correct.`}
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Save changes
          </ActionButton>
        }
      >
        <QuestionForm formId={formId} questionNumber={number} initial={question} />
      </Drawer>
    </>
  );
}

/* ----------------------------------------------------------------- remove */

/**
 * A question, taken out of the quiz.
 *
 * `<ConfirmAction>`, not a bare "Remove" - same rule as
 * `<RemoveContentBlockAction>`: anything hard to undo asks a second time and
 * names the thing being acted on.
 */
export function RemoveQuestionAction({
  number,
  capability,
}: {
  number: number;
  capability: Capability;
}) {
  return (
    <IfCan capability={capability}>
      <ConfirmAction
        label="Remove"
        question={`Remove question ${number}?`}
        detail="Learners who already answered it keep their past attempts - this only changes what the next attempt asks."
        confirmLabel="Remove it"
        tone="warn"
        done="Prototype - the question is unchanged."
        size="table"
      />
    </IfCan>
  );
}
