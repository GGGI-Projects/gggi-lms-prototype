import type { Metadata } from "next";
import Link from "next/link";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import { catalogueModule, lectureLoad, staffById } from "@/lib/admin";
import {
  Badge,
  EmptyState,
  PageBody,
  PageHeader,
} from "@/components/console/ui";

export const metadata: Metadata = { title: "My modules" };

/**
 * Every module this lecturer is assigned to, as cards.
 *
 * ONE CARD, THREE THINGS: the title, what it is about, and the way in. Which
 * lectures are finished is the detail page's job, not this one's - a list of
 * assignments is an index, and an index that also tries to be the working
 * screen ends up doing neither well. Only an administrator adds to this list;
 * see the note below rather than looking for a button here.
 */
export default function LecturerModulesPage() {
  const member = staffById(SESSION.lecturer);
  if (!member) throw new Error("[lecturer] no session account");

  const load = lectureLoad(member);

  return (
    <PageBody>
      <PageHeader
        eyebrow="Teaching"
        title="My modules"
        lead="What you have been assigned. Only an administrator can add to this list - if a module is missing, ask for it rather than looking for a button."
      />

      {load.modules.length ? (
        <div className={`${CONSOLE.stack} grid gap-5 sm:grid-cols-2`}>
          {load.modules.map((mdl) => {
            const publicEntry = catalogueModule(mdl.id);

            return (
              <article
                key={mdl.id}
                className="flex flex-col rounded-sm border border-surface-deep bg-paper-raised p-6 sm:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="font-display text-2xl tracking-tight text-ink">
                    {mdl.title}
                  </h2>
                  <Badge tone={mdl.status === "draft" ? "neutral" : "done"}>
                    {mdl.status === "draft" ? "Draft" : "Published"}
                  </Badge>
                </div>

                <p className={`measure-wide mt-3 flex-1 ${BODY.base}`}>
                  {publicEntry?.summary ??
                    "Not on the public catalogue yet - there is nothing here for a learner to read until its lectures are written and it is published."}
                </p>

                <p className={`mt-4 ${META.base}`}>
                  {mdl.publishedLectures} of {mdl.lectureCount}{" "}
                  lectures published
                </p>

                <Link
                  href={`/lecturer/modules/${mdl.id}`}
                  className="btn-ripple btn-solid btn-sm mt-6 self-start"
                >
                  <span aria-hidden="true" className="btn-wave" />
                  <span className="btn-label">Manage module</span>
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={CONSOLE.stack}>
          <EmptyState
            title="Nothing assigned yet"
            body="An administrator assigns modules to lecturers. Once one is assigned, it appears here as a card and you can open it to start writing."
          />
        </div>
      )}
    </PageBody>
  );
}
