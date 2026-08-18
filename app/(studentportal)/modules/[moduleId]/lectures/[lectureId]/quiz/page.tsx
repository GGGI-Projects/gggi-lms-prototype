import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizRunner } from "@/components/student-portal/quiz-runner";
import { Badge, PageBody, PageHeader } from "@/components/student-portal/ui";
import { ClockIcon, QuizIcon } from "@/components/student-portal/icons";
import { LECTURES } from "@/content/curriculum";
import { MODULES } from "@/content/site";
import {
  PASS_MARK,
  lectureNeighbours,
  progressFor,
  quizFor,
  quizStatus,
  writtenQuestionsFor,
} from "@/lib/portal";
import { META } from "@/lib/theme";

type Params = { params: Promise<{ moduleId: string; lectureId: string }> };

export function generateStaticParams() {
  return MODULES.flatMap((mdl) =>
    (LECTURES[mdl.id] ?? []).map((lecture) => ({
      moduleId: mdl.id,
      lectureId: lecture.id,
    })),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { moduleId, lectureId } = await params;
  const mod = LECTURES[moduleId]?.find((entry) => entry.id === lectureId);
  if (!mod) return { title: "Quiz not found" };

  return { title: `Quiz - ${mod.title}` };
}

/**
 * The lecture quiz - and, where the lecture has any, its written questions,
 * appended to the end of the same flow (see `<QuizRunner>`).
 *
 * Its own route rather than a panel on the lecture page, and that is a design
 * decision rather than a routing one: a quiz taken in a drawer over the
 * material is a quiz taken with the answers still on screen. A separate page
 * with its own address is also something a learner can be sent back to from
 * the quizzes list, the lecture page and the certificate nudge - three places
 * that would otherwise each need their own way of opening it.
 *
 * The page itself is a server component that hands the questions to one client
 * component. The pool, the rotation and the pass rule never reach the browser.
 */
export default async function QuizPage({ params }: Params) {
  const { moduleId, lectureId } = await params;
  const progress = progressFor(moduleId);
  const mod = progress?.lectures.find((entry) => entry.id === lectureId);

  if (!progress || !mod) notFound();

  const questions = quizFor(moduleId, lectureId);
  if (!questions.length) notFound();
  const written = writtenQuestionsFor(lectureId);

  const { next } = lectureNeighbours(moduleId, lectureId);
  const previous = quizStatus(moduleId, lectureId);
  const score = progress.enrolment?.quizScores[lectureId];
  const lectureHref = `/modules/${moduleId}/lectures/${lectureId}`;

  const advance = next
    ? { href: `/modules/${moduleId}/lectures/${next.id}`, label: "Go to next lecture" }
    : undefined;

  return (
    <PageBody>
      <PageHeader
        back={{ href: lectureHref, label: `${mod.number}. ${mod.title}` }}
        eyebrow="Lecture quiz"
        title={mod.title}
        lead={
          written.length
            ? "Answer each question, then submit - the written questions at the end are checked for the words a correct answer would use. You'll see your score straight away."
            : "Answer each question, then submit. You'll see your score straight away."
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge icon={<QuizIcon className="size-3.5" />}>
          {questions.length} questions
        </Badge>
        {written.length ? (
          <Badge tone="active">
            + {written.length} written question{written.length === 1 ? "" : "s"}
          </Badge>
        ) : null}
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
          written={written}
          passMark={PASS_MARK}
          lectureHref={lectureHref}
          advance={advance}
        />

        <p className={`mt-10 border-t border-surface-deep pt-6 ${META.base}`}>
          Unlimited attempts, and the highest score is the one that counts
          towards your certificate.
        </p>
      </div>
    </PageBody>
  );
}
