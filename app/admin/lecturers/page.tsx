import type { Metadata } from "next";
import { CONSOLE, META } from "@/lib/theme";
import {
  lecturers,
  lectureLoad,
  formatNumber,
  publishedModules,
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
  type Column,
} from "@/components/console/ui";
import { Register, type RegisterItem } from "@/components/console/register";
import { NewLecturerAction } from "@/components/console/new-lecturer-action";
import {
  STAFF_STATUS_LABEL,
  STAFF_STATUS_TONE,
} from "@/components/console/status";
import { MANAGED_MODULES } from "@/content/staff";

export const metadata: Metadata = { title: "Lecturers" };

const COLUMNS: Column[] = [
  { key: "name", head: "Lecturer" },
  { key: "field", head: "Field", hideBelow: "lg" },
  { key: "modules", head: "Modules" },
  { key: "lectures", head: "Lectures", numeric: true, hideBelow: "sm" },
  { key: "learners", head: "Learners", numeric: true, hideBelow: "md" },
  { key: "active", head: "Last active", numeric: true, hideBelow: "xl" },
  { key: "status", head: "Status" },
];

/**
 * The people who write the material.
 *
 * The column that matters is MODULES, not lectures or learners: a
 * lecturer with nothing assigned cannot do anything at all, and that is the
 * single most useful fact this screen can surface. It is why the empty case is
 * called out in words rather than left as a blank cell for someone to notice.
 */
export default function LecturersPage() {
  const people = lecturers();

  const items: RegisterItem[] = people.map((member) => {
    const load = lectureLoad(member);
    const unassigned = load.modules.length === 0;

    return {
      id: member.id,
      text: [member.name, member.email, member.title]
        .concat(load.modules.map((mdl) => mdl.title))
        .join(" ")
        .toLowerCase(),
      tags: [
        member.status,
        unassigned ? "unassigned" : "assigned",
        ...load.modules.map((mdl) => mdl.id),
      ],
      row: (
        <Row href={`/admin/lecturers/${member.id}`}>
          <NameCell
            href={`/admin/lecturers/${member.id}`}
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
                {load.modules.map((mdl) => (
                  <Badge
                    key={mdl.id}
                    tone={mdl.status === "draft" ? "neutral" : "info"}
                  >
                    {mdl.title.split(" ")[0]}
                    {mdl.status === "draft" ? " (draft)" : ""}
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
    (member) => (member.moduleIds ?? []).length === 0,
  ).length;
  const totalLectures = people.reduce(
    (sum, member) => sum + lectureLoad(member).published,
    0,
  );

  return (
    <PageBody>
      <PageHeader
        eyebrow="People"
        title="Lecturers"
        lead="Lecturers write and revise the material for the modules they are assigned to. They cannot see the register, change a module's settings or touch anybody's account."
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard label="Lecturers" value={people.length} hint="on the platform" />
        <MetricCard
          label="Published lectures"
          value={totalLectures}
          hint="written by this team"
        />
        <MetricCard
          label="Awaiting assignment"
          value={unassignedCount}
          hint="cannot author anything yet"
          goodWhen="down"
        />
        <MetricCard
          label="Modules covered"
          value={`${MANAGED_MODULES.filter((p) => p.lecturerIds.length).length} of ${MANAGED_MODULES.length}`}
          hint="every module has an author"
        />
      </div>

      <div className={CONSOLE.stack}>
        <Register
          columns={COLUMNS}
          caption="Lecturers"
          items={items}
          searchPlaceholder="Search by name, field or module"
          action={
            <NewLecturerAction
              modules={MANAGED_MODULES.map((mdl) => ({
                id: mdl.id,
                title: mdl.title,
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
          selectFilter={{
            label: "Module",
            placeholder: "Every module",
            options: publishedModules().map((mdl) => ({
              value: mdl.id,
              label: mdl.title,
            })),
          }}
          emptyMessage="No lecturer matches that."
        />
      </div>

      <PrototypeNote className="mt-6" />
    </PageBody>
  );
}
