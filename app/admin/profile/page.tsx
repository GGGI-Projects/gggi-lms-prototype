import type { Metadata } from "next";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { ROLE_SUMMARY } from "@/lib/permissions";
import {
  PageBody,
  PageHeader,
  Panel,
  PrototypeNote,
} from "@/components/console/ui";
import { SettingsGroup, Toggle } from "@/components/console/actions";
import { AccountIdentity, CapabilityList } from "@/components/console/account";

export const metadata: Metadata = { title: "Your profile" };

/**
 * Your own account.
 *
 * The identity at the top is CLIENT-RENDERED, because in this prototype who
 * you are is whichever viewpoint the switcher is on - the one page in the
 * console where that has to be true rather than merely consistent. Everything
 * below it is the same for anybody: how you sign in, what lands in your inbox,
 * and the sessions you can end.
 *
 * The capability list is not decoration. "What am I actually allowed to do" is
 * a question every new administrator asks in their first week, and answering it
 * on their own profile is cheaper than answering it in a handover document
 * nobody updates.
 */
export default function ProfilePage() {
  return (
    <PageBody>
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        lead="Your console account, and what it can reach."
      />

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <AccountIdentity />

          <SettingsGroup
            title="Signing in"
            description="Console accounts are not learner accounts - the same person signing in as both keeps two separate passwords, deliberately."
          >
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
              description="A code from an authenticator app as well as a password. Required for the super administrator, optional for everybody else."
              defaultChecked
            />
          </SettingsGroup>

          <SettingsGroup
            title="What reaches you"
            description="Console notifications only. Learner emails are set in platform settings."
          >
            <Toggle
              name="notify-flagged"
              label="Something is flagged for moderation"
              description="Sent as it happens. This is the one that is worth interrupting a day for."
              defaultChecked
            />
            <Toggle
              name="notify-daily"
              label="Daily summary"
              description="What came in, what is waiting, what changed. One email at 08:00."
              defaultChecked
            />
            <Toggle
              name="notify-accounts"
              label="An account was created or suspended"
              description="Every change to who has console access."
            />
            <Toggle
              name="notify-weekly"
              label="Weekly platform figures"
              description="The dashboard's headline numbers, as an email."
              defaultChecked={false}
            />
          </SettingsGroup>
        </div>

        <aside className="min-w-0 space-y-4">
          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              What this role can do
            </h2>
            <p className={`mt-2 ${BODY.base}`}>
              Everything ticked below is available to you now. Anything greyed
              out belongs to a role you are not viewing as.
            </p>
            <CapabilityList className="mt-6" />
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Roles on this platform
            </h2>
            <dl className="mt-5 space-y-4">
              {Object.entries(ROLE_SUMMARY).map(([role, summary]) => (
                <div key={role}>
                  <dt className="text-lg font-semibold capitalize text-ink">
                    {role.replace("-", " ")}
                  </dt>
                  <dd className={`mt-1 ${BODY.base}`}>{summary}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Sessions
            </h2>
            <p className={`mt-2 ${BODY.base}`}>
              You are signed in on this device only. A console session ends
              after eight hours of inactivity, which is shorter than a
              learner&rsquo;s for the obvious reason.
            </p>
            <PrototypeNote className="mt-5">
              No session exists in this prototype - there is nothing to sign out
              of.
            </PrototypeNote>
          </Panel>
        </aside>
      </div>
    </PageBody>
  );
}
