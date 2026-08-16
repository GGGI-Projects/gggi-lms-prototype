import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MANAGED_MODULES } from "@/content/staff";
import { LECTURES } from "@/content/curriculum";
import { consoleLectures, managedModule, quizStatsFor } from "@/lib/admin";
import { PASS_MARK, quizFor } from "@/lib/portal";
import { PageBody, PageHeader } from "@/components/console/ui";
import { QuizHeaderMeta, QuizManager } from "@/components/console/quiz-manager";

type Params = { params: Promise<{ moduleId: string; lectureId: string }> };

export function generateStaticParams() {
  return MANAGED_MODULES.flatMap((mdl) =>
    consoleLectures(mdl.id).map((mod) => ({
      moduleId: mdl.id,
      lectureId: mod.id,
    })),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { moduleId, lectureId } = await params;
  const mod = consoleLectures(moduleId).find((entry) => entry.id === lectureId);
  return { title: mod ? `Quiz - ${mod.title}` : "Quiz not found" };
}

/**
 * A quiz, opened by an administrator.
 *
 * Same screen as the instructor's, but read-only for this role: writing and
 * revising a quiz is `authorLectures`, which belongs to the instructor
 * assigned to the module, not to `manageModules`. An administrator can
 * read the questions and the results and follows the link to platform
 * settings, where the pass mark actually lives and where the super
 * administrator can change it.
 */
export default async function AdminQuizPage({ params }: Params) {
  const { moduleId, lectureId } = await params;
  const mdl = managedModule(moduleId);
  const mod = consoleLectures(moduleId).find((entry) => entry.id === lectureId);
  if (!mdl || !mod) notFound();

  const hasContent = Boolean(
    LECTURES[moduleId]?.find((entry) => entry.id === lectureId),
  );
  const questions = hasContent ? quizFor(moduleId, lectureId) : [];
  const stats = quizStatsFor(lectureId);
  const live = mdl.status === "published" && mod.state === "published";
  const base = `/admin/modules/${mdl.id}`;

  return (
    <PageBody>
      <PageHeader
        back={{
          href: `${base}/lectures/${mod.id}`,
          label: `${mod.number}. ${mod.title}`,
        }}
        eyebrow="Lecture quiz"
        title={`Quiz - ${mod.title}`}
        lead={`${mdl.title}. Unlimited attempts, no timer, and one pass mark for the whole platform.`}
        meta={
          <QuizHeaderMeta
            questions={questions.length}
            passMark={PASS_MARK}
            stats={stats}
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
          settings: "/admin/settings",
          learner: live
            ? `/modules/${mdl.id}/lectures/${mod.id}/quiz`
            : undefined,
        }}
        capability="authorLectures"
      />
    </PageBody>
  );
}
