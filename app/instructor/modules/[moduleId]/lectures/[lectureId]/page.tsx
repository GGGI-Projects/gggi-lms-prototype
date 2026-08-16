import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONSOLE } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import { LECTURES } from "@/content/curriculum";
import {
  consoleLectures,
  managedModule,
  modulesFor,
  quizStatsFor,
  staffById,
} from "@/lib/admin";
import { attachmentsFor, pickerData } from "@/lib/materials";
import { PASS_MARK, quizFor } from "@/lib/portal";
import { Badge, PageBody, PageHeader } from "@/components/console/ui";
import {
  DraftLectureNotice,
  LectureEditor,
} from "@/components/console/lecture-editor";
import {
  LECTURE_STATE_LABEL,
  LECTURE_STATE_TONE,
} from "@/components/console/status";

type Params = { params: Promise<{ moduleId: string; lectureId: string }> };

export function generateStaticParams() {
  const member = staffById(SESSION.instructor);
  return (member?.moduleIds ?? []).flatMap((moduleId) =>
    consoleLectures(moduleId).map((mod) => ({
      moduleId,
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
 * A lecture, opened by the person who writes it.
 *
 * The screen is `<LectureEditor>`, shared with the admin console. What this
 * page decides is the instructor's version of it: the assignment is checked
 * before anything renders, every link stays inside `/instructor`, and the
 * controls are gated on `authorLectures`.
 */
export default async function InstructorLecturePage({ params }: Params) {
  const { moduleId, lectureId } = await params;
  const member = staffById(SESSION.instructor);
  if (!member) throw new Error("[instructor] no session account");

  const mdl = managedModule(moduleId);
  const assigned = modulesFor(member).some(
    (entry) => entry.id === moduleId,
  );
  const mod = consoleLectures(moduleId).find((entry) => entry.id === lectureId);
  if (!mdl || !assigned || !mod) notFound();

  const content =
    LECTURES[moduleId]?.find((entry) => entry.id === lectureId) ?? null;
  const questions = content ? quizFor(moduleId, lectureId) : [];
  const live = mdl.status === "published" && mod.state === "published";
  const base = `/instructor/modules/${mdl.id}`;

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
          </>
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
        }}
        hrefs={{
          module: base,
          quiz: `${base}/lectures/${mod.id}/quiz`,
          materials: "/instructor/materials",
          material: (id) => `/instructor/materials/${id}`,
          learner: live
            ? `/modules/${mdl.id}/lectures/${mod.id}`
            : undefined,
        }}
        capability="authorLectures"
      />
    </PageBody>
  );
}
