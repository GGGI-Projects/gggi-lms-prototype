import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CertificateActions } from "@/components/student-portal/certificate-actions";
import { CertificateSheet } from "@/components/student-portal/certificate-sheet";
import { ReviewForm } from "@/components/student-portal/review-form";
import {
  DefinitionList,
  PageBody,
  PageHeader,
  Panel,
} from "@/components/student-portal/ui";
import { CheckIcon } from "@/components/student-portal/icons";
import { CERTIFICATES, LEARNER } from "@/content/portal";
import {
  formatDate,
  formatDuration,
  getCertificate,
  progressFor,
} from "@/lib/portal";
import { BODY, EYEBROW, META } from "@/lib/theme";

type Params = { params: Promise<{ certificateId: string }> };

export function generateStaticParams() {
  return CERTIFICATES.map((certificate) => ({ certificateId: certificate.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { certificateId } = await params;
  const certificate = getCertificate(certificateId);
  if (!certificate) return { title: "Certificate not found" };

  const programme = progressFor(certificate.programmeId)?.programme;
  return {
    title: `Certificate - ${programme?.title ?? certificate.reference}`,
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
 */
export default async function CertificatePage({ params }: Params) {
  const { certificateId } = await params;
  const certificate = getCertificate(certificateId);
  const progress = certificate
    ? progressFor(certificate.programmeId)
    : undefined;

  if (!certificate || !progress) notFound();

  const { programme, modules } = progress;
  const hours = Math.round((progress.minutesTotal / 60) * 10) / 10;

  return (
    <PageBody>
      <PageHeader
        back={{ href: "/certificates", label: "All certificates" }}
        eyebrow="Certificate of completion"
        title={programme.title}
        lead={`Issued to ${LEARNER.certificateName} on ${formatDate(certificate.issuedOn)}, carrying a reference anyone can check.`}
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <CertificateSheet
            name={LEARNER.certificateName}
            programmeTitle={programme.title}
            reference={certificate.reference}
            issuedOn={certificate.issuedOn}
            modules={modules.length}
            hours={hours}
          />

          <div className="mt-8">
            <CertificateActions reference={certificate.reference} />
          </div>

          <div className="mt-8">
            <Panel>
              <ReviewForm programmeTitle={programme.title} />
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
                  { term: "Programme", value: programme.title },
                  { term: "Level", value: programme.level },
                  { term: "Modules completed", value: `${modules.length} of ${modules.length}` },
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
                register. It confirms the programme, the date and the holder -
                and nothing else about you.
              </p>

              {/* The reference set apart from the prose, because this is the
                  string a person will read out or paste somewhere. */}
              <p className="mt-5 rounded-sm border border-surface-deep bg-surface px-4 py-3 text-center font-display text-lg tracking-tight tabular-nums text-ink">
                {certificate.reference}
              </p>

              <ul className="mt-5 space-y-2.5">
                {[
                  "Valid permanently - it does not expire",
                  "One per programme completed",
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
