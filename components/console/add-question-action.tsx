"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { ConfirmAction } from "@/components/console/actions";
import { Drawer } from "@/components/console/drawer";
import { IfCan, LockedNote } from "@/components/console/permission";
import { EditIcon, PlusIcon } from "@/components/console/icons";
import type { Question, WrittenQuestion } from "@/content/portal";
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
                      className={`grid size-5 place-items-center rounded-full border-2 ${active ? "border-primary bg-primary" : "border-muted-light"
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
 *  same as a lecture's "Add a video block", opening the drawer a question is
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

/* =================================================== written questions ==== */

/**
 * Writing a WRITTEN question - the same "one form, two doors in" device as
 * `<QuestionForm>` above, but for a short-answer question instead of a
 * multiple-choice one.
 *
 * THERE IS NO "CORRECT OPTION" RADIO HERE, because there is no fixed option to
 * mark - a written answer is checked against a short list of required words
 * and phrases instead (see `checkWrittenAnswer()` in `lib/portal.ts`). The
 * keywords are entered as one comma-separated field rather than one input
 * each, because the count genuinely varies question to question and a form
 * that adds and removes rows for it is more machinery than four or five words
 * are worth.
 *
 * THE MINIMUM IS NEVER "ALL OF THEM" BY DEFAULT. A real two-or-three-sentence
 * answer paraphrases; requiring every listed word back verbatim would fail an
 * answer a person reading it would pass. The field defaults to roughly half
 * the keywords, rounded up, and the instructor can still raise or lower it.
 */
function WrittenQuestionForm({
  formId,
  questionNumber,
  initial,
}: {
  formId: string;
  questionNumber: number;
  initial?: WrittenQuestion;
}) {
  const [saved, setSaved] = useState(false);
  const [prompt, setPrompt] = useState(initial?.prompt ?? "");
  const [keywordText, setKeywordText] = useState(
    initial?.keywords.join(", ") ?? "",
  );
  const keywords = keywordText
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);
  const [minMatches, setMinMatches] = useState(
    initial?.minMatches ?? Math.max(1, Math.ceil((keywords.length || 4) / 2)),
  );

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
            placeholder="In two or three sentences, explain why..."
            className="field"
          />
          <p className="mt-2 text-sm text-muted">
            Ask for a short explanation - two or three sentences, never an
            essay. This is not a graded assignment.
          </p>
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Words and phrases to check for
          </span>
          <input
            required
            value={keywordText}
            onChange={(event) => setKeywordText(event.target.value)}
            placeholder="hazard, exposure, vulnerability"
            className="field"
          />
          <p className="mt-2 text-sm text-muted">
            Separate with commas. An answer is checked against these, not read
            for meaning - list the specific terms a correct answer would
            actually use.
          </p>
        </label>

        {/* <label className="block max-w-xs">
          <span className="mb-2 block text-lg font-semibold text-ink">
            How many have to appear
          </span>
          <select
            value={Math.min(minMatches, Math.max(keywords.length, 1))}
            onChange={(event) => setMinMatches(Number(event.target.value))}
            className="field"
          >
            {Array.from(
              { length: Math.max(keywords.length, 1) },
              (_, i) => i + 1,
            ).map((n) => (
              <option key={n} value={n}>
                {n} of {Math.max(keywords.length, 1)}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-muted">
            Rarely all of them - a real answer paraphrases, so this is usually
            set to roughly half.
          </p>
        </label> */}

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Model answer
          </span>
          <textarea
            required
            rows={3}
            defaultValue={initial?.modelAnswer}
            placeholder="What a learner reads after submitting, alongside their own answer, whether it passed or not."
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
            ? "A real save would update what a learner is checked against immediately."
            : "A real question would land at the end of the list, ready to reorder."}
        </p>
      ) : null}
    </form>
  );
}

/** The control under a lecture's written questions - absent (not merely
 *  disabled) once four exist, since 3-4 is the whole point of keeping these
 *  short rather than a rule enforced by a disabled button. */
export function AddWrittenQuestionAction({
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
          Add a written question
        </ActionButton>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Add a written question"
        description="A short explanation, checked for the words a correct answer would use - not multiple choice."
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Add the question
          </ActionButton>
        }
      >
        <WrittenQuestionForm formId={formId} questionNumber={nextNumber} />
      </Drawer>
    </>
  );
}

export function EditWrittenQuestionAction({
  question,
  number,
  capability,
}: {
  question: WrittenQuestion;
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
        title="Edit written question"
        description={`Question ${number}. Checked against the words and phrases listed below.`}
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Save changes
          </ActionButton>
        }
      >
        <WrittenQuestionForm
          formId={formId}
          questionNumber={number}
          initial={question}
        />
      </Drawer>
    </>
  );
}

export function RemoveWrittenQuestionAction({
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
        question={`Remove written question ${number}?`}
        detail="Learners who already passed it keep their pass - this only changes what the next attempt asks. If this is the lecture's last written question, its written step is removed entirely and the quiz alone reopens the gate."
        confirmLabel="Remove it"
        tone="warn"
        done="Prototype - the question is unchanged."
        size="table"
      />
    </IfCan>
  );
}
