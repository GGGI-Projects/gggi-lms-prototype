import type { Metadata } from "next";
import { CONSOLE, META } from "@/lib/theme";
import { instructors, moduleLoad, formatNumber } from "@/lib/admin";
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
  type Column,
} from "@/components/console/ui";
import { Register, type RegisterItem } from "@/components/console/register";
import { NewInstructorAction } from "@/components/console/new-instructor-action";
import {
  STAFF_STATUS_LABEL,
  STAFF_STATUS_TONE,
} from "@/components/console/status";
import { MANAGED_PROGRAMMES } from "@/content/staff";

export const metadata: Metadata = { title: "Instructors" };

const COLUMNS: Column[] = [
  { key: "name", head: "Instructor" },
  { key: "field", head: "Field", hideBelow: "lg" },
  { key: "programmes", head: "Programmes" },
  { key: "modules", head: "Modules", numeric: true, hideBelow: "sm" },
  { key: "learners", head: "Learners", numeric: true, hideBelow: "md" },
  { key: "active", head: "Last active", numeric: true, hideBelow: "xl" },
  { key: "status", head: "Status" },
];

/**
 * The people who write the material.
 *
 * The column that matters is PROGRAMMES, not modules or learners: an
 * instructor with nothing assigned cannot do anything at all, and that is the
 * single most useful fact this screen can surface. It is why the empty case is
 * called out in words rather than left as a blank cell for someone to notice.
 */
export default function InstructorsPage() {
  const people = instructors();

  const items: RegisterItem[] = people.map((member) => {
    const load = moduleLoad(member);
    const unassigned = load.programmes.length === 0;

    return {
      id: member.id,
      text: [member.name, member.email, member.title]
        .concat(load.programmes.map((programme) => programme.title))
        .join(" ")
        .toLowerCase(),
      tags: [member.status, unassigned ? "unassigned" : "assigned"],
      row: (
        <Row href={`/admin/instructors/${member.id}`}>
          <NameCell
            href={`/admin/instructors/${member.id}`}
            initials={member.initials}
            title={member.name}
            subtitle={member.email}
          />
          <Cell hideBelow="lg">{member.title}</Cell>
          <Cell>
            {unassigned ? (
              <span className="text-clay">Nothing assigned</span>
            ) : (
              <span className="flex flex-wrap gap-1.5">
                {load.programmes.map((programme) => (
                  <Badge
                    key={programme.id}
                    tone={programme.status === "draft" ? "neutral" : "info"}
                  >
                    {programme.title.split(" ")[0]}
                    {programme.status === "draft" ? " (draft)" : ""}
                  </Badge>
                ))}
              </span>
            )}
          </Cell>
          <Cell numeric hideBelow="sm">
            {load.published}
            {load.inReview + load.unwritten > 0 ? (
              <span className={META.base}> +{load.inReview + load.unwritten}</span>
            ) : null}
          </Cell>
          <Cell numeric hideBelow="md">
            {load.learners ? formatNumber(load.learners) : "-"}
          </Cell>
          <Cell numeric hideBelow="xl">
            {member.lastActive ? formatDate(member.lastActive) : "Never"}
          </Cell>
          <Cell>
            <Badge tone={STAFF_STATUS_TONE[member.status]}>
              {STAFF_STATUS_LABEL[member.status]}
            </Badge>
          </Cell>
        </Row>
      ),
    };
  });

  const unassignedCount = people.filter(
    (member) => (member.programmeIds ?? []).length === 0,
  ).length;
  const totalModules = people.reduce(
    (sum, member) => sum + moduleLoad(member).published,
    0,
  );

  return (
    <PageBody>
      <PageHeader
        eyebrow="People"
        title="Instructors"
        lead="Module instructors write and revise the material for the programmes they are assigned to. They cannot see the register, change a programme's settings or touch anybody's account."
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard label="Instructors" value={people.length} hint="on the platform" />
        <MetricCard
          label="Published modules"
          value={totalModules}
          hint="written by this team"
        />
        <MetricCard
          label="Awaiting assignment"
          value={unassignedCount}
          hint="cannot author anything yet"
          goodWhen="down"
        />
        <MetricCard
          label="Programmes covered"
          value={`${MANAGED_PROGRAMMES.filter((p) => p.instructorIds.length).length} of ${MANAGED_PROGRAMMES.length}`}
          hint="every programme has an author"
        />
      </div>

      <div className={CONSOLE.stack}>
        <Register
          columns={COLUMNS}
          caption="Module instructors"
          items={items}
          searchPlaceholder="Search by name, field or programme"
          action={
            <NewInstructorAction
              programmes={MANAGED_PROGRAMMES.map((programme) => ({
                id: programme.id,
                title: programme.title,
              }))}
            />
          }
          filters={[
            { value: "all", label: "All", count: people.length },
            {
              value: "assigned",
              label: "Assigned",
              count: people.length - unassignedCount,
            },
            { value: "unassigned", label: "Unassigned", count: unassignedCount },
            {
              value: "invited",
              label: "Invited",
              count: people.filter((member) => member.status === "invited").length,
            },
          ]}
          emptyMessage="No instructor matches that."
        />
      </div>

      <PrototypeNote className="mt-6" />
    </PageBody>
  );
}
