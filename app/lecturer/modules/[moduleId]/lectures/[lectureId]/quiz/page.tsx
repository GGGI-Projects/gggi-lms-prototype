import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SESSION } from "@/content/staff";
import { LECTURES } from "@/content/curriculum";
import {
  blankStatsFor,
  consoleLectures,
  managedModule,
  modulesFor,
  quizStatsFor,
  staffById,
} from "@/lib/admin";
import { PASS_MARK, quizFor, blankQuestionsFor } from "@/lib/portal";
import { PageBody, PageHeader } from "@/components/console/ui";
import {
  FillInTheBlankQuestionsManager,
  QuizHeaderMeta,
  QuizManager,
} from "@/components/console/quiz-manager";

type Params = { params: Promise<{ moduleId: string; lectureId: string }> };

export function generateStaticParams() {
  const member = staffById(SESSION.lecturer);
  return (member?.moduleIds ?? []).flatMap((moduleId) =>
    consoleLectures(moduleId).map((mod) => ({ moduleId, lectureId: mod.id })),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { moduleId, lectureId } = await params;
  const mod = consoleLectures(moduleId).find((entry) => entry.id === lectureId);
  return { title: mod ? `Quiz - ${mod.title}` : "Quiz not found" };
}

/**
 * The quiz a lecturer is responsible for.
 *
 * The screen is `<QuizManager>`, shared with the admin console - see the note
 * there for why a quiz gets a page of its own rather than a section at the
 * bottom of the lecture.
 */
export default async function LecturerQuizPage({ params }: Params) {
  const { moduleId, lectureId } = await params;
  const member = staffById(SESSION.lecturer);
  if (!member) throw new Error("[lecturer] no session account");

  const mdl = managedModule(moduleId);
  const assigned = modulesFor(member).some(
    (entry) => entry.id === moduleId,
  );
  const mod = consoleLectures(moduleId).find((entry) => entry.id === lectureId);
  if (!mdl || !assigned || !mod) notFound();

  const hasContent = Boolean(
    LECTURES[moduleId]?.find((entry) => entry.id === lectureId),
  );
  const questions = hasContent ? quizFor(moduleId, lectureId) : [];
  const blanks = hasContent ? blankQuestionsFor(lectureId) : [];
  const stats = quizStatsFor(lectureId);
  const blankStats = blankStatsFor(lectureId);
  const live = mdl.status === "published" && mod.state === "published";
  const base = `/lecturer/modules/${mdl.id}`;

  return (
    <PageBody>
      <PageHeader
        back={{
          href: `${base}/lectures/${mod.id}`,
          label: `${mod.number}. ${mod.title}`,
        }}
        eyebrow="Lecture quiz"
        title={`Quiz - ${mod.title}`}
        lead={
          blanks.length
            ? `Four multiple-choice questions, plus ${blanks.length} fill-in-the-blank question${blanks.length === 1 ? "" : "s"} below them, close the lecture and confirm the ideas landed. Unlimited attempts, no timer - the quiz is a foundation, not a filter.`
            : "Four questions close the lecture and confirm the ideas landed. Unlimited attempts, no timer - the quiz is a foundation, not a filter."
        }
        meta={
          <QuizHeaderMeta
            questions={questions.length}
            passMark={PASS_MARK}
            stats={stats}
            blankCount={blanks.length}
          />
        }
      />

      <QuizManager
        module={mdl}
        mod={mod}
        questions={questions}
        stats={stats}
        passMark={PASS_MARK}
        hrefs={{
          lecture: `${base}/lectures/${mod.id}`,
          module: base,
          learner: live
            ? `/modules/${mdl.id}/lectures/${mod.id}/quiz`
            : undefined,
        }}
        capability="authorLectures"
      />

      <div className="mt-12">
        <FillInTheBlankQuestionsManager
          questions={blanks}
          stats={blankStats}
          passMark={PASS_MARK}
          capability="authorLectures"
        />
      </div>
    </PageBody>
  );
}
