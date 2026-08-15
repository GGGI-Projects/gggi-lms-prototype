import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MANAGED_PROGRAMMES } from "@/content/staff";
import { MODULES } from "@/content/curriculum";
import { consoleModules, managedProgramme, quizStatsFor } from "@/lib/admin";
import { PASS_MARK, quizFor } from "@/lib/portal";
import { PageBody, PageHeader } from "@/components/console/ui";
import { QuizHeaderMeta, QuizManager } from "@/components/console/quiz-manager";

type Params = { params: Promise<{ programmeId: string; moduleId: string }> };

export function generateStaticParams() {
  return MANAGED_PROGRAMMES.flatMap((programme) =>
    consoleModules(programme.id).map((mod) => ({
      programmeId: programme.id,
      moduleId: mod.id,
    })),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { programmeId, moduleId } = await params;
  const mod = consoleModules(programmeId).find((entry) => entry.id === moduleId);
  return { title: mod ? `Quiz - ${mod.title}` : "Quiz not found" };
}

/**
 * A quiz, opened by an administrator.
 *
 * Same screen as the instructor's, but read-only for this role: writing and
 * revising a quiz is `authorModules`, which belongs to the instructor
 * assigned to the programme, not to `manageProgrammes`. An administrator can
 * read the questions and the results and follows the link to platform
 * settings, where the pass mark actually lives and where the super
 * administrator can change it.
 */
export default async function AdminQuizPage({ params }: Params) {
  const { programmeId, moduleId } = await params;
  const programme = managedProgramme(programmeId);
  const mod = consoleModules(programmeId).find((entry) => entry.id === moduleId);
  if (!programme || !mod) notFound();

  const hasContent = Boolean(
    MODULES[programmeId]?.find((entry) => entry.id === moduleId),
  );
  const questions = hasContent ? quizFor(programmeId, moduleId) : [];
  const stats = quizStatsFor(moduleId);
  const live = programme.status === "published" && mod.state === "published";
  const base = `/admin/programmes/${programme.id}`;

  return (
    <PageBody>
      <PageHeader
        back={{
          href: `${base}/modules/${mod.id}`,
          label: `${mod.number}. ${mod.title}`,
        }}
        eyebrow="Module quiz"
        title={`Quiz - ${mod.title}`}
        lead={`${programme.title}. Unlimited attempts, no timer, and one pass mark for the whole platform.`}
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
          settings: "/admin/settings",
          learner: live
            ? `/programmes/${programme.id}/modules/${mod.id}/quiz`
            : undefined,
        }}
        capability="authorModules"
      />
    </PageBody>
  );
}
