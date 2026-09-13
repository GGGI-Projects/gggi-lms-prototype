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
 * Every module this account administers, as cards - the same shape
 * `/lecturer/modules` uses for the same reason: an index is not the working
 * screen, it is the way in. Only the Super Administrator adds to this list
 * (FR-ADM-065) - if a module is missing, that is who to ask.
 */
export default function ModuleAdminModulesPage() {
  const member = staffById(SESSION["module-admin"]);
  if (!member) throw new Error("[module-admin] no session account");

  const load = lectureLoad(member);

  return (
    <PageBody>
      <PageHeader
        eyebrow="Module administration"
        title="My modules"
        lead="What you have been assigned to run. Only the Super Administrator can add to this list."
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
                    "Not on the public catalogue yet - a draft, with nothing here for a learner to read until it is published."}
                </p>

                <p className={`mt-4 ${META.base}`}>
                  {mdl.publishedLectures} of {mdl.lectureCount}{" "}
                  lectures published · {mdl.lecturerIds.length}{" "}
                  {mdl.lecturerIds.length === 1 ? "lecturer" : "lecturers"}
                </p>

                <Link
                  href={`/module-admin/modules/${mdl.id}`}
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
            body="The Super Administrator assigns modules to Module Administrators. Once one is assigned, it appears here as a card and you can open it to run it."
          />
        </div>
      )}
    </PageBody>
  );
}
