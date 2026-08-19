import type { Metadata } from "next";
import Link from "next/link";
import { CONSOLE, META } from "@/lib/theme";
import { MANAGED_MODULES } from "@/content/staff";
import { PLATFORM } from "@/content/operations";
import {
  consoleLectures,
  formatNumber,
  lecturers,
  lecturersFor,
} from "@/lib/admin";
import { formatDate } from "@/lib/portal";
import {
  Badge,
  Cell,
  MetricCard,
  NameCell,
  PageBody,
  PageHeader,
  PrototypeNote,
  Row,
  TableFoot,
  TableFrame,
  type Column,
} from "@/components/console/ui";
import { NewModuleAction } from "@/components/console/new-module-action";
import {
  MODULE_STATUS_LABEL,
  MODULE_STATUS_TONE,
} from "@/components/console/status";
import { StarFilledIcon } from "@/components/console/icons";

export const metadata: Metadata = { title: "Modules" };

const COLUMNS: Column[] = [
  { key: "module", head: "Module" },
  { key: "status", head: "Status" },
  { key: "lectures", head: "Lectures", numeric: true },
  { key: "lecturers", head: "Lecturers", hideBelow: "lg" },
  { key: "enrolments", head: "Enrolments", numeric: true, hideBelow: "sm" },
  { key: "completed", head: "Completed", numeric: true, hideBelow: "md" },
  { key: "rating", head: "Rating", numeric: true, hideBelow: "xl" },
  { key: "updated", head: "Updated", numeric: true, hideBelow: "xl" },
];

/**
 * The catalogue, as the people who own it see it.
 *
 * Six rows and no search box: a filter over six things is furniture. The
 * register components exist for the screens that need them, and this is not
 * one of them - which is worth saying out loud, because "every list screen
 * looks the same" is how a console ends up with a search field above a list of
 * three.
 */
export default function ModulesPage() {
  const published = MANAGED_MODULES.filter(
    (mdl) => mdl.status === "published",
  );
  const drafts = MANAGED_MODULES.length - published.length;
  const lecturesTotal = MANAGED_MODULES.reduce(
    (sum, mdl) => sum + mdl.lectureCount,
    0,
  );

  return (
    <PageBody>
      <PageHeader
        eyebrow="Learning"
        title="Modules"
        lead="Everything the platform teaches. A module is created as a draft, gets its lectures written by the lecturers assigned to it, and only becomes visible to learners when somebody publishes it."
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          label="Published"
          value={published.length}
          hint="open for enrolment"
        />
        <MetricCard label="In draft" value={drafts} hint="not visible to learners" />
        <MetricCard label="Lectures" value={lecturesTotal} hint="written and planned" />
        <MetricCard
          label="Enrolments"
          value={formatNumber(PLATFORM.enrolments)}
          hint="across every module"
        />
      </div>

      <div className={CONSOLE.stack}>
        {/* The button that ADDS to this register sits at its top-right edge -
            see the note on `<NewModuleAction>`. */}
        <div className="mb-4 flex justify-end">
          <NewModuleAction
            lecturers={lecturers().map((member) => ({
              id: member.id,
              name: member.name,
              initials: member.initials,
            }))}
          />
        </div>

        <TableFrame columns={COLUMNS} caption="Modules on the platform">
          {MANAGED_MODULES.map((mdl) => {
            const lectures = consoleLectures(mdl.id);
            const team = lecturersFor(mdl.id);
            const unpublished = lectures.filter(
              (mod) => mod.state !== "published",
            ).length;

            return (
              <Row key={mdl.id} href={`/admin/modules/${mdl.id}`}>
                <NameCell
                  href={`/admin/modules/${mdl.id}`}
                  title={mdl.title}
                  subtitle={`${mdl.level} · ${mdl.hours} hours`}
                />
                <Cell>
                  <Badge tone={MODULE_STATUS_TONE[mdl.status]}>
                    {MODULE_STATUS_LABEL[mdl.status]}
                  </Badge>
                </Cell>
                <Cell numeric>
                  {mdl.publishedLectures}
                  <span className={META.base}>/{mdl.lectureCount}</span>
                  {unpublished ? (
                    <span className="block text-sm text-clay">
                      {unpublished} outstanding
                    </span>
                  ) : null}
                </Cell>
                <Cell hideBelow="lg">
                  {team.length ? (
                    <span className="flex flex-wrap gap-1.5">
                      {team.map((member) => (
                        <Link
                          key={member.id}
                          href={`/admin/lecturers/${member.id}`}
                          className="link-wipe text-lg text-primary"
                        >
                          {member.name}
                        </Link>
                      ))}
                    </span>
                  ) : (
                    <span className="text-clay">Nobody assigned</span>
                  )}
                </Cell>
                <Cell numeric hideBelow="sm">
                  {mdl.enrolments ? formatNumber(mdl.enrolments) : "-"}
                </Cell>
                <Cell numeric hideBelow="md">
                  {mdl.completions ? formatNumber(mdl.completions) : "-"}
                </Cell>
                <Cell numeric hideBelow="xl">
                  {mdl.rating ? (
                    <span className="inline-flex items-center gap-1.5">
                      <StarFilledIcon className="size-4 text-accent" />
                      {mdl.rating.toFixed(1)}
                    </span>
                  ) : (
                    "-"
                  )}
                </Cell>
                <Cell numeric hideBelow="xl">
                  {formatDate(mdl.updatedOn)}
                </Cell>
              </Row>
            );
          })}
        </TableFrame>

        <TableFoot
          showing={MANAGED_MODULES.length}
          total={MANAGED_MODULES.length}
          note="the whole catalogue"
        />
      </div>

      <PrototypeNote className="mt-6" />
    </PageBody>
  );
}
