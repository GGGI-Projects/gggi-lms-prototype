import type { Metadata } from "next";
import Link from "next/link";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import { PLATFORM_SETTINGS } from "@/content/operations";
import { PASS_MARK, QUIZ_LENGTH } from "@/lib/portal";
import { staffById } from "@/lib/admin";
import {
  DefinitionList,
  PageBody,
  PageHeader,
  Panel,
  PrototypeNote,
} from "@/components/console/ui";
import { ConfirmAction, SettingsGroup, Toggle } from "@/components/console/actions";

export const metadata: Metadata = { title: "Settings" };

/**
 * The half of an account only its owner sees.
 *
 * Password, notifications, language, sessions. Everything other people see -
 * name, field, biography, assignments - is on the profile, because those are
 * two different jobs done at two different times, and one page holding both is
 * a page where neither is findable.
 *
 * THE PLATFORM'S RULES ARE SHOWN BUT NOT EDITABLE. An instructor asked "why is
 * the pass mark 70" should be able to read the answer on their own settings
 * page rather than being told to ask an administrator, and seeing the rule
 * with somebody else's name against it is what makes the boundary legible.
 */
export default function InstructorSettingsPage() {
  const member = staffById(SESSION.instructor);
  if (!member) throw new Error("[instructor] no session account");

  return (
    <PageBody>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        lead="How you sign in, what reaches you, and what language the console speaks. What learners see is on your profile."
        actions={
          <Link href="/instructor/profile" className="btn-ripple btn-solid btn-sm">
            <span aria-hidden="true" className="btn-wave" />
            <span className="btn-label">Your profile</span>
          </Link>
        }
      />

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <SettingsGroup
            title="Signing in"
            description="A console account is not a learner account. The same person signing in as both keeps two separate passwords, deliberately - one of them can publish material to 1,247 people."
          >
            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                Email address
              </span>
              <input defaultValue={member.email} type="email" className="field" />
              <span className={`mt-2 block ${META.base}`}>
                Changing this sends a confirmation to both the old address and
                the new one.
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                Current password
              </span>
              <input type="password" autoComplete="current-password" className="field" />
            </label>
            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                New password
              </span>
              <input type="password" autoComplete="new-password" className="field" />
              <span className={`mt-2 block ${META.base}`}>
                At least twelve characters for a console account, against eight
                for a learner. The difference is what the account can reach.
              </span>
            </label>
            <Toggle
              name="two-factor"
              label="Two-step sign-in"
              description="A code from an authenticator app as well as a password. Optional for instructors, required for the super administrator."
              defaultChecked
            />
          </SettingsGroup>

          <SettingsGroup
            title="What reaches you"
            description="Notifications about your own material. Nothing here emails learners."
          >
            <Toggle
              name="notify-review"
              label="A learner reviews one of your modules"
              description="Once the review has been moderated and published. Rejected ones never reach you - that is the moderator's business, not yours."
              defaultChecked
            />
            <Toggle
              name="notify-assignment"
              label="You are assigned or unassigned a module"
              description="Sent when an administrator changes what you may write for."
              defaultChecked
            />
            <Toggle
              name="notify-scores"
              label="A quiz falls below the pass mark"
              description={`One email if the average on any of your lectures stays under ${PASS_MARK}% for a fortnight. Usually a question that is wrong rather than a cohort that is weak.`}
              defaultChecked
            />
            <Toggle
              name="notify-library"
              label="Somebody attaches your material"
              description="When a file you uploaded is picked up by another instructor's lecture."
              defaultChecked={false}
            />
            <Toggle
              name="notify-digest"
              label="Weekly summary"
              description="Where your learners got to, and what is still unwritten. One email on Monday."
              defaultChecked
            />
          </SettingsGroup>

          <SettingsGroup
            title="The console itself"
            description="How this interface behaves for you. It changes nothing a learner sees."
          >
            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                Language
              </span>
              <select className="field" defaultValue="English">
                {PLATFORM_SETTINGS.general.languages.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
              <span className={`mt-2 block ${META.base}`}>
                The console is English in this prototype. Learners already
                choose their own.
              </span>
            </label>
            <Toggle
              name="draft-warnings"
              label="Warn me before publishing a lecture"
              description="A confirmation step on the publish control. Worth leaving on for anything that makes a claim about policy or money."
              defaultChecked
            />
          </SettingsGroup>
        </div>

        <aside className="min-w-0 space-y-4">
          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Rules you cannot change
            </h2>
            <p className={`mt-2 ${BODY.base}`}>
              These are set once for the whole platform by the super
              administrator, so that a certificate means the same thing whatever
              lecture it came through.
            </p>
            <DefinitionList
              className="mt-5"
              items={[
                { term: "Questions per quiz", value: QUIZ_LENGTH },
                { term: "Pass mark", value: `${PASS_MARK}%` },
                { term: "Attempts", value: "Unlimited" },
                { term: "Time limit", value: "None" },
                {
                  term: "Reviews",
                  value: PLATFORM_SETTINGS.moderation.holdReviewsForApproval
                    ? "Held for approval"
                    : "Published immediately",
                },
              ]}
            />
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Sessions
            </h2>
            <p className={`mt-3 ${BODY.base}`}>
              You are signed in on this device only. A console session ends
              after eight hours of inactivity, which is shorter than a
              learner&rsquo;s for the obvious reason.
            </p>
            <div className="mt-6">
              <ConfirmAction
                label="Sign out everywhere"
                question="End every console session on every device?"
                detail="You will have to sign in again here as well. Nothing you have written is affected."
                confirmLabel="End all sessions"
                tone="neutral"
                done="Prototype - there is no session to end."
              />
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Leaving
            </h2>
            <p className={`mt-3 ${BODY.base}`}>
              An instructor account is closed by an administrator, not from
              here. Lectures you wrote stay published and keep your name - the
              material is the platform&rsquo;s, the credit is yours.
            </p>
            <PrototypeNote className="mt-5" />
          </Panel>
        </aside>
      </div>
    </PageBody>
  );
}
