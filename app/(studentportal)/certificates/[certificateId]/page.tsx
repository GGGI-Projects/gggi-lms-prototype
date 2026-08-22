import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CertificateActions } from "@/components/student-portal/certificate-actions";
import { CertificateSheet } from "@/components/student-portal/certificate-sheet";
import { ReviewForm } from "@/components/student-portal/review-form";
import {
  Badge,
  DefinitionList,
  PageBody,
  PageHeader,
  Panel,
} from "@/components/student-portal/ui";
import { CheckIcon } from "@/components/student-portal/icons";
import { CERTIFICATES, LEARNER } from "@/content/portal";
import {
  formatDate,
  formatDateLong,
  formatDuration,
  getCertificate,
  progressFor,
} from "@/lib/portal";
// The one place this portal reads from the console's own data layer - see
// the note on `record` below for why a certificate's live status has to
// come from there.
import { findCertificate, staffName } from "@/lib/admin";
import {
  CERTIFICATE_STATUS_LABEL,
  CERTIFICATE_STATUS_TONE,
} from "@/components/console/status";
import { BODY, EYEBROW, META } from "@/lib/theme";

type Params = { params: Promise<{ certificateId: string }> };

export function generateStaticParams() {
  return CERTIFICATES.map((certificate) => ({ certificateId: certificate.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { certificateId } = await params;
  const certificate = getCertificate(certificateId);
  if (!certificate) return { title: "Certificate not found" };

  const mdl = progressFor(certificate.moduleId)?.module;
  return {
    title: `Certificate - ${mdl?.title ?? certificate.reference}`,
    description: `Certificate ${certificate.reference}, issued to ${LEARNER.certificateName}.`,
  };
}

/**
 * One certificate.
 *
 * The document is the page, so it gets the wide column and everything else
 * sits beside it. The panel on the right is not decoration: a credential is
 * only worth what somebody else can verify, so the reference and how to check
 * it are given the same weight as the certificate itself.
 *
 * The name on the sheet is `certificateName`, not the name in the greeting.
 * They are different fields on purpose - a certificate carries the name that
 * matches an identity document, and the portal says hello using the name a
 * person goes by.
 *
 * SHOWS ITS CURRENT STATE, same as `/admin/certificates/[reference]` - a
 * learner should never have to email support to find out their certificate
 * was withdrawn; the page they'd open to show it off is exactly where that
 * belongs. `content/portal.ts`'s own `CERTIFICATES` carries no status at
 * all - a certificate is issued once and never edited there - so whether
 * this one still verifies is looked up from `findCertificate()` in
 * `lib/admin.ts`, the same withdrawal record the console reads, rather than
 * duplicated here where it could disagree.
 */
export default async function CertificatePage({ params }: Params) {
  const { certificateId } = await params;
  const certificate = getCertificate(certificateId);
  const progress = certificate
    ? progressFor(certificate.moduleId)
    : undefined;

  if (!certificate || !progress) notFound();

  const { module: mdl, lectures } = progress;
  const hours = Math.round((progress.minutesTotal / 60) * 10) / 10;
  const record = findCertificate(certificate.reference);
  const revoked = record?.status === "revoked";

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/certificates", label: "All certificates" }}
        eyebrow="Certificate of completion"
        title={mdl.title}
        lead={`Issued to ${LEARNER.certificateName} on ${formatDate(certificate.issuedOn)}, carrying a reference anyone can check.`}
      />

      {record ? (
        <div className="mt-6">
          <Badge tone={CERTIFICATE_STATUS_TONE[record.status]}>
            {CERTIFICATE_STATUS_LABEL[record.status]}
          </Badge>
        </div>
      ) : null}

      {revoked ? (
        <div className="mt-6 rounded-sm border border-clay/30 bg-clay-pale/50 p-6 sm:p-8">
          <p className={`${EYEBROW.muted} text-clay`}>
            This certificate was withdrawn
          </p>
          <p className={`mt-3 ${BODY.base}`}>{record?.revoked?.reason}</p>
          <p className={`mt-2 ${META.base}`}>
            Withdrawn by {staffName(record?.revoked?.by ?? "")} on{" "}
            {record?.revoked ? formatDateLong(record.revoked.revokedOn) : ""}
            . The reference below no longer verifies.
          </p>
        </div>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <CertificateSheet
            name={LEARNER.certificateName}
            moduleTitle={mdl.title}
            reference={certificate.reference}
            issuedOn={certificate.issuedOn}
            lectures={lectures.length}
            hours={hours}
          />

          <div className="mt-8">
            <CertificateActions reference={certificate.reference} />
          </div>

          {/* `id` + `scroll-mt` so the completed module page's "Leave a
              review" button can link straight here with `#review` and land
              below the sticky header rather than under it. */}
          <div id="review" className="mt-8 scroll-mt-[calc(var(--header-h)+1.5rem)]">
            <Panel>
              <ReviewForm moduleTitle={mdl.title} />
            </Panel>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="space-y-6">
            <Panel>
              <p className={EYEBROW.muted}>What this records</p>
              <DefinitionList
                className="mt-4"
                items={[
                  { term: "Awarded to", value: LEARNER.certificateName },
                  { term: "Module", value: mdl.title },
                  { term: "Level", value: mdl.level },
                  { term: "Lectures completed", value: `${lectures.length} of ${lectures.length}` },
                  {
                    term: "Material",
                    value: formatDuration(progress.minutesTotal),
                  },
                  {
                    term: "Average quiz score",
                    value: `${certificate.averageScore}%`,
                  },
                  { term: "Issued", value: formatDate(certificate.issuedOn) },
                ]}
              />
            </Panel>

            <Panel>
              <p className={EYEBROW.muted}>Verification</p>
              <p className={`mt-4 ${BODY.base}`}>
                Anyone you show this to can check the reference against the
                register. It confirms the module, the date and the holder -
                and nothing else about you.
              </p>

              {/* The reference set apart from the prose, because this is the
                  string a person will read out or paste somewhere. */}
              <p className="mt-5 rounded-sm border border-surface-deep bg-surface px-4 py-3 text-center font-display text-lg tracking-tight tabular-nums text-ink">
                {certificate.reference}
              </p>

              {/* Opens in a new tab, deliberately - this is the public page
                  itself, not a preview of it, and it should not cost the
                  learner their place in their own portal to look at it. */}
              <Link
                href={`/verify/${certificate.reference}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-wipe mt-4 inline-block text-lg font-semibold text-primary"
              >
                See what this looks like when checked
              </Link>

              <ul className="mt-5 space-y-2.5">
                {[
                  "Valid permanently - it does not expire",
                  "One per module completed",
                  "Re-downloadable whenever you need it",
                ].map((line) => (
                  <li key={line} className={`flex items-start gap-3 ${META.base}`}>
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                    {line}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </aside>
      </div>
    </PageBody>
  );
}
