import type { Metadata } from "next";
import Link from "next/link";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import { ROLE_LABEL } from "@/lib/permissions";
import { moduleLoad, programmesFor, staffById, staffName } from "@/lib/admin";
import { uploadsBy } from "@/lib/materials";
import { formatDate, formatDateLong } from "@/lib/portal";
import {
  Badge,
  DefinitionList,
  MetricCard,
  PageBody,
  PageHeader,
  Panel,
  PrototypeNote,
  Section,
} from "@/components/console/ui";
import { SettingsGroup } from "@/components/console/actions";
import { AccountIdentity, CapabilityList } from "@/components/console/account";
import { KindMark } from "@/components/console/material-parts";

export const metadata: Metadata = { title: "Your profile" };

/**
 * Who this instructor is, on the platform.
 *
 * SPLIT FROM SETTINGS, deliberately. This page is the part of an account that
 * other people see - the name against every module, the field under it, the
 * programmes they are trusted with, what they have put on the shared shelf.
 * `/instructor/settings` is the part only they see: password, notifications,
 * language. Merging the two produced one long page where "change your
 * password" sat under "what learners read about you", and nobody could find
 * either.
 *
 * The one thing an instructor cannot change is the one they most want to:
 * their assignments. Showing them read-only, with the name of who to ask, is
 * more use than leaving them off - "who decides this" is the real question
 * behind "why can I not edit this".
 */
export default function InstructorProfilePage() {
  const member = staffById(SESSION.instructor);
  if (!member) throw new Error("[instructor] no session account");

  const load = moduleLoad(member);
  const assigned = programmesFor(member);
  const uploads = uploadsBy(member.id);

  return (
    <PageBody>
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        lead="What learners and colleagues see. Your password, notifications and language are in settings."
        actions={
          <Link href="/instructor/settings" className="btn-ripple btn-solid btn-sm">
            <span aria-hidden="true" className="btn-wave" />
            <span className="btn-label">Account settings</span>
          </Link>
        }
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard label="Programmes" value={assigned.length} hint="assigned to you" />
        <MetricCard
          label="Modules published"
          value={load.published}
          hint="live for learners"
        />
        <MetricCard
          label="Still to finish"
          value={load.inReview + load.unwritten}
          hint="in review or unwritten"
          goodWhen="down"
        />
        <MetricCard
          label="Files on the shelf"
          value={uploads.length}
          hint="you uploaded to the library"
        />
      </div>

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <AccountIdentity />

          <SettingsGroup
            title="What learners see"
            description="Your name appears against every module you publish, and beside the programme on the page a learner reads."
          >
            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                Full name
              </span>
              <input defaultValue={member.name} className="field" />
            </label>
            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                Field
              </span>
              <input defaultValue={member.title} className="field" />
              <span className={`mt-2 block ${META.base}`}>
                Two or three words. It sits under your name and tells a learner
                why you are the one teaching this.
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                A short biography
              </span>
              <textarea
                rows={3}
                placeholder="Two sentences. What you work on, and where."
                className="field"
              />
              <span className={`mt-2 block ${META.base}`}>
                Optional. Shown on the programme page beneath the contents list.
              </span>
            </label>
          </SettingsGroup>

          <Section title="What you have put on the shelf">
            {uploads.length ? (
              <ul className="divide-y divide-surface-deep rounded-sm border border-surface-deep bg-paper-raised">
                {uploads.map((entry) => (
                  <li
                    key={entry.asset.id}
                    className="flex items-center gap-4 px-5 py-3.5"
                  >
                    <KindMark kind={entry.asset.kind} className="size-9" />
                    <Link
                      href={`/instructor/materials/${entry.asset.id}`}
                      className="min-w-0 flex-1"
                    >
                      <span className="block truncate text-lg font-semibold text-ink">
                        <span className="link-wipe">{entry.asset.title}</span>
                      </span>
                      <span className={`block truncate ${META.base}`}>
                        {entry.group?.name} · {formatDate(entry.asset.uploadedOn)}
                      </span>
                    </Link>
                    <Badge tone={entry.usage.length ? "done" : "warn"}>
                      {entry.usage.length
                        ? `${entry.usage.length} ${entry.usage.length === 1 ? "module" : "modules"}`
                        : "Never used"}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <Panel>
                <p className={BODY.base}>
                  Nothing yet. Anything you upload to the library is available
                  to every other instructor, which is how the platform stops
                  holding four copies of the same handout.
                </p>
              </Panel>
            )}
          </Section>
        </div>

        <aside className="min-w-0 space-y-4">
          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Your assignments
            </h2>
            <p className={`mt-2 ${BODY.base}`}>
              Set by an administrator. If something is missing here, ask{" "}
              {member.createdBy ? staffName(member.createdBy) : "an administrator"}.
            </p>

            <ul className="mt-5 space-y-3">
              {assigned.length ? (
                assigned.map((programme) => (
                  <li key={programme.id}>
                    <Link
                      href={`/instructor/programmes/${programme.id}`}
                      className="flex items-start justify-between gap-3 rounded-sm border border-surface-deep bg-paper px-4 py-3"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-lg font-semibold text-ink">
                          <span className="link-wipe">{programme.title}</span>
                        </span>
                        <span className={`block ${META.base}`}>
                          {programme.moduleCount} modules
                        </span>
                      </span>
                      <Badge tone={programme.status === "draft" ? "neutral" : "done"}>
                        {programme.status === "draft" ? "Draft" : "Published"}
                      </Badge>
                    </Link>
                  </li>
                ))
              ) : (
                <li className={BODY.base}>Nothing assigned yet.</li>
              )}
            </ul>
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Account
            </h2>
            <DefinitionList
              className="mt-5"
              items={[
                { term: "Role", value: ROLE_LABEL[member.role] },
                { term: "Email", value: member.email },
                { term: "Appointed", value: formatDateLong(member.createdOn) },
                {
                  term: "Appointed by",
                  value: member.createdBy ? staffName(member.createdBy) : "-",
                },
              ]}
            />
            <Link
              href="/instructor/settings"
              className="mt-5 inline-block text-lg font-semibold text-primary"
            >
              <span className="link-wipe">Account settings</span>
            </Link>
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              What this role can do
            </h2>
            <CapabilityList className="mt-5" />
            <PrototypeNote className="mt-6" />
          </Panel>
        </aside>
      </div>
    </PageBody>
  );
}
