import type { Metadata } from "next";
import { CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import { formatNumber, learnersFor, publishedModules, staffById, summarise } from "@/lib/admin";
import { formatDate } from "@/lib/portal";
import {
  Badge,
  Cell,
  MetricCard,
  NameCell,
  PageBody,
  PageHeader,
  ProgressBar,
  PrototypeNote,
  Row,
  type Column,
} from "@/components/console/ui";
import { Register, type RegisterItem } from "@/components/console/register";
import { STATUS_TONE, STATUS_LABEL } from "@/components/console/status";

export const metadata: Metadata = { title: "Learners" };

const COLUMNS: Column[] = [
  { key: "learner", head: "Learner" },
  { key: "where", head: "Organisation", hideBelow: "lg" },
  { key: "modules", head: "Modules", numeric: true },
  { key: "progress", head: "Progress" },
  { key: "score", head: "Avg. score", numeric: true, hideBelow: "sm" },
  { key: "active", head: "Last active", numeric: true, hideBelow: "md" },
  { key: "status", head: "Status" },
];

/**
 * This province's learners, on the same terms an administrator once had
 * platform-wide (FR-REG-030) - not the lecturer's stripped-down list. A
 * Provincial Registrar administers the account, so email, organisation and
 * status all belong here; opening one learner reaches the same reset/
 * suspend/export actions `/admin/students/[studentId]` already has, scoped
 * the same way this list is.
 */
export default function RegistrarLearnersPage() {
  const member = staffById(SESSION["provincial-registrar"]);
  if (!member || !member.province) {
    throw new Error("[registrar] no session account, or no province assigned");
  }

  const register = learnersFor(member);

  const items: RegisterItem[] = register.map((student) => {
    const summary = summarise(student);

    return {
      id: student.id,
      text: [
        student.name,
        student.email,
        student.district,
        student.organisation,
        student.sector,
      ]
        .join(" ")
        .toLowerCase(),
      tags: [
        student.status,
        ...student.enrolments.map((enrolment) => enrolment.moduleId),
      ],
      row: (
        <Row href={`/registrar/learners/${student.id}`}>
          <NameCell
            href={`/registrar/learners/${student.id}`}
            initials={student.initials}
            avatarUrl={student.avatarUrl}
            title={student.name}
            subtitle={student.email}
          />
          <Cell hideBelow="lg">
            <span className="block truncate">{student.organisation}</span>
            <span className={`block truncate ${META.base}`}>
              {student.district}
            </span>
          </Cell>
          <Cell numeric>{summary.enrolled}</Cell>
          <Cell className="min-w-[10rem]">
            <span className="flex items-center gap-3">
              <ProgressBar
                percent={summary.percent}
                label={`${student.name}: ${summary.percent}% of enrolled material`}
                className="w-24"
              />
              <span className="tabular-nums text-sm text-muted">
                {summary.percent}%
              </span>
            </span>
          </Cell>
          <Cell numeric hideBelow="sm">
            {summary.averageScore === null ? (
              <span className="text-muted-light">-</span>
            ) : (
              `${summary.averageScore}%`
            )}
          </Cell>
          <Cell numeric hideBelow="md">
            {formatDate(student.lastActive)}
          </Cell>
          <Cell>
            <Badge tone={STATUS_TONE[student.status]}>
              {STATUS_LABEL[student.status]}
            </Badge>
          </Cell>
        </Row>
      ),
    };
  });

  const counts = (status: string) =>
    register.filter((student) => student.status === status).length;

  return (
    <PageBody>
      <PageHeader
        eyebrow={`${member.province} Province`}
        title="Learners"
        lead={`Everyone registered under ${member.province} Province and already approved - never another province's, and never the platform's own register.`}
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          label="Registered here"
          value={formatNumber(register.length)}
          hint={`in ${member.province} Province`}
        />
        <MetricCard label="Active" value={counts("active")} />
        <MetricCard label="Dormant" value={counts("dormant")} goodWhen="down" />
        <MetricCard
          label="Suspended"
          value={counts("suspended")}
          goodWhen="down"
        />
      </div>

      <div className={CONSOLE.stack}>
        <Register
          columns={COLUMNS}
          caption={`Learners in ${member.province} Province`}
          items={items}
          searchPlaceholder="Search by name, email, district or organisation"
          filters={[
            { value: "all", label: "All", count: register.length },
            { value: "active", label: "Active", count: counts("active") },
            { value: "dormant", label: "Dormant", count: counts("dormant") },
            {
              value: "suspended",
              label: "Suspended",
              count: counts("suspended"),
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
          emptyMessage="No learner matches that."
        />
      </div>

      <PrototypeNote className="mt-6">
        This is the whole sample this prototype ships for {member.province}{" "}
        Province - not a page of a larger register the way the Super
        Administrator&rsquo;s own student list is.
      </PrototypeNote>
    </PageBody>
  );
}
