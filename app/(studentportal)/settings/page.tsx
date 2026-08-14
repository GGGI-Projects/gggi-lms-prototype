import type { Metadata } from "next";
import Link from "next/link";
import { DeleteAccount, SettingsForm } from "@/components/student-portal/account-forms";
import { PageBody, PageHeader, Panel } from "@/components/student-portal/ui";
import { ArrowRightIcon } from "@/components/student-portal/icons";
import { BRAND } from "@/lib/brand";
import { BODY, EYEBROW } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Email preferences, study reminders, language and your password.",
};

/**
 * How the platform behaves - as distinct from who you are, which is the
 * profile page.
 *
 * The order is by how often a setting is changed, not by how important it
 * sounds: email first because it is the only thing the platform does to you
 * unprompted, then reminders, then language, then the password. Closing the
 * account is last, outside the form, behind its own confirmation.
 */
export default function SettingsPage() {
  return (
    <PageBody>
      <PageHeader
        eyebrow="Settings"
        title="How this behaves"
        lead="Nothing here changes what you can enrol in or what you have already earned. Every one of these is a preference, and every one of them can be changed back."
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <SettingsForm />

          <div className="mt-14">
            <DeleteAccount />
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="space-y-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <Panel>
              <p className={EYEBROW.muted}>Still free</p>
              <p className={`mt-4 ${BODY.base}`}>
                There is no paid tier, no billing section and nothing on this
                page that unlocks anything. Every programme, quiz and
                certificate is free, and there is nothing here to upgrade.
              </p>
            </Panel>

            <Panel>
              <p className={EYEBROW.muted}>Your details</p>
              <p className={`mt-4 ${BODY.base}`}>
                Your name, your email address and the name printed on your
                certificates are on the profile page.
              </p>
              <Link
                href="/profile"
                className="link-wipe mt-4 inline-flex items-center gap-2 text-lg font-semibold text-primary"
              >
                Go to profile
                <ArrowRightIcon className="size-4" />
              </Link>
            </Panel>

            <Panel>
              <p className={EYEBROW.muted}>Something not working</p>
              <p className={`mt-4 ${BODY.base}`}>
                Write to us and a person reads it. Include the programme and
                module if it is about the material itself.
              </p>
              <a
                href={`mailto:${BRAND.email}`}
                className="link-wipe mt-4 inline-block text-lg font-semibold text-primary"
              >
                {BRAND.email}
              </a>
            </Panel>
          </div>
        </aside>
      </div>
    </PageBody>
  );
}
