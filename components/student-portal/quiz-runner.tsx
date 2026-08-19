"use client";

import { useEffect, useRef, useState } from "react";
import type { Question, WrittenQuestion } from "@/content/portal";
import { checkWrittenAnswer } from "@/lib/portal";
import { ActionButton } from "@/components/ui/action-button";
import { ProgressBar, ProgressRing } from "@/components/student-portal/ui";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  CloseIcon,
} from "@/components/student-portal/icons";
import { BODY, EYEBROW, HEADING, META } from "@/lib/theme";

/** One step of the combined quiz - a multiple-choice question or a written
 *  one, told apart by `kind` so the runner can render and grade either. */
type QuizItem =
  | { kind: "mcq"; question: Question }
  | { kind: "written"; question: WrittenQuestion };

/** An mcq item is answered with the chosen option's index; a written item
 *  with the text typed. `null` is "not answered yet" for either kind. */
type Answer = number | string | null;

function isAnswered(item: QuizItem, answer: Answer): boolean {
  return item.kind === "mcq" ? answer !== null : Boolean((answer as string | null)?.trim());
}

function isCorrect(item: QuizItem, answer: Answer): boolean {
  return item.kind === "mcq"
    ? answer === item.question.answer
    : checkWrittenAnswer(item.question, (answer as string | null) ?? "");
}

/**
 * Taking a quiz - and, where the lecture has any, its written questions too.
 *
 * ONE FLOW, WRITTEN QUESTIONS AT THE END. A lecture's written questions are
 * not a separate screen reached after the quiz is passed - they are simply
 * the last few steps of the same one-question-at-a-time sequence, told apart
 * by an answer box instead of four options. A learner who has just found the
 * quiz should not have to go looking for the written questions somewhere
 * else; appending them here is the one place they cannot be missed.
 *
 * ONE QUESTION AT A TIME, not a page of everything. The quiz closes a lecture
 * and confirms the ideas landed; a single list of questions with one submit
 * turns that into a form, and people fill in forms by scanning for the
 * shortest answer. One question on screen with a progress bar above it is the
 * shape that says "think about this one" - and it works the same way whether
 * the question in front of you is four options or a blank box.
 *
 * NOTHING IS TIMED AND NOTHING IS LIMITED. The landing page promises unlimited
 * attempts and calls this "a foundation, not a filter", so there is no timer,
 * no attempt counter and no penalty for going back to a question already
 * answered.
 *
 * NO ANSWER IS EVER SHOWN TO A LEARNER. This used to be a review screen with
 * the correct option marked and an explanation underneath every question -
 * it is not, on purpose: a bank of four questions per module is reused
 * across every lecture and every retake (see `quizFor()` in `lib/portal.ts`),
 * so revealing an answer once leaks it for good. What is shown after
 * submitting is only ever the aggregate - a score, a pass/fail, how many
 * were right out of how many - never which ones, never what the right
 * option or model answer was. There is no route, link or button anywhere in
 * the student portal that shows a correct answer; that information exists
 * only in the lecturer and admin consoles, where it belongs.
 *
 * Nothing is saved. The score is real for as long as the page is open, which
 * the result says plainly rather than implying a record was written.
 *
 * Submitting opens a RESULT DIALOG over a plain summary rather than
 * replacing it. The score is the one thing the learner is waiting for and it
 * should not have to be looked for at the top of a long scroll; the dialog
 * answers it and offers the two things anyone does next - take it again, or
 * move on - and dismissing it leaves the same summary, not a hidden reveal.
 *
 * MOVING ON IS OFFERED ONLY AFTER A PASS. The next lecture is behind this
 * quiz - see `lectureGateCleared()` in `lib/portal.ts` - so a failed attempt
 * offers only "Try again", never a way past it.
 */
export function QuizRunner({
  questions,
  written = [],
  passMark,
  lectureHref,
  advance,
}: {
  questions: Question[];
  /** The lecture's written questions, appended after the multiple-choice
   *  ones - most lectures pass none, and the flow below simply has nothing
   *  extra to show. */
  written?: WrittenQuestion[];
  passMark: number;
  /** Back to the lecture the quiz belongs to. */
  lectureHref: string;
  /** Where a PASS leads next - the next lecture, or absent on the last
   *  lecture of a module. Never shown on a failed attempt. */
  advance?: { href: string; label: string };
}) {
  const [items] = useState<QuizItem[]>(() => [
    ...questions.map((question): QuizItem => ({ kind: "mcq", question })),
    ...written.map((question): QuizItem => ({ kind: "written", question })),
  ]);
  const [answers, setAnswers] = useState<Answer[]>(() => items.map(() => null));
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  // Separate from `submitted` because the summary outlives the dialog:
  // closing the dialog must leave the marked score on the page, not send the
  // learner back to question one.
  const [resultOpen, setResultOpen] = useState(false);

  const correct = items.filter((item, i) => isCorrect(item, answers[i])).length;
  const score = Math.round((correct / items.length) * 100);
  const passed = score >= passMark;

  const retake = () => {
    setAnswers(items.map(() => null));
    setIndex(0);
    setSubmitted(false);
    setResultOpen(false);
  };

  if (submitted) {
    return (
      <>
        <Summary
          total={items.length}
          score={score}
          correct={correct}
          passed={passed}
          passMark={passMark}
          lectureHref={lectureHref}
          advance={advance}
          onRetake={retake}
        />

        <ResultDialog
          open={resultOpen}
          score={score}
          correct={correct}
          total={items.length}
          passed={passed}
          passMark={passMark}
          lectureHref={lectureHref}
          advance={advance}
          onRetake={retake}
          onClose={() => setResultOpen(false)}
        />
      </>
    );
  }

  const item = items[index];
  const chosen = answers[index];
  const last = index === items.length - 1;
  const answeredAll = items.every((entry, i) => isAnswered(entry, answers[i]));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className={EYEBROW.muted}>
          Question {index + 1} of {items.length}
        </p>
        <p className={META.base}>
          {answers.filter((a, i) => isAnswered(items[i], a)).length} answered
        </p>
      </div>
      <ProgressBar
        percent={((index + 1) / items.length) * 100}
        label="Quiz progress"
        className="mt-3"
      />

      {item.kind === "mcq" ? (
        <fieldset className="mt-9">
          {/* The prompt is the legend, so a screen reader announces it with each
              option rather than leaving four unlabelled radios in a row. */}
          <legend className="font-display text-2xl leading-snug tracking-tight text-ink text-balance">
            {item.question.prompt}
          </legend>

          <div className="mt-7 space-y-3">
            {item.question.options.map((option, optionIndex) => {
              const selected = chosen === optionIndex;

              return (
                <label
                  key={option}
                  className={`flex cursor-pointer items-start gap-4 rounded-sm border px-5 py-4 text-lg leading-relaxed transition-colors duration-300 ${selected
                      ? "border-primary bg-tint-mist text-ink"
                      : "border-surface-deep bg-paper-raised text-ink-soft hover:border-muted-light hover:text-ink"
                    }`}
                >
                  <input
                    type="radio"
                    name={item.question.id}
                    checked={selected}
                    onChange={() =>
                      setAnswers((current) =>
                        current.map((value, i) => (i === index ? optionIndex : value)),
                      )
                    }
                    className="sr-only"
                  />
                  {/* A drawn control rather than the native radio: the whole row
                      is the target, and a 16px OS radio in the corner of a 64px
                      row invites people to aim at the wrong thing. */}
                  <span
                    aria-hidden="true"
                    className={`mt-1 grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300 ${selected ? "border-primary bg-primary" : "border-muted-light"
                      }`}
                  >
                    <span className="size-1.5 rounded-full bg-paper" />
                  </span>
                  {option}
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : (
        <div className="mt-9">
          <label className="block">
            <span className="font-display text-2xl leading-snug tracking-tight text-ink text-balance">
              {item.question.prompt}
            </span>
            <textarea
              rows={4}
              value={(chosen as string | null) ?? ""}
              onChange={(event) =>
                setAnswers((current) =>
                  current.map((value, i) => (i === index ? event.target.value : value)),
                )
              }
              placeholder="Two or three sentences is enough."
              className="field mt-5"
            />
          </label>
          <p className={`mt-2 ${META.base}`}>
            A written question - checked for the words a correct explanation
            would use, not multiple choice.
          </p>
        </div>
      )}

      <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-surface-deep pt-6">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="group inline-flex items-center gap-1.5 text-lg font-semibold text-primary transition-opacity disabled:opacity-40"
        >
          <ChevronLeftIcon className="size-4 transition-transform duration-500 ease-out-expo group-enabled:group-hover:-translate-x-1" />
          Previous
        </button>

        {last ? (
          <ActionButton
            variant="solid"
            size="sm"
            className="group"
            onClick={() => {
              if (!answeredAll) return;
              setSubmitted(true);
              setResultOpen(true);
            }}
          >
            Submit answers
            <ArrowRightIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
          </ActionButton>
        ) : (
          <ActionButton
            variant="solid"
            size="sm"
            className="group"
            onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
          >
            Next question
            <ArrowRightIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
          </ActionButton>
        )}
      </div>

      {last && !answeredAll ? (
        <p role="status" className={`mt-4 text-right ${META.base}`}>
          Answer every question before submitting.
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ result */

/**
 * The score, the moment it is known.
 *
 * A NATIVE `<dialog>` opened with `showModal()`, not a positioned div with
 * `role="dialog"`. The browser then owns the top layer, the focus trap, the
 * Escape key and the inertness of the page behind - four things that a
 * hand-rolled overlay gets wrong in a different way each time it is written.
 * The two pieces the platform cannot style from a class attribute, the veil
 * and the page's scroll lock, are `.modal-panel` in globals.css.
 *
 * COLOUR CARRIES THE RESULT, and it is teal or clay - never amber. Amber is
 * the graphics accent everywhere else on this site and it is also the colour
 * every other product uses for "careful"; a 40px amber percentage is a warning
 * the learner has to read twice to find out it was good news.
 *
 * Dismissing does not reveal anything further. The summary underneath carries
 * the same score and nothing more - the dialog is the headline over a page
 * that is already finished, not a step in front of one that unlocks answers.
 */
function ResultDialog({
  open,
  score,
  correct,
  total,
  passed,
  passMark,
  lectureHref,
  advance,
  onRetake,
  onClose,
}: {
  open: boolean;
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  passMark: number;
  lectureHref: string;
  advance?: { href: string; label: string };
  onRetake: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  // `showModal()` is imperative and has no declarative equivalent, so this is
  // one of the few effects in the portal that earns its place: it mirrors a
  // prop onto a DOM method, and the guards keep it from calling either method
  // on a dialog already in that state.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="quiz-result-heading"
      // Escape and the close button both end up here, so the React state
      // cannot drift out of step with the element's own `open` property.
      onClose={onClose}
      // A click on the backdrop of a native dialog targets the dialog element
      // itself. The panel below is a child, so this fires for the veil only.
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      data-lenis-prevent
      className="modal-panel w-[min(30rem,calc(100vw-2rem))] overflow-y-auto rounded-sm border border-surface-deep bg-paper"
    >
      <div
        className={`px-7 py-8 text-center sm:px-9 ${passed ? "bg-tint-mist" : "bg-clay-pale"
          }`}
      >
        <span
          aria-hidden="true"
          className={`mx-auto grid size-12 place-items-center rounded-full ${passed ? "bg-primary text-paper" : "bg-clay text-paper"
            }`}
        >
          {passed ? (
            <CheckIcon className="size-6" />
          ) : (
            <CloseIcon className="size-6" />
          )}
        </span>

        {/* `.text-figure` is the page's single size for a number read as a
            mark rather than as prose - the dashboard's totals use the same
            one. Colour is the only thing added to it here. */}
        <p
          className={`mt-5 text-figure ${passed ? "text-primary" : "text-clay"}`}
        >
          {score}%
        </p>

        <h2 id="quiz-result-heading" className={`mt-3 ${HEADING.card}`}>
          {passed ? "Passed" : "Not passed this time"}
        </h2>

        <p className={`mt-2 ${META.base}`}>
          {correct} of {total} correct · pass mark {passMark}%
        </p>
      </div>

      <div className="px-7 py-7 sm:px-9">
        <p className={BODY.base}>
          {passed
            ? "That counts towards the module's certificate."
            : "There is no limit on attempts and nothing is held against you - go back over the lecture and try again whenever you are ready."}
        </p>

        {/* ONE BUTTON, and everything else is a text action.
            An outlined button next to a solid one in a 30rem panel gives two
            controls the same footprint and leaves the eye to work out which
            is which from the fill; the second action is not equal to the
            first on either result, so it is not drawn as though it were. */}
        <div className="mt-7">
          {passed ? (
            <ActionButton
              href={advance?.href ?? lectureHref}
              variant="solid"
              size="sm"
              className="group w-full"
            >
              {advance?.label ?? "Back to the lecture"}
              <ArrowRightIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
            </ActionButton>
          ) : (
            <ActionButton
              variant="solid"
              size="sm"
              className="w-full"
              onClick={onRetake}
            >
              Try again
            </ActionButton>
          )}

          {/* No "see the answers" here or anywhere else in the portal - a
              learner is never shown which option, or whose written answer,
              was correct. The only other thing on offer is closing the
              dialog onto the same score, already summarised underneath. */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-lg font-semibold text-primary">
            {passed ? (
              <>
                <button type="button" onClick={onRetake}>
                  <span className="link-wipe">Try again</span>
                </button>
                <span aria-hidden="true" className="h-4 w-px bg-surface-deep" />
              </>
            ) : null}

            <button type="button" onClick={onClose}>
              <span className="link-wipe">Close</span>
            </button>
          </div>
        </div>

        <p className={`mt-6 text-center ${META.base}`}>
          Design prototype - this result is not recorded against your account.
        </p>
      </div>
    </dialog>
  );
}

/* ----------------------------------------------------------------- summary */

/**
 * What is left once the dialog is closed - the score, and nothing else.
 *
 * PREVIOUSLY THIS WAS A REVIEW: every question listed again with the correct
 * option marked and an explanation underneath, right or wrong. It no longer
 * shows a single question, option or explanation, on purpose - see the note
 * on `<QuizRunner>` for why an answer is never revealed to a learner. What
 * is left is the same score card the dialog already showed, so closing the
 * dialog does not feel like the page went blank, plus the two actions a
 * learner actually needs next: take it again, or move on.
 */
function Summary({
  total,
  score,
  correct,
  passed,
  passMark,
  lectureHref,
  advance,
  onRetake,
}: {
  total: number;
  score: number;
  correct: number;
  passed: boolean;
  passMark: number;
  lectureHref: string;
  advance?: { href: string; label: string };
  onRetake: () => void;
}) {
  return (
    <div>
      <div
        className={`flex flex-col gap-6 rounded-sm border px-6 py-7 sm:flex-row sm:items-center sm:gap-8 sm:px-8 ${passed
            ? "border-primary/25 bg-tint-mist"
            : "border-clay/25 bg-clay-pale"
          }`}
      >
        <ProgressRing percent={score} label="Your score" size={72} />

        <div className="min-w-0 flex-1">
          <h2 className={HEADING.card}>
            {passed ? "Passed" : "Not passed this time"}
          </h2>
          <p className={`mt-2 ${BODY.base}`}>
            {correct} of {total} correct.{" "}
            {passed
              ? `That is above the ${passMark}% needed, and it counts towards the module's certificate.`
              : `${passMark}% is the pass mark. There is no limit on attempts - go back over the lecture and try again whenever you are ready.`}
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-surface-deep pt-8">
        <ActionButton
          variant={passed ? "line" : "solid"}
          size="sm"
          onClick={onRetake}
        >
          Take it again
        </ActionButton>

        {passed && advance ? (
          <ActionButton
            href={advance.href}
            variant="solid"
            size="sm"
            className="group"
          >
            {advance.label}
            <ArrowRightIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
          </ActionButton>
        ) : null}

        <ActionButton href={lectureHref} variant="mono" size="sm">
          Back to the lecture
        </ActionButton>
      </div>

      <p role="status" className={`mt-6 ${META.base}`}>
        Design prototype - this result is not recorded against your account.
      </p>
    </div>
  );
}
