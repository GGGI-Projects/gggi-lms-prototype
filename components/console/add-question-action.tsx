"use client";

import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ActionButton } from "@/components/ui/action-button";
import { ConfirmAction } from "@/components/console/actions";
import { Drawer } from "@/components/console/drawer";
import { IfCan, LockedNote } from "@/components/console/permission";
import { EditIcon, PlusIcon, ShuffleIcon } from "@/components/console/icons";
import type { FillInTheBlankQuestion, Question } from "@/content/portal";
import { passageSegments } from "@/lib/portal";
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
            placeholder="What this option is correct and the others are not - for you and other staff to check the question, never shown to a learner."
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
        description="Four options, one correct. The explanation is for staff only, to check the question against - a learner attempting the quiz never sees it."
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

/* ============================================= fill-in-the-blank questions */

/** One clickable word of the passage being authored, or a blank made of one
 *  or more of them merged together - see `mergeChunks()`. */
type Chunk = {
  id: string;
  text: string;
  blank: boolean;
  /** Chunks blanked together toggle and render as one unit. Defaults to the
   *  chunk's own id, i.e. "a group of one". */
  groupId: string;
  /** Which sentence this word falls in, for "blank the whole sentence". */
  sentenceId: string;
};

const STRIP = /^[^\w-]+|[^\w-]+$/g;

/** A raw passage, split on whitespace into clickable words and tagged with
 *  which sentence each one belongs to. Nothing is blanked yet. */
function tokenize(text: string): Chunk[] {
  const words = text.split(/\s+/).filter(Boolean);
  let sentenceIndex = 0;
  return words.map((word, i) => {
    const chunk: Chunk = {
      id: `w${i}`,
      text: word,
      blank: false,
      groupId: `w${i}`,
      sentenceId: `s${sentenceIndex}`,
    };
    if (/[.!?]["')\]]?$/.test(word)) sentenceIndex += 1;
    return chunk;
  });
}

/**
 * Rebuilds the clickable word list for a question already written, so
 * `<EditBlankQuestionAction>` opens with its blanks already marked.
 *
 * A blank in `question.blanks` only carries its answer text, not which of the
 * freshly re-tokenized words it originally came from - so this walks the
 * words in order and greedily matches each blank's answer against the next
 * unclaimed run of words. Blanks are always in passage order and their
 * answer is always an exact run lifted from the passage, so this always
 * finds a match for content this form itself produced.
 */
function chunksFromQuestion(question: FillInTheBlankQuestion): Chunk[] {
  const plain = passageSegments(question)
    .map((segment) => (segment.kind === "text" ? segment.text : segment.blank.answer))
    .join("");
  const chunks = tokenize(plain);

  let cursor = 0;
  for (const blank of question.blanks) {
    const answerWords = blank.answer
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.replace(STRIP, "").toLowerCase());

    for (let start = cursor; start <= chunks.length - answerWords.length; start++) {
      const matches = answerWords.every(
        (word, offset) => chunks[start + offset].text.replace(STRIP, "").toLowerCase() === word,
      );
      if (!matches) continue;

      for (let i = 0; i < answerWords.length; i++) {
        chunks[start + i].blank = true;
        chunks[start + i].groupId = blank.id;
      }
      cursor = start + answerWords.length;
      break;
    }
  }

  return chunks;
}

/** Consecutive chunks sharing a blanked group render as one pill instead of
 *  one per word. */
function mergeChunks(chunks: Chunk[]) {
  const merged: { key: string; text: string; blank: boolean; chunkIds: string[] }[] = [];
  for (const chunk of chunks) {
    const last = merged[merged.length - 1];
    if (last && chunk.blank && last.blank && last.key === chunk.groupId) {
      last.text += ` ${chunk.text}`;
      last.chunkIds.push(chunk.id);
    } else {
      merged.push({
        key: chunk.blank ? chunk.groupId : chunk.id,
        text: chunk.text,
        blank: chunk.blank,
        chunkIds: [chunk.id],
      });
    }
  }
  return merged;
}

/**
 * A deterministic shuffle - the same `seed` always reorders the same list
 * the same way. That matters here because the word bank is recomputed on
 * every render (a lecturer typing another distractor re-renders the form):
 * `Math.random()` would silently re-shuffle what they were just looking at,
 * and a seed of `0` means "not shuffled yet" (see `shuffleSeed` below), so
 * the natural, passage order is what a lecturer sees until they ask for
 * something else.
 */
function seededShuffle<T>(items: T[], seed: number): T[] {
  let state = seed;
  function nextRandom() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** What `<AddBlankQuestionAction>` and `<EditBlankQuestionAction>` reach
 *  into the form for - see the note on `FillInTheBlankQuestionForm` below. */
type FillInTheBlankFormHandle = {
  continueToBlanks: () => void;
};

/**
 * Writing a FILL-IN-THE-BLANK question - the same "one form, two doors in"
 * device as `<QuestionForm>` above, but a passage with blanks picked out of
 * it instead of a multiple-choice prompt.
 *
 * TWO STEPS, because marking blanks needs the passage to exist first. Step
 * one is a plain textarea; step two renders that passage read-only, one word
 * per clickable span, and a lecturer marks a blank by clicking - a single
 * word by default, or a whole sentence with "Blank whole sentences" switched
 * on, since the client asked for both. Going back to step one re-splits the
 * passage and starts blank-picking over, which the copy says plainly.
 *
 * THE STEP'S OWN "CONTINUE"/"ADD" BUTTON LIVES IN THE DRAWER'S FOOTER, not
 * here - the same fixed spot every drawer's primary action sits in, rather
 * than a button buried at the end of a form that can run long. That footer
 * is rendered by `<AddBlankQuestionAction>`/`<EditBlankQuestionAction>`,
 * outside this component, so `step` is mirrored up to them via
 * `onStepChange` and the actual step-one-to-step-two transition (which
 * needs `passage` and `setChunks`, both local to this form) is exposed back
 * down through `ref` as `continueToBlanks()` - the one thing the footer
 * button calls.
 *
 * THE OPTION BANK IS SEEDED FROM THE BLANKS THEMSELVES. Every word or
 * sentence marked as a blank is automatically one of the options a learner
 * will see below the passage - the lecturer only has to add the wrong ones,
 * never re-type the right ones (see `optionBankFor()` in `lib/portal.ts`).
 * It previews in passage order - right answers in the order they appear,
 * then the typed-in wrong ones - until "Shuffle" is used, because passage
 * order is exactly the pattern a learner could guess from without reading a
 * word: see `seededShuffle()` above for why `shuffleSeed` (not
 * `Math.random()`) drives it, and the submit handler below for what happens
 * if a lecturer never clicks Shuffle at all.
 */
const FillInTheBlankQuestionForm = forwardRef<
  FillInTheBlankFormHandle,
  {
    formId: string;
    questionNumber: number;
    initial?: FillInTheBlankQuestion;
    onStepChange: (step: "passage" | "blanks") => void;
  }
>(function FillInTheBlankQuestionForm(
  { formId, questionNumber, initial, onStepChange },
  ref,
) {
  const [saved, setSaved] = useState(false);
  const [step, setStepState] = useState<"passage" | "blanks">(
    initial ? "blanks" : "passage",
  );
  function setStep(next: "passage" | "blanks") {
    setStepState(next);
    onStepChange(next);
  }
  const [passage, setPassage] = useState(() =>
    initial
      ? passageSegments(initial)
          .map((segment) => (segment.kind === "text" ? segment.text : segment.blank.answer))
          .join("")
      : "",
  );
  const [chunks, setChunks] = useState<Chunk[]>(() =>
    initial ? chunksFromQuestion(initial) : [],
  );
  const [sentenceMode, setSentenceMode] = useState(false);
  const [distractorText, setDistractorText] = useState(
    initial?.distractors.join(", ") ?? "",
  );
  const distractors = distractorText
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);

  const blankGroups = mergeChunks(chunks).filter((group) => group.blank);
  const naturalBank = [...blankGroups.map((group) => group.text), ...distractors];
  // 0 is "not shuffled" - anything else is the seed the lecturer last
  // shuffled with. See `seededShuffle()`.
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const shuffled = shuffleSeed !== 0;
  const optionBank = shuffled ? seededShuffle(naturalBank, shuffleSeed) : naturalBank;

  useImperativeHandle(ref, () => ({
    continueToBlanks() {
      setChunks(tokenize(passage));
      setStep("blanks");
    },
  }));

  function toggle(clicked: Chunk) {
    if (sentenceMode) {
      const turningOn = !clicked.blank;
      setChunks((current) =>
        current.map((c) =>
          c.sentenceId === clicked.sentenceId
            ? { ...c, blank: turningOn, groupId: clicked.sentenceId }
            : c,
        ),
      );
      return;
    }
    setChunks((current) =>
      current.map((c) =>
        c.id === clicked.id
          ? { ...c, blank: !c.blank, groupId: c.id }
          : c,
      ),
    );
  }

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        // Honesty rule: a lecturer who never touched "Shuffle" was only
        // ever previewing the passage-order bank, which is not what a
        // learner should be checked against - see the note above on why
        // that order is guessable. Shuffling it here, on the way out,
        // means the option a lecturer never gets is a question that looks
        // shuffled but was not.
        if (!shuffled) setShuffleSeed(Date.now());
        setSaved(true);
      }}
    >
      <div className="grid gap-5">
        <div>
          <span className="mb-2 block text-lg font-semibold text-ink">
            Question {questionNumber}
          </span>

          {step === "passage" ? (
            <textarea
              required
              rows={5}
              value={passage}
              onChange={(event) => setPassage(event.target.value)}
              placeholder="Write the paragraph exactly as a learner should read it - short or long. The next step picks out its blanks."
              className="field"
            />
          ) : (
            <>
              <div className="rounded-sm border border-surface-deep bg-paper-raised px-5 py-4 text-lg leading-loose">
                {mergeChunks(chunks).map((group) => (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() =>
                      toggle(chunks.find((c) => c.id === group.chunkIds[0])!)
                    }
                    className={`mx-0.5 my-0.5 rounded-sm px-1.5 py-0.5 transition-colors duration-200 ${
                      group.blank
                        ? "bg-primary text-paper"
                        : "text-ink hover:bg-tint-mist"
                    }`}
                  >
                    {group.text}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={sentenceMode}
                    onChange={(event) => setSentenceMode(event.target.checked)}
                  />
                  Blank whole sentences
                </label>
                <button
                  type="button"
                  onClick={() => setStep("passage")}
                  className="text-sm font-semibold text-primary"
                >
                  <span className="link-wipe">Edit the passage text</span>
                </button>
              </div>
              <p className="mt-2 text-sm text-muted">
                Click a word to blank it, or switch on whole sentences and
                click any word in one. Editing the passage text starts blank
                picking over.
              </p>
            </>
          )}
        </div>

        {step === "blanks" ? (
          <label className="block">
            <span className="mb-2 block text-lg font-semibold text-ink">
              Extra wrong options for the word bank
            </span>
            <input
              value={distractorText}
              onChange={(event) => setDistractorText(event.target.value)}
              placeholder="threshold, baseline, disbursement"
              className="field"
            />
            <p className="mt-2 text-sm text-muted">
              Separate with commas. Every blanked word or sentence is already
              an option below - these are the wrong ones shown alongside them.
            </p>
          </label>
        ) : null}

        {step === "blanks" && blankGroups.length ? (
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-lg font-semibold text-ink">
                Word bank preview
              </span>
              <ActionButton
                type="button"
                variant="line"
                size="table"
                className="shrink-0"
                onClick={() => setShuffleSeed((seed) => seed + 1)}
              >
                <ShuffleIcon className="size-3.5" />
                Shuffle
              </ActionButton>
            </div>
            <div className="flex flex-wrap gap-2">
              {optionBank.map((option, i) => (
                <span
                  key={`${option}-${i}`}
                  className="rounded-full bg-tint-mist px-3 py-1 text-sm font-medium text-ink"
                >
                  {option}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted">
              {shuffled
                ? "Shuffled - this is the order a learner sees."
                : "Shown in passage order for now. Shuffled automatically when the question is added, if left untouched."}
            </p>
          </div>
        ) : null}
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
});

/** The control under a lecture's fill-in-the-blank questions - absent (not
 *  merely disabled) once four exist, since 3-4 is the whole point of keeping
 *  these short rather than a rule enforced by a disabled button. */
export function AddBlankQuestionAction({
  capability,
  nextNumber,
}: {
  capability: Capability;
  nextNumber: number;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"passage" | "blanks">("passage");
  const formRef = useRef<FillInTheBlankFormHandle>(null);
  const formId = useId();

  return (
    <>
      <IfCan
        capability={capability}
        fallback={<LockedNote capability={capability} />}
      >
        <ActionButton variant="mono" size="sm" onClick={() => setOpen(true)}>
          <PlusIcon className="size-4" />
          Add a fill-in-the-blank question
        </ActionButton>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Add a fill-in-the-blank question"
        description="Write a passage, pick which words or sentences are blanked, and a learner fills them from a word bank - not free text."
        size="md"
        // Distinct `key`s, deliberately - without them React reuses the
        // same underlying `<button>` across the swap and merely updates
        // its props, which for this pair means flipping the very button a
        // click is still being dispatched on from `type="button"` to
        // `type="submit" form=…`. A browser resolves that click's default
        // action against the button's properties AFTER the JS handler
        // runs, so the same click that moves to the blanks step also
        // submits the form it just revealed the submit button for. Keying
        // them differently forces a real unmount/remount instead.
        footer={
          step === "passage" ? (
            <ActionButton
              key="continue"
              type="button"
              variant="solid"
              size="sm"
              onClick={() => formRef.current?.continueToBlanks()}
            >
              Continue to picking blanks
            </ActionButton>
          ) : (
            <ActionButton key="submit" type="submit" form={formId} variant="solid" size="sm">
              Add the question
            </ActionButton>
          )
        }
      >
        <FillInTheBlankQuestionForm
          ref={formRef}
          formId={formId}
          questionNumber={nextNumber}
          onStepChange={setStep}
        />
      </Drawer>
    </>
  );
}

export function EditBlankQuestionAction({
  question,
  number,
  capability,
}: {
  question: FillInTheBlankQuestion;
  number: number;
  capability: Capability;
}) {
  const [open, setOpen] = useState(false);
  // Editing always starts on the blanks step, but "Edit the passage text"
  // inside the form can send it back to "passage" - the footer has to
  // follow, exactly as it does for `<AddBlankQuestionAction>`.
  const [step, setStep] = useState<"passage" | "blanks">("blanks");
  const formRef = useRef<FillInTheBlankFormHandle>(null);
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
        title="Edit fill-in-the-blank question"
        description={`Question ${number}. Click a blank or a word to change what's picked.`}
        size="md"
        // See the note on `<AddBlankQuestionAction>`'s footer - the `key`s
        // are load-bearing, not decorative.
        footer={
          step === "passage" ? (
            <ActionButton
              key="continue"
              type="button"
              variant="solid"
              size="sm"
              onClick={() => formRef.current?.continueToBlanks()}
            >
              Continue to picking blanks
            </ActionButton>
          ) : (
            <ActionButton key="submit" type="submit" form={formId} variant="solid" size="sm">
              Save changes
            </ActionButton>
          )
        }
      >
        <FillInTheBlankQuestionForm
          ref={formRef}
          formId={formId}
          questionNumber={number}
          initial={question}
          onStepChange={setStep}
        />
      </Drawer>
    </>
  );
}

export function RemoveBlankQuestionAction({
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
        question={`Remove fill-in-the-blank question ${number}?`}
        detail="Learners who already passed it keep their pass - this only changes what the next attempt asks. If this is the lecture's last one, that step is removed entirely and the quiz alone reopens the gate."
        confirmLabel="Remove it"
        tone="warn"
        done="Prototype - the question is unchanged."
        size="table"
      />
    </IfCan>
  );
}
