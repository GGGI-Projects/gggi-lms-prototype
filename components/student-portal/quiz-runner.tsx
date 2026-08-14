"use client";

import Link from "next/link";
import { useState } from "react";
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
 * ONE QUESTION AT A TIME, not a page of four. The quiz closes a module and
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
 */
export function QuizRunner({
  questions,
  passMark,
  moduleHref,
  nextHref,
}: {
  questions: Question[];
  passMark: number;
  /** Back to the module the quiz belongs to. */
  moduleHref: string;
  /** The next module, when there is one. Offered only after a pass. */
  nextHref?: string;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => questions.map(() => null),
  );
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const correct = answers.filter(
    (answer, i) => answer === questions[i].answer,
  ).length;
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= passMark;

  if (submitted) {
    return (
      <Review
        questions={questions}
        answers={answers}
        score={score}
        correct={correct}
        passed={passed}
        passMark={passMark}
        moduleHref={moduleHref}
        nextHref={nextHref}
        onRetake={() => {
          setAnswers(questions.map(() => null));
          setIndex(0);
          setSubmitted(false);
        }}
      />
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
            onClick={() => answeredAll && setSubmitted(true)}
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

/* ------------------------------------------------------------------ review */

function Review({
  questions,
  answers,
  score,
  correct,
  passed,
  passMark,
  moduleHref,
  nextHref,
  onRetake,
}: {
  questions: Question[];
  answers: (number | null)[];
  score: number;
  correct: number;
  passed: boolean;
  passMark: number;
  moduleHref: string;
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
              ? `That is above the ${passMark}% needed, and it counts towards the programme's certificate.`
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
        <ActionButton variant="line" size="sm" onClick={onRetake}>
          Take it again
        </ActionButton>

        {passed && nextHref ? (
          <ActionButton href={nextHref} variant="solid" size="sm" className="group">
            Next module
            <ArrowRightIcon className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
          </ActionButton>
        ) : null}

        <Link
          href={moduleHref}
          className="link-wipe text-lg font-semibold text-primary"
        >
          Back to the module
        </Link>
      </div>

      <p role="status" className={`mt-6 ${META.base}`}>
        Design prototype - this result is not recorded against your account.
      </p>
    </div>
  );
}
