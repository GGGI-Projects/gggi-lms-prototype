import type { Metadata } from "next";
import { CONSOLE, META } from "@/lib/theme";
import { PLATFORM } from "@/content/operations";
import { formatNumber, publishedModules, students, summarise } from "@/lib/admin";
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

export const metadata: Metadata = { title: "Students" };

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
 * The learner register.
 *
 * ONE SCREEN, ONE JOB: find a person. Everything else an administrator might
 * want to know about learners is on the dashboard, in aggregate, where it
 * belongs - a register that also tries to be an analytics page ends up being
 * neither, and the search box gets pushed below the fold by a chart.
 *
 * The rows are built here, on the server, and handed to `<Register>` finished.
 * See the note in that file for why the filtering happens in the browser and
 * the joining does not.
 */
export default function StudentsPage() {
  const register = students();

  const items: RegisterItem[] = register.map((student) => {
    const summary = summarise(student);

    return {
      id: student.id,
      // Everything the search box should match, lowercased once here rather
      // than on every keystroke.
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
        <Row href={`/admin/students/${student.id}`}>
          <NameCell
            href={`/admin/students/${student.id}`}
            initials={student.initials}
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
        eyebrow="People"
        title="Students"
        lead={`Everyone registered on the platform. This prototype ships the most recent ${register.length} records of ${formatNumber(PLATFORM.learners)}.`}
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          label="Registered"
          value={formatNumber(PLATFORM.learners)}
          hint="since the platform opened"
        />
        <MetricCard
          label="Active in 30 days"
          value={formatNumber(PLATFORM.activeLearners)}
          hint={`${Math.round((PLATFORM.activeLearners / PLATFORM.learners) * 100)}% of the register`}
        />
        <MetricCard
          label="Holding a certificate"
          value={formatNumber(PLATFORM.certificates)}
          hint="one per completed module"
        />
        <MetricCard
          label="Suspended"
          value={counts("suspended")}
          hint="in this sample"
          goodWhen="down"
        />
      </div>

      <div className={CONSOLE.stack}>
        <Register
          columns={COLUMNS}
          caption="Registered learners"
          items={items}
          searchPlaceholder="Search by name, email, district or organisation"
          total={PLATFORM.learners}
          footNote="the rest of the register is not in this prototype"
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
        Searching and filtering work on the sample above. In the finished
        platform both are queries against the whole register.
      </PrototypeNote>
    </PageBody>
  );
}
