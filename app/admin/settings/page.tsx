import type { Metadata } from "next";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { PLATFORM_SETTINGS } from "@/content/operations";
import { BRAND } from "@/lib/brand";
import {
  PageBody,
  PageHeader,
  Panel,
  PrototypeNote,
} from "@/components/console/ui";
import { SettingsGroup, Toggle } from "@/components/console/actions";
import { SettingsGate } from "@/components/console/settings-gate";

export const metadata: Metadata = { title: "Platform settings" };

/**
 * How the platform behaves.
 *
 * READABLE BY BOTH ADMIN ROLES, CHANGEABLE BY ONE. An administrator who cannot
 * see that reviews are held for approval cannot explain to a learner why their
 * review has not appeared; hiding the setting does not protect anything, it
 * just moves the question to a phone call. So every group renders for
 * everybody and the controls themselves are switched off, with the reason
 * beside them - see `<SettingsGate>`.
 *
 * The order is the order these get asked about: what the platform is called,
 * who may join, what a certificate means, what happens to a review, and what
 * lands in somebody's inbox.
 */
export default function SettingsPage() {
  const { general, enrolment, certificates, moderation, email } =
    PLATFORM_SETTINGS;

  return (
    <PageBody>
      <PageHeader
        eyebrow="Platform"
        title="Settings"
        lead="Platform-wide rules. Administrators can read all of this; only the super administrator can change it."
      />

      <div className={`${CONSOLE.stack} space-y-4`}>
        <SettingsGate>
          <SettingsGroup
            title="General"
            description="What the platform calls itself, and where a learner's reply goes."
          >
            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                Platform name
              </span>
              <input defaultValue={general.platformName} className="field" />
              <span className={`mt-2 block ${META.base}`}>
                Appears in the wordmark, page titles, certificates and every
                email. Currently a placeholder - see <code>lib/brand.ts</code>.
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                Support address
              </span>
              <input defaultValue={general.supportEmail} className="field" />
            </label>

            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                Default language
              </span>
              <select defaultValue={general.defaultLanguage} className="field">
                {general.languages.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
              <span className={`mt-2 block ${META.base}`}>
                Sinhala and Tamil are offered to learners. The interface itself
                is English in this prototype.
              </span>
            </label>
          </SettingsGroup>
        </SettingsGate>

        <SettingsGate>
          <SettingsGroup
            title="Enrolment"
            description="Who can join, and what they can join."
          >
            <Toggle
              name="open-registration"
              label="Anyone can register"
              description={`Open sign-up, no approval queue - what the public site promises. Switching this off turns ${BRAND.name} into an invitation-only platform.`}
              defaultChecked={enrolment.openRegistration}
            />
            <Toggle
              name="verify-email"
              label="Require email verification"
              description="A learner must confirm their address before their first certificate can issue."
              defaultChecked={enrolment.requireEmailVerification}
            />
            <Toggle
              name="self-unenrol"
              label="Learners may leave a programme"
              description="Leaving keeps their progress, so re-enrolling later starts where they stopped."
              defaultChecked={enrolment.allowSelfUnenrol}
            />
            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                Programmes per learner
              </span>
              <select defaultValue={enrolment.maxProgrammesPerLearner} className="field">
                <option>No limit</option>
                <option>Three at a time</option>
                <option>One at a time</option>
              </select>
            </label>
          </SettingsGroup>
        </SettingsGate>

        <SettingsGate>
          <SettingsGroup
            title="Certificates"
            description="What finishing means, and what the certificate says."
          >
            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                Pass mark
              </span>
              <select defaultValue={String(certificates.passMark)} className="field">
                <option value="60">60%</option>
                <option value="70">70%</option>
                <option value="80">80%</option>
              </select>
              <span className={`mt-2 block ${META.base}`}>
                One number for every quiz on the platform. Raising it does not
                withdraw certificates already issued.
              </span>
            </label>

            <Toggle
              name="issue-on-completion"
              label="Issue automatically on completion"
              description="The certificate appears the moment the last quiz is passed. Switching this off means somebody has to approve each one, and that queue is nobody's job."
              defaultChecked={certificates.issueOnCompletion}
            />
            <Toggle
              name="verification-page"
              label="Public verification page"
              description="Anybody with a reference can check that it is genuine, without signing in."
              defaultChecked={certificates.verificationPage}
            />

            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                Reference prefix
              </span>
              <input
                defaultValue={certificates.referencePrefix}
                className="field max-w-32"
              />
              <span className={`mt-2 block ${META.base}`}>
                References look like {certificates.referencePrefix}-2026-CE-04817.
                Changing this does not renumber anything already issued.
              </span>
            </label>
          </SettingsGroup>
        </SettingsGate>

        <SettingsGate>
          <SettingsGroup
            title="Moderation"
            description="What happens to a review between somebody writing it and anybody reading it."
          >
            <Toggle
              name="hold-reviews"
              label="Hold reviews for approval"
              description="Nothing appears on a programme page until an administrator has read it. Switching this off publishes reviews immediately and turns moderation into removal after the fact."
              defaultChecked={moderation.holdReviewsForApproval}
            />
            <Toggle
              name="auto-flag"
              label="Flag phone numbers, links and abuse"
              description="A crude keyword check that pushes a review to the top of the queue. It never rejects anything by itself."
              defaultChecked={moderation.autoFlagKeywords}
            />
            <Toggle
              name="notify-flag"
              label="Email an administrator when something is flagged"
              description="Sent to the support address above."
              defaultChecked={moderation.notifyOnFlag}
            />
          </SettingsGroup>
        </SettingsGate>

        <SettingsGate>
          <SettingsGroup
            title="Email"
            description="What the platform sends learners without being asked."
          >
            <Toggle
              name="digest"
              label="Weekly progress digest"
              description="Where they are, and the next module. Learners can switch this off for themselves."
              defaultChecked={email.weeklyProgressDigest}
            />
            <Toggle
              name="announcements"
              label="Announce new programmes"
              description="One email when a programme is published."
              defaultChecked={email.newProgrammeAnnouncements}
            />
            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                Nudge after inactivity
              </span>
              <select defaultValue={email.inactivityNudgeAfter} className="field">
                <option>Never</option>
                <option>14 days</option>
                <option>21 days</option>
                <option>30 days</option>
              </select>
              <span className={`mt-2 block ${META.base}`}>
                One message, once. A platform that emails somebody weekly about
                a course they abandoned is a platform they filter.
              </span>
            </label>
          </SettingsGroup>
        </SettingsGate>
      </div>

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-2`}>
        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Data retention
          </h2>
          <p className={`mt-3 ${BODY.base}`}>
            Learner records are kept while the account exists and for two years
            after it is closed, so a certificate can still be verified. The
            audit log is kept for seven years and cannot be shortened from
            inside the console.
          </p>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Timezone
          </h2>
          <p className={`mt-3 ${BODY.base}`}>
            Every date and time in the console is {general.timezone}. Learners
            see their own.
          </p>
        </Panel>
      </div>

      <PrototypeNote className="mt-6">
        These controls are the real shape of the settings, with the platform&rsquo;s
        current values in them. Nothing is saved.
      </PrototypeNote>
    </PageBody>
  );
}
