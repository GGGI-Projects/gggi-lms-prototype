"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Question } from "@/content/portal";
import { ActionButton } from "@/components/ui/action-button";
import { ProgressBar, ProgressRing } from "@/components/student-portal/ui";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  CloseIcon,
} from "@/components/student-portal/icons";
import { BODY, EYEBROW, HEADING, META } from "@/lib/theme";

/**
 * Taking a quiz.
 *
 * ONE QUESTION AT A TIME, not a page of four. The quiz closes a lecture and
 * confirms the ideas landed; a single list of questions with one submit turns
 * that into a form, and people fill in forms by scanning for the shortest
 * answer. One question on screen with a progress bar above it is the shape
 * that says "think about this one".
 *
 * NOTHING IS TIMED AND NOTHING IS LIMITED. The landing page promises unlimited
 * attempts and calls this "a foundation, not a filter", so there is no timer,
 * no attempt counter and no penalty for going back to a question already
 * answered. The review screen shows the explanation for every question,
 * including the ones answered correctly - a quiz whose feedback appears only
 * after a mistake teaches nobody anything.
 *
 * Nothing is saved. The score is real for as long as the page is open, which
 * the review screen says plainly rather than implying a record was written.
 *
 * Submitting opens a RESULT DIALOG over the review rather than replacing it.
 * The score is the one thing the learner is waiting for and it should not have
 * to be looked for at the top of a long scroll; the dialog answers it, offers
 * the two things anyone does next - take it again, or move on - and dismisses
 * onto the explanations, which are already there underneath.
 */
export function QuizRunner({
  questions,
  passMark,
  lectureHref,
  nextHref,
}: {
  questions: Question[];
  passMark: number;
  /** Back to the lecture the quiz belongs to. */
  lectureHref: string;
  /** The next lecture, when there is one. Offered only after a pass. */
  nextHref?: string;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => questions.map(() => null),
  );
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  // Separate from `submitted` because the review outlives the dialog: closing
  // the dialog must leave the marked answers on the page, not send the learner
  // back to question one.
  const [resultOpen, setResultOpen] = useState(false);

  const correct = answers.filter(
    (answer, i) => answer === questions[i].answer,
  ).length;
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= passMark;

  const retake = () => {
    setAnswers(questions.map(() => null));
    setIndex(0);
    setSubmitted(false);
    setResultOpen(false);
  };

  if (submitted) {
    return (
      <>
        <Review
          questions={questions}
          answers={answers}
          score={score}
          correct={correct}
          passed={passed}
          passMark={passMark}
          lectureHref={lectureHref}
          nextHref={nextHref}
          onRetake={retake}
        />

        <ResultDialog
          open={resultOpen}
          score={score}
          correct={correct}
          total={questions.length}
          passed={passed}
          passMark={passMark}
          lectureHref={lectureHref}
          nextHref={nextHref}
          onRetake={retake}
          onClose={() => setResultOpen(false)}
        />
      </>
    );
  }

  const question = questions[index];
  const chosen = answers[index];
  const last = index === questions.length - 1;
  const answeredAll = answers.every((answer) => answer !== null);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className={EYEBROW.muted}>
          Question {index + 1} of {questions.length}
        </p>
        <p className={META.base}>
          {answers.filter((a) => a !== null).length} answered
        </p>
      </div>
      <ProgressBar
        percent={((index + 1) / questions.length) * 100}
        label="Quiz progress"
        className="mt-3"
      />

      <fieldset className="mt-9">
        {/* The prompt is the legend, so a screen reader announces it with each
            option rather than leaving four unlabelled radios in a row. */}
        <legend className="font-display text-2xl leading-snug tracking-tight text-ink text-balance">
          {question.prompt}
        </legend>

        <div className="mt-7 space-y-3">
          {question.options.map((option, optionIndex) => {
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
                  name={question.id}
                  checked={selected}
                  onChange={() =>
                    setAnswers((current) =>
                      current.map((value, i) =>
                        i === index ? optionIndex : value,
                      ),
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
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
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
 * Dismissing does not undo anything. The review, with every answer marked and
 * explained, is already rendered underneath - the dialog is the headline over
 * a page that is finished, not a step in front of it.
 */
function ResultDialog({
  open,
  score,
  correct,
  total,
  passed,
  passMark,
  lectureHref,
  nextHref,
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
  nextHref?: string;
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
            ? "That counts towards the module's certificate. The answers are explained below if you want to read them."
            : `There is no limit on attempts and nothing is held against you. Every answer is explained below, which is the fastest way to ${passMark}%.`}
        </p>

        {/* ONE BUTTON, and everything else is a text action.
            An outlined button next to a solid one in a 30rem panel gives two
            controls the same footprint and leaves the eye to work out which
            is which from the fill; the second action is not equal to the
            first on either result, so it is not drawn as though it were. */}
        <div className="mt-7">
          {passed ? (
            <ActionButton
              href={nextHref ?? lectureHref}
              variant="solid"
              size="sm"
              className="group w-full"
            >
              {nextHref ? "Go to next lecture" : "Back to the lecture"}
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

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-lg font-semibold text-primary">
            {passed ? (
              <button type="button" onClick={onRetake}>
                <span className="link-wipe">Try again</span>
              </button>
            ) : nextHref ? (
              // Offered after a failure too, because nothing in this
              // module is locked - see `<LectureRow>`. Quietly: moving on
              // is allowed, it is just not the advice.
              <Link href={nextHref}>
                <span className="link-wipe">Go to next lecture</span>
              </Link>
            ) : null}

            {passed || nextHref ? (
              <span aria-hidden="true" className="h-4 w-px bg-surface-deep" />
            ) : null}

            <button type="button" onClick={onClose}>
              <span className="link-wipe">See the answers</span>
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

/* ------------------------------------------------------------------ review */

function Review({
  questions,
  answers,
  score,
  correct,
  passed,
  passMark,
  lectureHref,
  nextHref,
  onRetake,
}: {
  questions: Question[];
  answers: (number | null)[];
  score: number;
  correct: number;
  passed: boolean;
  passMark: number;
  lectureHref: string;
  nextHref?: string;
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
            {correct} of {questions.length} correct.{" "}
            {passed
              ? `That is above the ${passMark}% needed, and it counts towards the module's certificate.`
              : `${passMark}% is the pass mark. There is no limit on attempts, and the explanations below are the whole point of taking it.`}
          </p>
        </div>
      </div>

      <div className="mt-10 space-y-8">
        {questions.map((question, i) => {
          const chosen = answers[i];
          const right = chosen === question.answer;

          return (
            <article
              key={question.id}
              className="rounded-sm border border-surface-deep bg-paper-raised p-6 sm:p-7"
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${right ? "bg-primary text-paper" : "bg-clay text-paper"
                    }`}
                >
                  {right ? (
                    <CheckIcon className="size-4" />
                  ) : (
                    <CloseIcon className="size-4" />
                  )}
                </span>
                <h3 className="font-display text-lg leading-snug tracking-tight text-ink sm:text-xl">
                  {question.prompt}
                </h3>
              </div>

              <ul className="mt-5 space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isAnswer = optionIndex === question.answer;
                  const isChosen = optionIndex === chosen;

                  return (
                    <li
                      key={option}
                      className={`flex items-start gap-3 rounded-sm px-4 py-2.5 text-lg leading-relaxed ${isAnswer
                          ? "bg-tint-mist font-medium text-ink"
                          : isChosen
                            ? "bg-clay-pale text-ink"
                            : "text-muted"
                        }`}
                    >
                      <span className={`mt-1 size-1.5 shrink-0 rounded-full ${isAnswer ? "bg-primary" : isChosen ? "bg-clay" : "bg-muted-light"
                        }`} />
                      <span className="flex-1">{option}</span>
                      {isAnswer ? (
                        <span className="shrink-0 text-sm font-semibold text-primary">
                          Correct
                        </span>
                      ) : isChosen ? (
                        <span className="shrink-0 text-sm font-semibold text-clay">
                          Your answer
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>

              <p className={`mt-5 border-t border-surface-deep pt-4 ${BODY.base}`}>
                {question.explanation}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-surface-deep pt-8">
        {/* Same two actions as the result dialog, in the same order and with
            the same one solid, so dismissing the dialog does not change what
            is on offer or where it is. */}
        <ActionButton
          variant={passed ? "line" : "solid"}
          size="sm"
          onClick={onRetake}
        >
          Take it again
        </ActionButton>

        {nextHref ? (
          <ActionButton
            href={nextHref}
            variant={passed ? "solid" : "line"}
            size="sm"
            className="group"
          >
            Next lecture
            <ArrowRightIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
          </ActionButton>
        ) : null}

        <Link
          href={lectureHref}
          className="link-wipe text-lg font-semibold text-primary"
        >
          Back to the lecture
        </Link>
      </div>

      <p role="status" className={`mt-6 ${META.base}`}>
        Design prototype - this result is not recorded against your account.
      </p>
    </div>
  );
}
