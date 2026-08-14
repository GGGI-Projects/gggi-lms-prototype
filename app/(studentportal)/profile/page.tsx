import type { Metadata } from "next";
import Link from "next/link";
import { ProfileForm } from "@/components/student-portal/account-forms";
import { Avatar } from "@/components/student-portal/portal-shell";
import {
  DefinitionList,
  PageBody,
  PageHeader,
  Panel,
} from "@/components/student-portal/ui";
import { ArrowRightIcon, CertificateIcon } from "@/components/student-portal/icons";
import { CERTIFICATES, LEARNER } from "@/content/portal";
import { formatDate, learnerTotals, progressFor } from "@/lib/portal";
import { BODY, EYEBROW, META } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your details, and the name that goes on your certificates.",
};

/**
 * The account, as the learner sees it.
 *
 * SPLIT FROM SETTINGS on purpose. This page is about who you are - the name
 * that goes on a certificate, where you work, how to reach you. Settings is
 * about how the platform behaves. Merged into one page, the field that decides
 * what is printed on a credential ends up three scroll-lengths below a
 * notification switch.
 *
 * Every field on the right-hand summary is derived, never editable: progress
 * is a fact about what happened, not a preference.
 */
export default function ProfilePage() {
  const totals = learnerTotals();

  return (
    <PageBody>
      <PageHeader
        eyebrow="Profile"
        title="Your details"
        lead="Only three of these are used by the platform at all - your name, your email address and the name that goes on a certificate. The rest is optional and only tells us which programmes to build next."
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <div className="flex items-center gap-5 border-b border-surface-deep pb-8">
            <Avatar className="size-16 text-2xl" />
            <div className="min-w-0">
              <p className="font-display text-2xl leading-snug tracking-tight text-ink">
                {LEARNER.name}
              </p>
              <p className={`mt-1 ${META.base}`}>
                {LEARNER.role} · {LEARNER.organisation}
              </p>
            </div>
          </div>

          <div className="mt-10">
            <ProfileForm />
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="space-y-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <Panel>
              <p className={EYEBROW.muted}>Your learning</p>
              <DefinitionList
                className="mt-4"
                items={[
                  { term: "Member since", value: formatDate(LEARNER.joined) },
                  { term: "Programmes enrolled", value: totals.programmes },
                  { term: "Modules completed", value: totals.modulesCompleted },
                  { term: "Time studied", value: `${totals.hours}h` },
                  { term: "Certificates", value: totals.certificates },
                ]}
              />
            </Panel>

            {CERTIFICATES.length ? (
              <Panel>
                <p className={EYEBROW.muted}>Certificates</p>
                <ul className="mt-4 space-y-3">
                  {CERTIFICATES.map((certificate) => {
                    const programme = progressFor(
                      certificate.programmeId,
                    )?.programme;

                    return (
                      <li key={certificate.id}>
                        <Link
                          href={`/certificates/${certificate.id}`}
                          className="group flex items-start gap-3.5"
                        >
                          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-accent-pale text-accent-strong">
                            <CertificateIcon className="size-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold leading-snug text-ink">
                              {programme?.title}
                            </span>
                            <span className={`mt-0.5 block ${META.base}`}>
                              {certificate.reference}
                            </span>
                          </span>
                          <ArrowRightIcon className="mt-2 size-4 shrink-0 text-muted transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            ) : null}

            <Panel>
              <p className={EYEBROW.muted}>What we hold</p>
              <p className={`mt-4 ${BODY.base}`}>
                An email address, a name, and what you have completed. No
                identity number, no phone number, and nothing about you is
                shared with the organisations behind the programmes.
              </p>
              <Link
                href="/settings"
                className="link-wipe mt-4 inline-flex items-center gap-2 text-lg font-semibold text-primary"
              >
                Notification and account settings
                <ArrowRightIcon className="size-4" />
              </Link>
            </Panel>
          </div>
        </aside>
      </div>
    </PageBody>
  );
}
