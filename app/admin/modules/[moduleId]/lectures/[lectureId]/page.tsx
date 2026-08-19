import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONSOLE } from "@/lib/theme";
import { MANAGED_MODULES } from "@/content/staff";
import { LECTURES } from "@/content/curriculum";
import { consoleLectures, managedModule, quizStatsFor } from "@/lib/admin";
import { attachmentsFor, pickerData } from "@/lib/materials";
import { PASS_MARK, quizFor, writtenQuestionsFor } from "@/lib/portal";
import { Badge, PageBody, PageHeader } from "@/components/console/ui";
import {
  DraftLectureNotice,
  LectureEditor,
} from "@/components/console/lecture-editor";
import { RenameAction } from "@/components/console/rename-action";
import {
  LECTURE_STATE_LABEL,
  LECTURE_STATE_TONE,
} from "@/components/console/status";

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
  return { title: mod ? mod.title : "Lecture not found" };
}

/**
 * A lecture, opened by an administrator.
 *
 * The screen is `<LectureEditor>`, shared with the lecturer console. An
 * administrator can SEE everything here - content, materials, quiz stats,
 * who wrote it - but not touch it: writing a lecture is `authorLectures`, a
 * capability administrators do not hold (see `lib/permissions.ts`). Gating on
 * `manageModules` here would let an administrator author lectures directly,
 * which is the lecturer's job, not theirs. The back link goes to the
 * module rather than to "my modules", and the library links stay
 * inside `/admin`.
 */
export default async function AdminLecturePage({ params }: Params) {
  const { moduleId, lectureId } = await params;
  const mdl = managedModule(moduleId);
  const mod = consoleLectures(moduleId).find((entry) => entry.id === lectureId);
  if (!mdl || !mod) notFound();

  const content =
    LECTURES[moduleId]?.find((entry) => entry.id === lectureId) ?? null;
  const questions = content ? quizFor(moduleId, lectureId) : [];
  const live = mdl.status === "published" && mod.state === "published";
  const base = `/admin/modules/${mdl.id}`;

  return (
    <PageBody>
      <PageHeader
        back={{ href: base, label: mdl.title }}
        eyebrow={`Lecture ${mod.number}`}
        title={mod.title}
        meta={
          <>
            <Badge tone={LECTURE_STATE_TONE[mod.state]}>
              {LECTURE_STATE_LABEL[mod.state]}
            </Badge>
            {content ? (
              <Badge>
                {content.kind === "video" ? "Video lecture" : "Reading lecture"}
              </Badge>
            ) : (
              <Badge tone="neutral">Nothing written</Badge>
            )}
            {mod.author ? <Badge>Written by {mod.author.name}</Badge> : null}
          </>
        }
        actions={
          <RenameAction
            subject="lecture"
            title={mod.title}
            capability="authorLectures"
          />
        }
      />

      {mdl.status === "draft" ? (
        <div className={CONSOLE.stack}>
          <DraftLectureNotice module={mdl.title} />
        </div>
      ) : null}

      <LectureEditor
        module={mdl}
        mod={mod}
        content={content}
        attachments={attachmentsFor(moduleId, lectureId)}
        picker={pickerData()}
        quiz={{
          questions: questions.length,
          stats: quizStatsFor(lectureId),
          passMark: PASS_MARK,
          writtenCount: content ? writtenQuestionsFor(lectureId).length : 0,
        }}
        hrefs={{
          module: base,
          quiz: `${base}/lectures/${mod.id}/quiz`,
          materials: "/admin/materials",
          material: (id) => `/admin/materials/${id}`,
          learner: live
            ? `/modules/${mdl.id}/lectures/${mod.id}`
            : undefined,
        }}
        capability="authorLectures"
      />
    </PageBody>
  );
}
