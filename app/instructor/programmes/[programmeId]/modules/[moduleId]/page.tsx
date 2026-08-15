import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONSOLE } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import { MODULES } from "@/content/curriculum";
import {
  consoleModules,
  managedProgramme,
  programmesFor,
  quizStatsFor,
  staffById,
} from "@/lib/admin";
import { attachmentsFor, pickerData } from "@/lib/materials";
import { PASS_MARK, quizFor } from "@/lib/portal";
import { Badge, PageBody, PageHeader } from "@/components/console/ui";
import {
  DraftModuleNotice,
  ModuleEditor,
} from "@/components/console/module-editor";
import {
  MODULE_STATE_LABEL,
  MODULE_STATE_TONE,
} from "@/components/console/status";

type Params = { params: Promise<{ programmeId: string; moduleId: string }> };

export function generateStaticParams() {
  const member = staffById(SESSION.instructor);
  return (member?.programmeIds ?? []).flatMap((programmeId) =>
    consoleModules(programmeId).map((mod) => ({
      programmeId,
      moduleId: mod.id,
    })),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { programmeId, moduleId } = await params;
  const mod = consoleModules(programmeId).find((entry) => entry.id === moduleId);
  return { title: mod ? mod.title : "Module not found" };
}

/**
 * A module, opened by the person who writes it.
 *
 * The screen is `<ModuleEditor>`, shared with the admin console. What this
 * page decides is the instructor's version of it: the assignment is checked
 * before anything renders, every link stays inside `/instructor`, and the
 * controls are gated on `authorModules`.
 */
export default async function InstructorModulePage({ params }: Params) {
  const { programmeId, moduleId } = await params;
  const member = staffById(SESSION.instructor);
  if (!member) throw new Error("[instructor] no session account");

  const programme = managedProgramme(programmeId);
  const assigned = programmesFor(member).some(
    (entry) => entry.id === programmeId,
  );
  const mod = consoleModules(programmeId).find((entry) => entry.id === moduleId);
  if (!programme || !assigned || !mod) notFound();

  const content =
    MODULES[programmeId]?.find((entry) => entry.id === moduleId) ?? null;
  const questions = content ? quizFor(programmeId, moduleId) : [];
  const live = programme.status === "published" && mod.state === "published";
  const base = `/instructor/programmes/${programme.id}`;

  return (
    <PageBody>
      <PageHeader
        back={{ href: base, label: programme.title }}
        eyebrow={`Module ${mod.number}`}
        title={mod.title}
        meta={
          <>
            <Badge tone={MODULE_STATE_TONE[mod.state]}>
              {MODULE_STATE_LABEL[mod.state]}
            </Badge>
            {content ? (
              <Badge>
                {content.kind === "video" ? "Video module" : "Reading module"}
              </Badge>
            ) : (
              <Badge tone="neutral">Nothing written</Badge>
            )}
          </>
        }
      />

      {programme.status === "draft" ? (
        <div className={CONSOLE.stack}>
          <DraftModuleNotice programme={programme.title} />
        </div>
      ) : null}

      <ModuleEditor
        programme={programme}
        mod={mod}
        content={content}
        attachments={attachmentsFor(programmeId, moduleId)}
        picker={pickerData()}
        quiz={{
          questions: questions.length,
          stats: quizStatsFor(moduleId),
          passMark: PASS_MARK,
        }}
        hrefs={{
          programme: base,
          quiz: `${base}/modules/${mod.id}/quiz`,
          materials: "/instructor/materials",
          material: (id) => `/instructor/materials/${id}`,
          learner: live
            ? `/programmes/${programme.id}/modules/${mod.id}`
            : undefined,
        }}
        capability="authorModules"
      />
    </PageBody>
  );
}
