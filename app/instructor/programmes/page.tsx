import type { Metadata } from "next";
import Link from "next/link";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import { catalogueProgramme, moduleLoad, staffById } from "@/lib/admin";
import {
  Badge,
  EmptyState,
  PageBody,
  PageHeader,
} from "@/components/console/ui";

export const metadata: Metadata = { title: "My programmes" };

/**
 * Every programme this instructor is assigned to, as cards.
 *
 * ONE CARD, THREE THINGS: the title, what it is about, and the way in. Which
 * modules are finished is the detail page's job, not this one's - a list of
 * assignments is an index, and an index that also tries to be the working
 * screen ends up doing neither well. Only an administrator adds to this list;
 * see the note below rather than looking for a button here.
 */
export default function InstructorProgrammesPage() {
  const member = staffById(SESSION.instructor);
  if (!member) throw new Error("[instructor] no session account");

  const load = moduleLoad(member);

  return (
    <PageBody>
      <PageHeader
        eyebrow="Teaching"
        title="My programmes"
        lead="What you have been assigned. Only an administrator can add to this list - if a programme is missing, ask for it rather than looking for a button."
      />

      {load.programmes.length ? (
        <div className={`${CONSOLE.stack} grid gap-5 sm:grid-cols-2`}>
          {load.programmes.map((programme) => {
            const publicEntry = catalogueProgramme(programme.id);

            return (
              <article
                key={programme.id}
                className="flex flex-col rounded-sm border border-surface-deep bg-paper-raised p-6 sm:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="font-display text-2xl tracking-tight text-ink">
                    {programme.title}
                  </h2>
                  <Badge tone={programme.status === "draft" ? "neutral" : "done"}>
                    {programme.status === "draft" ? "Draft" : "Published"}
                  </Badge>
                </div>

                <p className={`measure-wide mt-3 flex-1 ${BODY.base}`}>
                  {publicEntry?.summary ??
                    "Not on the public catalogue yet - there is nothing here for a learner to read until its modules are written and it is published."}
                </p>

                <p className={`mt-4 ${META.base}`}>
                  {programme.publishedModules} of {programme.moduleCount}{" "}
                  modules published
                </p>

                <Link
                  href={`/instructor/programmes/${programme.id}`}
                  className="btn-ripple btn-solid btn-sm mt-6 self-start"
                >
                  <span aria-hidden="true" className="btn-wave" />
                  <span className="btn-label">Manage programme</span>
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={CONSOLE.stack}>
          <EmptyState
            title="Nothing assigned yet"
            body="An administrator assigns programmes to instructors. Once one is assigned, it appears here as a card and you can open it to start writing."
          />
        </div>
      )}
    </PageBody>
  );
}
