import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CertificateActions } from "@/components/student-portal/certificate-actions";
import { CertificateSheet } from "@/components/student-portal/certificate-sheet";
import {
  Badge,
  Callout,
  DefinitionList,
  PageBody,
  PageHeader,
  Panel,
  PersonTag,
  PrototypeNote,
} from "@/components/console/ui";
import { ConfirmAction } from "@/components/console/actions";
import { IfCan, LockedNote } from "@/components/console/permission";
import {
  CERTIFICATE_STATUS_LABEL,
  CERTIFICATE_STATUS_TONE,
} from "@/components/console/status";
import {
  certificateRegister,
  findCertificate,
  lectureLoad,
  managedModule,
  staffById,
  staffName,
  studentById,
} from "@/lib/admin";
import { formatDate, formatDateLong } from "@/lib/portal";
import { BODY, CONSOLE, EYEBROW, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";

type Params = { params: Promise<{ reference: string }> };

function moduleAdmin() {
  const member = staffById(SESSION["module-admin"]);
  if (!member) throw new Error("[module-admin] no session account");
  return member;
}

function ownCertificates() {
  const moduleIds = lectureLoad(moduleAdmin()).modules.map((mdl) => mdl.id);
  return certificateRegister().filter((record) => moduleIds.includes(record.moduleId));
}

export function generateStaticParams() {
  return ownCertificates().map((record) => ({ reference: record.reference }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { reference } = await params;
  const record = findCertificate(reference);
  if (!record) return { title: "Certificate not found" };

  return {
    title: `${record.reference} - ${record.moduleTitle}`,
    description: `Certificate issued to ${record.studentName} for ${record.moduleTitle}.`,
  };
}

/**
 * One certificate, from this account's own module. Same document as the
 * learner's own copy and the Super Administrator's oversight copy
 * (`<CertificateSheet>` is drawn once, everywhere) - only the aside differs,
 * and `notFound()` fires for a certificate outside this account's own
 * modules even though `generateStaticParams` never builds those ids.
 */
export default async function ModuleAdminCertificatePage({ params }: Params) {
  const { reference } = await params;
  const record = findCertificate(reference);
  const moduleIds = lectureLoad(moduleAdmin()).modules.map((mdl) => mdl.id);
  if (!record || !moduleIds.includes(record.moduleId)) notFound();

  const mdl = managedModule(record.moduleId);
  const revoked = record.status === "revoked";

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/module-admin/certificates", label: "Certificates" }}
        eyebrow="Certificate record"
        title={record.moduleTitle}
        lead={`Issued to ${record.studentName} on ${formatDate(record.issuedOn)}, carrying a reference anyone can check.`}
        meta={
          <Badge tone={CERTIFICATE_STATUS_TONE[record.status]}>
            {CERTIFICATE_STATUS_LABEL[record.status]}
          </Badge>
        }
      />

      {revoked ? (
        <div className={CONSOLE.stack}>
          <Callout title="This certificate was withdrawn">
            <p>{record.revoked?.reason}</p>
            <p className={`mt-2 ${META.base}`}>
              Withdrawn by {staffName(record.revoked?.by ?? "")} on{" "}
              {record.revoked ? formatDateLong(record.revoked.revokedOn) : ""}
            </p>
          </Callout>
        </div>
      ) : null}

      <div className={`${CONSOLE.stack} grid gap-10 lg:grid-cols-12`}>
        <div className="min-w-0 lg:col-span-8">
          <CertificateSheet
            name={record.studentName}
            moduleTitle={record.moduleTitle}
            reference={record.reference}
            issuedOn={record.issuedOn}
            lectures={mdl?.publishedLectures ?? 0}
            hours={mdl?.hours ?? 0}
          />

          <div className="mt-8">
            <CertificateActions reference={record.reference} />
          </div>
        </div>

        {/* ------------------------------------------------------ aside */}
        <aside className="lg:col-span-4">
          <div className="space-y-6">
            <Panel>
              <p className={EYEBROW.muted}>What this records</p>
              <DefinitionList
                className="mt-4"
                items={[
                  {
                    term: "Awarded to",
                    value: (() => {
                      const student = studentById(record.studentId);
                      return student ? (
                        <PersonTag
                          name={record.studentName}
                          avatarUrl={student.avatarUrl}
                          initials={student.initials}
                          size="xs"
                        />
                      ) : (
                        record.studentName
                      );
                    })(),
                  },
                  {
                    term: "Module",
                    value: mdl ? (
                      <Link
                        href={`/module-admin/modules/${record.moduleId}`}
                        className="link-wipe font-semibold text-primary"
                      >
                        {record.moduleTitle}
                      </Link>
                    ) : (
                      record.moduleTitle
                    ),
                  },
                  { term: "Level", value: mdl?.level ?? "-" },
                  {
                    term: "Lectures completed",
                    value: mdl ? `${mdl.publishedLectures} of ${mdl.publishedLectures}` : "-",
                  },
                  { term: "Material", value: mdl ? `${mdl.hours} hours` : "-" },
                  {
                    term: "Average quiz score",
                    value: record.score === null ? "-" : `${record.score}%`,
                  },
                  { term: "Issued", value: formatDate(record.issuedOn) },
                ]}
              />
            </Panel>

            <Panel>
              <p className={EYEBROW.muted}>Verification</p>
              <p className={`mt-4 ${BODY.base}`}>
                Anyone this certificate is shown to can check the reference
                against the same public register. It confirms the module,
                the date and the holder - and nothing else.
              </p>

              <p className="mt-5 rounded-sm border border-surface-deep bg-surface px-4 py-3 text-center font-display text-lg tracking-tight tabular-nums text-ink">
                {record.reference}
              </p>

              <Link
                href={`/verify/${record.reference}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-wipe mt-4 inline-block text-lg font-semibold text-primary"
              >
                Open the public verification page
              </Link>
            </Panel>

            <Panel>
              <p className={EYEBROW.muted}>Administration</p>
              {revoked ? (
                <p className={`mt-3 ${BODY.base}`}>
                  This reference no longer verifies. A withdrawal cannot be
                  undone - {record.studentName} would need to earn{" "}
                  {record.moduleTitle} again for a new certificate to issue.
                </p>
              ) : (
                <>
                  <p className={`mt-3 ${BODY.base}`}>
                    For duplicates, an account created in someone else&rsquo;s
                    name, or the rare case where the completion itself was
                    not genuine. {record.studentName} is told, the reference
                    stops verifying, and the reason stays on the record.
                  </p>

                  <div className="mt-6">
                    <IfCan
                      capability="manageCertificates"
                      fallback={<LockedNote capability="manageCertificates" />}
                    >
                      <ConfirmAction
                        label="Withdraw this certificate"
                        question={`Withdraw ${record.reference} from the register?`}
                        detail={`In the finished platform this asks for a reason, then stops ${record.reference} verifying and notifies ${record.studentName}. It cannot be undone - a withdrawn certificate is reissued as a new one.`}
                        confirmLabel="Continue"
                        done="Prototype - nothing was withdrawn."
                      />
                    </IfCan>
                  </div>
                </>
              )}
            </Panel>
          </div>
        </aside>
      </div>

      <PrototypeNote className="mt-8" />
    </PageBody>
  );
}
