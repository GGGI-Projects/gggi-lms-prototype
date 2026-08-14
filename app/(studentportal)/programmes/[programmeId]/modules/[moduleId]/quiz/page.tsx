import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizRunner } from "@/components/student-portal/quiz-runner";
import { Badge, PageBody, PageHeader } from "@/components/student-portal/ui";
import { ClockIcon, QuizIcon } from "@/components/student-portal/icons";
import { MODULES } from "@/content/curriculum";
import { PROGRAMMES } from "@/content/site";
import {
  PASS_MARK,
  moduleNeighbours,
  progressFor,
  quizFor,
  quizStatus,
} from "@/lib/portal";
import { META } from "@/lib/theme";

type Params = { params: Promise<{ programmeId: string; moduleId: string }> };

export function generateStaticParams() {
  return PROGRAMMES.flatMap((programme) =>
    (MODULES[programme.id] ?? []).map((module) => ({
      programmeId: programme.id,
      moduleId: module.id,
    })),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { programmeId, moduleId } = await params;
  const mod = MODULES[programmeId]?.find((entry) => entry.id === moduleId);
  if (!mod) return { title: "Quiz not found" };

  return { title: `Quiz - ${mod.title}` };
}

/**
 * The module quiz.
 *
 * Its own route rather than a panel on the module page, and that is a design
 * decision rather than a routing one: a quiz taken in a drawer over the
 * material is a quiz taken with the answers still on screen. A separate page
 * with its own address is also something a learner can be sent back to from
 * the quizzes list, the module page and the certificate nudge - three places
 * that would otherwise each need their own way of opening it.
 *
 * The page itself is a server component that hands the questions to one client
 * component. The pool, the rotation and the pass rule never reach the browser.
 */
export default async function QuizPage({ params }: Params) {
  const { programmeId, moduleId } = await params;
  const progress = progressFor(programmeId);
  const mod = progress?.modules.find((entry) => entry.id === moduleId);

  if (!progress || !mod) notFound();

  const questions = quizFor(programmeId, moduleId);
  if (!questions.length) notFound();

  const { next } = moduleNeighbours(programmeId, moduleId);
  const previous = quizStatus(programmeId, moduleId);
  const score = progress.enrolment?.quizScores[moduleId];
  const moduleHref = `/programmes/${programmeId}/modules/${moduleId}`;

  return (
    <PageBody>
      <PageHeader
        back={{ href: moduleHref, label: `${mod.number}. ${mod.title}` }}
        eyebrow="Module quiz"
        title={mod.title}
        lead="Answer each question, then submit. Every answer is explained afterwards, whether you got it right or not."
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge icon={<QuizIcon className="size-3.5" />}>
          {questions.length} questions
        </Badge>
        <Badge icon={<ClockIcon className="size-3.5" />}>No time limit</Badge>
        <Badge>Pass mark {PASS_MARK}%</Badge>
        {previous === "passed" ? (
          <Badge tone="done">Previously passed · {score}%</Badge>
        ) : previous === "failed" ? (
          <Badge tone="warn">Last attempt · {score}%</Badge>
        ) : null}
      </div>

      {/* Narrower than the rest of the portal on purpose. A question and four
          options set across a 1200px column is a reading problem; this is the
          one screen where the measure matters more than the density. */}
      <div className="mt-10 max-w-3xl">
        <QuizRunner
          questions={questions}
          passMark={PASS_MARK}
          moduleHref={moduleHref}
          nextHref={
            next ? `/programmes/${programmeId}/modules/${next.id}` : undefined
          }
        />

        <p className={`mt-10 border-t border-surface-deep pt-6 ${META.base}`}>
          Unlimited attempts, and the highest score is the one that counts
          towards your certificate.
        </p>
      </div>
    </PageBody>
  );
}
