import type { ReactNode } from "react";
import { CertificateSheet } from "@/components/student-portal/certificate-sheet";
import { DefinitionList, Panel } from "@/components/student-portal/ui";
import { CheckIcon, CloseIcon } from "@/components/student-portal/icons";
import type { CertificateRecord } from "@/lib/admin";
import { formatDate, formatDateLong } from "@/lib/portal";
import { BRAND } from "@/lib/brand";
import { BODY, EYEBROW } from "@/lib/theme";

export type VerifyOutcome =
  | { status: "valid"; record: CertificateRecord; level: string; lectures: number; hours: number }
  | { status: "revoked"; record: CertificateRecord }
  | { status: "not-found"; reference: string };

const BANNER = {
  valid: "border-primary/25 bg-tint-mist text-primary",
  revoked: "border-clay/25 bg-clay-pale text-clay",
  "not-found": "border-clay/25 bg-clay-pale text-clay",
} as const;

function Banner({
  tone,
  title,
  children,
}: {
  tone: keyof typeof BANNER;
  title: string;
  children: ReactNode;
}) {
  const Icon = tone === "valid" ? CheckIcon : CloseIcon;
  return (
    <div className={`flex items-start gap-4 rounded-sm border px-6 py-5 ${BANNER[tone]}`}>
      <Icon className="mt-0.5 size-6 shrink-0" />
      <div>
        <p className="font-display text-xl tracking-tight">{title}</p>
        <p className={`mt-1.5 ${BODY.base}`}>{children}</p>
      </div>
    </div>
  );
}

/**
 * What `/verify` shows once a reference has been looked up.
 *
 * Three outcomes, not two - a certificate can be genuine, genuinely
 * withdrawn, or never have existed at all, and those are different things to
 * tell a stranger checking one:
 *
 *   - VALID renders the actual `<CertificateSheet>`, the same document the
 *     learner sees in their own portal. Anyone checking a certificate is
 *     checking it against something, and a page that just prints "yes, this
 *     is real" in text asks them to take that on faith instead.
 *   - REVOKED is not rendered as the certificate, on purpose - the sheet has
 *     no way to say "withdrawn" on its own face, so showing it at full
 *     fidelity for a certificate that no longer counts would be the one
 *     actively misleading thing this page could do. It still says what the
 *     certificate WAS, because a withdrawal is not the same claim as a
 *     certificate never having existed.
 *   - NOT FOUND is the honest failure case the client asked for by name:
 *     nothing here claims to be more certain than "no such reference", which
 *     is also what a typo, a photocopied fake and a reference for a
 *     different platform entirely all look like from this side.
 */
export function VerifyResult({ outcome }: { outcome: VerifyOutcome }) {
  if (outcome.status === "not-found") {
    return (
      <Banner tone="not-found" title="No certificate matches this reference.">
        &ldquo;{outcome.reference}&rdquo; was not issued by {BRAND.name}{" "}
        {BRAND.suffix}. Check it against spelling and spacing on the original
        document, or write to{" "}
        <a href={`mailto:${BRAND.email}`} className="link-wipe font-semibold">
          {BRAND.email}
        </a>{" "}
        if you believe this is a mistake.
      </Banner>
    );
  }

  const { record } = outcome;

  if (outcome.status === "revoked") {
    return (
      <div className="space-y-6">
        <Banner tone="revoked" title="This certificate has been withdrawn.">
          It was issued, then withdrawn on{" "}
          {record.revoked ? formatDateLong(record.revoked.revokedOn) : ""} -
          it no longer verifies.
        </Banner>

        <Panel>
          <p className={EYEBROW.muted}>What was issued</p>
          <DefinitionList
            className="mt-4"
            items={[
              { term: "Reference", value: record.reference },
              { term: "Issued to", value: record.studentName },
              { term: "Module", value: record.moduleTitle },
              { term: "Originally issued", value: formatDate(record.issuedOn) },
              {
                term: "Withdrawn",
                value: record.revoked ? formatDate(record.revoked.revokedOn) : "-",
              },
              { term: "Reason", value: record.revoked?.reason ?? "-" },
            ]}
          />
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Banner tone="valid" title="This certificate is valid.">
        Issued by {BRAND.name} {BRAND.suffix} and currently in good standing.
      </Banner>

      <CertificateSheet
        name={record.studentName}
        moduleTitle={record.moduleTitle}
        reference={record.reference}
        issuedOn={record.issuedOn}
        lectures={outcome.lectures}
        hours={outcome.hours}
      />

      <Panel>
        <p className={EYEBROW.muted}>What this records</p>
        <DefinitionList
          className="mt-4"
          items={[
            { term: "Reference", value: record.reference },
            { term: "Awarded to", value: record.studentName },
            { term: "Module", value: record.moduleTitle },
            { term: "Level", value: outcome.level },
            {
              term: "Score",
              value: record.score === null ? "-" : `${record.score}%`,
            },
            { term: "Issued", value: formatDate(record.issuedOn) },
          ]}
        />
      </Panel>
    </div>
  );
}
