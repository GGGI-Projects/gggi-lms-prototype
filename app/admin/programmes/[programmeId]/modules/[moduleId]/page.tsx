import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONSOLE } from "@/lib/theme";
import { MANAGED_PROGRAMMES } from "@/content/staff";
import { MODULES } from "@/content/curriculum";
import { consoleModules, managedProgramme, quizStatsFor } from "@/lib/admin";
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
  return { title: mod ? mod.title : "Module not found" };
}

/**
 * A module, opened by an administrator.
 *
 * The screen is `<ModuleEditor>`, shared with the instructor console. An
 * administrator can SEE everything here - content, materials, quiz stats,
 * who wrote it - but not touch it: writing a module is `authorModules`, a
 * capability administrators do not hold (see `lib/permissions.ts`). Gating on
 * `manageProgrammes` here would let an administrator author modules directly,
 * which is the instructor's job, not theirs. The back link goes to the
 * programme rather than to "my programmes", and the library links stay
 * inside `/admin`.
 */
export default async function AdminModulePage({ params }: Params) {
  const { programmeId, moduleId } = await params;
  const programme = managedProgramme(programmeId);
  const mod = consoleModules(programmeId).find((entry) => entry.id === moduleId);
  if (!programme || !mod) notFound();

  const content =
    MODULES[programmeId]?.find((entry) => entry.id === moduleId) ?? null;
  const questions = content ? quizFor(programmeId, moduleId) : [];
  const live = programme.status === "published" && mod.state === "published";
  const base = `/admin/programmes/${programme.id}`;

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
            {mod.author ? <Badge>Written by {mod.author.name}</Badge> : null}
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
          materials: "/admin/materials",
          material: (id) => `/admin/materials/${id}`,
          learner: live
            ? `/programmes/${programme.id}/modules/${mod.id}`
            : undefined,
        }}
        capability="authorModules"
      />
    </PageBody>
  );
}
