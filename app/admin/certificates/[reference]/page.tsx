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
  managedModule,
  staffName,
} from "@/lib/admin";
import { formatDate, formatDateLong } from "@/lib/portal";
import { BODY, CONSOLE, EYEBROW, META } from "@/lib/theme";

type Params = { params: Promise<{ reference: string }> };

export function generateStaticParams() {
  return certificateRegister().map((record) => ({ reference: record.reference }));
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
 * One certificate, from the register - what a learner clicking through to
 * their own copy of this see, plus the one thing their copy correctly does
 * not have: the power to withdraw it.
 *
 * THE SAME DOCUMENT, NOT A REBUILT ONE. `<CertificateSheet>` is drawn once
 * and shown here unchanged, for the reason given on that component itself -
 * a credential that looks different depending on who is looking at it is
 * not a credential. Everything on this page that differs from the learner's
 * own `/certificates/[id]` lives in the aside: the administration panel,
 * and the withdrawn banner when there is one.
 *
 * REACHED FROM THE REGISTER'S OWN REFERENCE COLUMN, not from a student's
 * record - see `/admin/certificates`, where the reference cell links here
 * and the learner's own name cell still links to their record. A
 * certificate and the person who holds it are two different things an
 * administrator might be looking for.
 */
export default async function AdminCertificatePage({ params }: Params) {
  const { reference } = await params;
  const record = findCertificate(reference);
  if (!record) notFound();

  const mdl = managedModule(record.moduleId);
  const revoked = record.status === "revoked";

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/admin/certificates", label: "Certificates" }}
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
                    value: (
                      <Link
                        href={`/admin/students/${record.studentId}`}
                        className="link-wipe font-semibold text-primary"
                      >
                        {record.studentName}
                      </Link>
                    ),
                  },
                  {
                    term: "Module",
                    value: mdl ? (
                      <Link
                        href={`/admin/modules/${record.moduleId}`}
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
