import type { Metadata } from "next";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import {
  certificateRegister,
  formatNumber,
  lectureLoad,
  staffById,
  staffName,
  studentById,
} from "@/lib/admin";
import { formatDate, formatDateLong } from "@/lib/portal";
import {
  Badge,
  Callout,
  Cell,
  MetricCard,
  NameCell,
  PageBody,
  PageHeader,
  Panel,
  PersonTag,
  PrototypeNote,
  Row,
  Section,
  type Column,
} from "@/components/console/ui";
import { Register, type RegisterItem } from "@/components/console/register";
import {
  CERTIFICATE_STATUS_LABEL,
  CERTIFICATE_STATUS_TONE,
} from "@/components/console/status";

export const metadata: Metadata = { title: "Certificates" };

const COLUMNS: Column[] = [
  { key: "reference", head: "Reference" },
  { key: "learner", head: "Learner" },
  { key: "module", head: "Module", hideBelow: "lg" },
  { key: "score", head: "Score", numeric: true, hideBelow: "sm" },
  { key: "issued", head: "Issued", numeric: true, hideBelow: "md" },
  { key: "status", head: "Status" },
];

/**
 * Certificates given for this account's own module(s) only - the same
 * register `/admin/certificates` keeps platform-wide, narrowed. Withdrawing
 * one (FR-MODADM-070) happens on that certificate's own page, reached from
 * its reference column here, exactly like the platform-wide register.
 */
export default function ModuleAdminCertificatesPage() {
  const member = staffById(SESSION["module-admin"]);
  if (!member) throw new Error("[module-admin] no session account");

  const load = lectureLoad(member);
  const moduleIds = load.modules.map((mdl) => mdl.id);
  const register = certificateRegister().filter((record) =>
    moduleIds.includes(record.moduleId),
  );
  const revoked = register.filter((record) => record.status === "revoked");

  const items: RegisterItem[] = register.map((record) => {
    const student = studentById(record.studentId);
    const item: RegisterItem = {
      id: record.reference,
      text: [record.reference, record.studentName, record.moduleTitle]
        .join(" ")
        .toLowerCase(),
      tags: [record.status, record.moduleId],
      row: (
        <Row href={`/module-admin/certificates/${record.reference}`}>
          <NameCell
            href={`/module-admin/certificates/${record.reference}`}
            title={record.reference}
          />
          <Cell>
            {student ? (
              <PersonTag
                name={record.studentName}
                avatarUrl={student.avatarUrl}
                initials={student.initials}
                size="xs"
              />
            ) : (
              record.studentName
            )}
          </Cell>
          <Cell hideBelow="lg">{record.moduleTitle}</Cell>
          <Cell numeric hideBelow="sm">
            {record.score === null ? "-" : `${record.score}%`}
          </Cell>
          <Cell numeric hideBelow="md">
            {formatDate(record.issuedOn)}
          </Cell>
          <Cell>
            <Badge tone={CERTIFICATE_STATUS_TONE[record.status]}>
              {CERTIFICATE_STATUS_LABEL[record.status]}
            </Badge>
          </Cell>
        </Row>
      ),
    };
    return item;
  });

  return (
    <PageBody>
      <PageHeader
        eyebrow="My modules"
        title="Certificates"
        lead="Issued automatically the moment a learner finishes every lecture and passes every quiz on one of your modules. Each carries a reference anybody can check."
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          label="Issued"
          value={formatNumber(register.length)}
          hint="across your modules"
        />
        <MetricCard
          label="Withdrawn"
          value={revoked.length}
          hint="recorded with a reason"
          goodWhen="down"
        />
        <MetricCard
          label="Valid"
          value={register.length - revoked.length}
          hint="still verifying"
        />
      </div>

      <div className={CONSOLE.stack}>
        <Register
          columns={COLUMNS}
          caption="Certificates issued for your modules"
          items={items}
          searchPlaceholder="Search by reference or learner"
          filters={[
            { value: "all", label: "All", count: register.length },
            {
              value: "issued",
              label: "Valid",
              count: register.length - revoked.length,
            },
            { value: "revoked", label: "Withdrawn", count: revoked.length },
          ]}
          emptyMessage="No certificate matches that."
        />
      </div>

      {revoked.length ? (
        <Section
          title="Withdrawn certificates"
          description="Every withdrawal keeps its reason. A reference is never reused."
          className={CONSOLE.stack}
        >
          <ul className="space-y-3">
            {revoked.map((record) => (
              <li key={record.reference}>
                <Callout title={`${record.reference} · ${record.studentName}`}>
                  <p>{record.revoked?.reason}</p>
                  <p className={`mt-2 ${META.base}`}>
                    Withdrawn by {staffName(record.revoked?.by ?? "")} on{" "}
                    {record.revoked ? formatDateLong(record.revoked.revokedOn) : ""}
                  </p>
                </Callout>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Panel className="mt-6">
        <h2 className="font-display text-2xl tracking-tight text-ink">
          Why there is no &ldquo;issue a certificate&rdquo; button
        </h2>
        <p className={`mt-3 ${BODY.base}`}>
          A certificate here means one thing: every lecture finished and every
          quiz passed. The moment it can also mean &ldquo;a module
          administrator decided so&rdquo;, it stops being checkable, and every
          certificate already issued is worth a little less. Completion issues
          it; nobody grants it.
        </p>
      </Panel>

      <PrototypeNote className="mt-6" />
    </PageBody>
  );
}
