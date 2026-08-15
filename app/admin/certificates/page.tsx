import type { Metadata } from "next";
import Link from "next/link";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { PLATFORM } from "@/content/operations";
import { certificateRegister, formatNumber, staffName } from "@/lib/admin";
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
  PrototypeNote,
  Row,
  Section,
  type Column,
} from "@/components/console/ui";
import { Register, type RegisterItem } from "@/components/console/register";
import { ConfirmAction } from "@/components/console/actions";
import { IfCan, LockedNote } from "@/components/console/permission";
import {
  CERTIFICATE_STATUS_LABEL,
  CERTIFICATE_STATUS_TONE,
} from "@/components/console/status";
import { PLATFORM_SETTINGS } from "@/content/operations";

export const metadata: Metadata = { title: "Certificates" };

const COLUMNS: Column[] = [
  { key: "reference", head: "Reference" },
  { key: "learner", head: "Learner" },
  { key: "programme", head: "Programme", hideBelow: "lg" },
  { key: "score", head: "Score", numeric: true, hideBelow: "sm" },
  { key: "issued", head: "Issued", numeric: true, hideBelow: "md" },
  { key: "status", head: "Status" },
];

/**
 * The certificate register.
 *
 * Certificates are NOT CREATED HERE, and the page says so rather than offering
 * an "Issue certificate" button that would quietly undermine the whole thing.
 * A certificate on this platform means one thing: somebody finished every
 * module and passed every quiz. The moment an administrator can grant one by
 * hand, it means "somebody finished, or somebody was owed a favour", and every
 * certificate already issued is worth less.
 *
 * What an administrator CAN do is withdraw one, and that is deliberately heavy
 * - it asks for a reason, and the reason stays on the record for good.
 */
export default function CertificatesPage() {
  const register = certificateRegister();
  const revoked = register.filter((record) => record.status === "revoked");

  const items: RegisterItem[] = register.map((record) => ({
    id: record.reference,
    text: [record.reference, record.studentName, record.programmeTitle]
      .join(" ")
      .toLowerCase(),
    tags: [record.status],
    row: (
      <Row href={`/admin/students/${record.studentId}`}>
        <Cell className="font-display font-bold tracking-tight text-ink tabular-nums">
          {record.reference}
        </Cell>
        <NameCell
          href={`/admin/students/${record.studentId}`}
          title={record.studentName}
        />
        <Cell hideBelow="lg">{record.programmeTitle}</Cell>
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
  }));

  return (
    <PageBody>
      <PageHeader
        eyebrow="Learning"
        title="Certificates"
        lead={`Issued automatically the moment a learner finishes every module and passes every quiz at ${PLATFORM_SETTINGS.certificates.passMark}%. Each carries a reference anybody can check.`}
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard
          label="Issued"
          value={formatNumber(PLATFORM.certificates)}
          hint="since the platform opened"
        />
        <MetricCard
          label="Withdrawn"
          value={PLATFORM.revoked}
          hint="recorded with a reason"
          goodWhen="down"
        />
        <MetricCard
          label="Completion rate"
          value={`${PLATFORM.completionRate}%`}
          hint="of all enrolments"
        />
        <MetricCard
          label="Reference prefix"
          value={PLATFORM_SETTINGS.certificates.referencePrefix}
          hint="set in platform settings"
        />
      </div>

      <div className={CONSOLE.stack}>
        <Register
          columns={COLUMNS}
          caption="Certificates issued"
          items={items}
          searchPlaceholder="Search by reference, learner or programme"
          total={PLATFORM.certificates}
          footNote="the rest of the register is not in this prototype"
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

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-2`}>
        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Why there is no &ldquo;issue a certificate&rdquo; button
          </h2>
          <p className={`mt-3 ${BODY.base}`}>
            A certificate here means one thing: every module finished and every
            quiz passed. The moment it can also mean &ldquo;an administrator
            decided so&rdquo;, it stops being checkable, and every certificate
            already issued is worth a little less. Completion issues it;
            nobody grants it.
          </p>
          <p className={`mt-3 ${BODY.base}`}>
            If somebody has genuinely finished and the platform disagrees, that
            is a bug in their progress record - fix that, and the certificate
            follows.
          </p>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Withdraw a certificate
          </h2>
          <p className={`mt-3 ${BODY.base}`}>
            For duplicates, accounts created in someone else&rsquo;s name, and
            the rare case where the completion itself was not genuine. The
            learner is told, the reference stops verifying, and the reason stays
            on the record.
          </p>

          <div className="mt-6">
            <IfCan
              capability="manageCertificates"
              fallback={<LockedNote capability="manageCertificates" />}
            >
              <ConfirmAction
                label="Withdraw a certificate"
                question="Withdraw a certificate from the register?"
                detail="In the finished platform this asks for the reference and a reason, then stops that reference verifying. It cannot be undone - a withdrawn certificate is reissued as a new one."
                confirmLabel="Continue"
                done="Prototype - nothing was withdrawn."
              />
            </IfCan>
          </div>

          <Link
            href="/admin/settings"
            className="mt-6 inline-block link-wipe text-lg font-semibold text-primary"
          >
            Certificate settings
          </Link>
        </Panel>
      </div>

      <PrototypeNote className="mt-6" />
    </PageBody>
  );
}
