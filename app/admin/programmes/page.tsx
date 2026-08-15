import type { Metadata } from "next";
import Link from "next/link";
import { CONSOLE, META } from "@/lib/theme";
import { MANAGED_PROGRAMMES } from "@/content/staff";
import { PLATFORM } from "@/content/operations";
import {
  consoleModules,
  formatNumber,
  instructors,
  instructorsFor,
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
import { NewProgrammeAction } from "@/components/console/new-programme-action";
import {
  PROGRAMME_STATUS_LABEL,
  PROGRAMME_STATUS_TONE,
} from "@/components/console/status";
import { StarFilledIcon } from "@/components/console/icons";

export const metadata: Metadata = { title: "Programmes" };

const COLUMNS: Column[] = [
  { key: "programme", head: "Programme" },
  { key: "status", head: "Status" },
  { key: "modules", head: "Modules", numeric: true },
  { key: "instructors", head: "Instructors", hideBelow: "lg" },
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
export default function ProgrammesPage() {
  const published = MANAGED_PROGRAMMES.filter(
    (programme) => programme.status === "published",
  );
  const drafts = MANAGED_PROGRAMMES.length - published.length;
  const modulesTotal = MANAGED_PROGRAMMES.reduce(
    (sum, programme) => sum + programme.moduleCount,
    0,
  );

  return (
    <PageBody>
      <PageHeader
        eyebrow="Learning"
        title="Programmes"
        lead="Everything the platform teaches. A programme is created as a draft, gets its modules written by the instructors assigned to it, and only becomes visible to learners when somebody publishes it."
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          label="Published"
          value={published.length}
          hint="open for enrolment"
        />
        <MetricCard label="In draft" value={drafts} hint="not visible to learners" />
        <MetricCard label="Modules" value={modulesTotal} hint="written and planned" />
        <MetricCard
          label="Enrolments"
          value={formatNumber(PLATFORM.enrolments)}
          hint="across every programme"
        />
      </div>

      <div className={CONSOLE.stack}>
        {/* The button that ADDS to this register sits at its top-right edge -
            see the note on `<NewProgrammeAction>`. */}
        <div className="mb-4 flex justify-end">
          <NewProgrammeAction
            instructors={instructors().map((member) => ({
              id: member.id,
              name: member.name,
              initials: member.initials,
            }))}
          />
        </div>

        <TableFrame columns={COLUMNS} caption="Programmes on the platform">
          {MANAGED_PROGRAMMES.map((programme) => {
            const modules = consoleModules(programme.id);
            const team = instructorsFor(programme.id);
            const unpublished = modules.filter(
              (mod) => mod.state !== "published",
            ).length;

            return (
              <Row key={programme.id} href={`/admin/programmes/${programme.id}`}>
                <NameCell
                  href={`/admin/programmes/${programme.id}`}
                  title={programme.title}
                  subtitle={`${programme.level} · ${programme.hours} hours`}
                />
                <Cell>
                  <Badge tone={PROGRAMME_STATUS_TONE[programme.status]}>
                    {PROGRAMME_STATUS_LABEL[programme.status]}
                  </Badge>
                </Cell>
                <Cell numeric>
                  {programme.publishedModules}
                  <span className={META.base}>/{programme.moduleCount}</span>
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
                          href={`/admin/instructors/${member.id}`}
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
                  {programme.enrolments ? formatNumber(programme.enrolments) : "-"}
                </Cell>
                <Cell numeric hideBelow="md">
                  {programme.completions ? formatNumber(programme.completions) : "-"}
                </Cell>
                <Cell numeric hideBelow="xl">
                  {programme.rating ? (
                    <span className="inline-flex items-center gap-1.5">
                      <StarFilledIcon className="size-4 text-accent" />
                      {programme.rating.toFixed(1)}
                    </span>
                  ) : (
                    "-"
                  )}
                </Cell>
                <Cell numeric hideBelow="xl">
                  {formatDate(programme.updatedOn)}
                </Cell>
              </Row>
            );
          })}
        </TableFrame>

        <TableFoot
          showing={MANAGED_PROGRAMMES.length}
          total={MANAGED_PROGRAMMES.length}
          note="the whole catalogue"
        />
      </div>

      <PrototypeNote className="mt-6" />
    </PageBody>
  );
}
