import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeader } from "@/components/auth/auth-header";
import { PageBody, PageHeader } from "@/components/student-portal/ui";
import { VerifyForm } from "@/components/verify/verify-form";
import { VerifyResult, type VerifyOutcome } from "@/components/verify/verify-result";
import { findCertificate, managedModule } from "@/lib/admin";
import { BRAND } from "@/lib/brand";
import { META } from "@/lib/theme";

type Params = { params: Promise<{ reference?: string[] }> };

/** A demo of each outcome, for someone reading this without a certificate or
 *  a QR scanner in front of them - see the note on the page below. */
const DEMO_VALID = "GP-2026-PA-04817";
const DEMO_INVALID = "GP-2026-ZZ-00000";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { reference } = await params;
  const ref = reference?.[0];
  return {
    title: ref ? `Verify ${ref}` : "Verify a certificate",
    description: `Check whether a ${BRAND.name} ${BRAND.suffix} certificate reference is genuine, in public, without an account.`,
  };
}

/**
 * The page a certificate's QR code points at - see `lib/qr.ts`, unchanged by
 * this feature. It also stands on its own: the input below is for everyone
 * who was handed a certificate on paper, in a screenshot, or read out over
 * the phone, none of which come with a camera pointed at a code.
 *
 * NO SIGN-IN, deliberately. A credential that only verifies to people who
 * already have an account on this platform verifies to nobody who actually
 * needs it - an employer, a funder, a colleague checking a CV.
 *
 * The route is an OPTIONAL CATCH-ALL (`[[...reference]]`) rather than the
 * usual `generateStaticParams` pattern the rest of the app follows for
 * dynamic pages: those enumerate a fixed, known set of ids because that is
 * everything a demo visitor could ever ask for. This page exists specifically
 * to answer references NOBODY enumerated in advance - typos, fakes, someone
 * else's platform entirely - so pre-rendering a fixed list would be pointless
 * for the one case ("does this exist at all?") the page is for.
 */
export default async function VerifyPage({ params }: Params) {
  const { reference } = await params;
  const raw = reference?.[0]?.trim() ?? "";

  let outcome: VerifyOutcome | undefined;
  if (raw) {
    const record = findCertificate(raw);
    if (!record) {
      outcome = { status: "not-found", reference: raw };
    } else if (record.status === "revoked") {
      outcome = { status: "revoked", record };
    } else {
      const mdl = managedModule(record.moduleId);
      outcome = {
        status: "valid",
        record,
        level: mdl?.level ?? "-",
        lectures: mdl?.publishedLectures ?? 0,
        hours: mdl?.hours ?? 0,
      };
    }
  }

  return (
    <div className="flex flex-1 flex-col [--header-h:4.25rem]">
      <AuthHeader
        alt={{
          prompt: "Looking for the platform?",
          label: `Go to ${BRAND.name}`,
          href: "/",
        }}
      />

      <main className="flex-1">
        <PageBody>
          <PageHeader
            eyebrow="Certificate verification"
            title="Check a certificate"
            lead={`Every certificate ${BRAND.name} ${BRAND.suffix} issues carries a reference that checks here - in public, instantly, without an account.`}
          />

          <div className="mt-10 max-w-xl">
            <VerifyForm defaultValue={raw} />
            <p className={`mt-4 ${META.base}`}>
              Nothing to check yet? See{" "}
              <Link
                href={`/verify/${DEMO_VALID}`}
                className="link-wipe font-semibold text-primary"
              >
                a valid certificate
              </Link>{" "}
              or{" "}
              <Link
                href={`/verify/${DEMO_INVALID}`}
                className="link-wipe font-semibold text-primary"
              >
                a reference that doesn&rsquo;t exist
              </Link>
              .
            </p>
          </div>

          {outcome ? (
            <div className="mt-12 max-w-3xl">
              <VerifyResult outcome={outcome} />
            </div>
          ) : null}
        </PageBody>
      </main>
    </div>
  );
}
