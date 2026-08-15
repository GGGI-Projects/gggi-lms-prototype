import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SESSION } from "@/content/staff";
import { MODULES } from "@/content/curriculum";
import {
  consoleModules,
  managedProgramme,
  programmesFor,
  quizStatsFor,
  staffById,
} from "@/lib/admin";
import { PASS_MARK, quizFor } from "@/lib/portal";
import { PageBody, PageHeader } from "@/components/console/ui";
import { QuizHeaderMeta, QuizManager } from "@/components/console/quiz-manager";

type Params = { params: Promise<{ programmeId: string; moduleId: string }> };

export function generateStaticParams() {
  const member = staffById(SESSION.instructor);
  return (member?.programmeIds ?? []).flatMap((programmeId) =>
    consoleModules(programmeId).map((mod) => ({ programmeId, moduleId: mod.id })),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { programmeId, moduleId } = await params;
  const mod = consoleModules(programmeId).find((entry) => entry.id === moduleId);
  return { title: mod ? `Quiz - ${mod.title}` : "Quiz not found" };
}

/**
 * The quiz an instructor is responsible for.
 *
 * The screen is `<QuizManager>`, shared with the admin console - see the note
 * there for why a quiz gets a page of its own rather than a section at the
 * bottom of the module.
 */
export default async function InstructorQuizPage({ params }: Params) {
  const { programmeId, moduleId } = await params;
  const member = staffById(SESSION.instructor);
  if (!member) throw new Error("[instructor] no session account");

  const programme = managedProgramme(programmeId);
  const assigned = programmesFor(member).some(
    (entry) => entry.id === programmeId,
  );
  const mod = consoleModules(programmeId).find((entry) => entry.id === moduleId);
  if (!programme || !assigned || !mod) notFound();

  const hasContent = Boolean(
    MODULES[programmeId]?.find((entry) => entry.id === moduleId),
  );
  const questions = hasContent ? quizFor(programmeId, moduleId) : [];
  const stats = quizStatsFor(moduleId);
  const live = programme.status === "published" && mod.state === "published";
  const base = `/instructor/programmes/${programme.id}`;

  return (
    <PageBody>
      <PageHeader
        back={{
          href: `${base}/modules/${mod.id}`,
          label: `${mod.number}. ${mod.title}`,
        }}
        eyebrow="Module quiz"
        title={`Quiz - ${mod.title}`}
        lead="Four questions close the module and confirm the ideas landed. Unlimited attempts, no timer - the quiz is a foundation, not a filter."
        meta={
          <QuizHeaderMeta
            questions={questions.length}
            passMark={PASS_MARK}
            stats={stats}
          />
        }
      />

      <QuizManager
        programme={programme}
        mod={mod}
        questions={questions}
        stats={stats}
        passMark={PASS_MARK}
        hrefs={{
          module: `${base}/modules/${mod.id}`,
          programme: base,
          learner: live
            ? `/programmes/${programme.id}/modules/${mod.id}/quiz`
            : undefined,
        }}
        capability="authorModules"
      />
    </PageBody>
  );
}
