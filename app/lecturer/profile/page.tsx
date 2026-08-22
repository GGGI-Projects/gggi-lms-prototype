import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import { ROLE_LABEL } from "@/lib/permissions";
import { lectureLoad, modulesFor, staffById, staffName } from "@/lib/admin";
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
import {
  AddEntryAction,
  EditEntryAction,
  EntryManagedList,
  RemoveEntryAction,
} from "@/components/console/profile-entries";
import {
  ACHIEVEMENT_FIELDS,
  EXPERIENCE_FIELDS,
  PUBLICATION_FIELDS,
  QUALIFICATION_FIELDS,
  toEntryValues,
  type EntryField,
} from "@/lib/profile-fields";

export const metadata: Metadata = { title: "Your profile" };

/**
 * Who this lecturer is, on the platform.
 *
 * SPLIT FROM SETTINGS, deliberately. This page is the part of an account that
 * other people see - the name against every lecture, the field under it, the
 * modules they are trusted with, what they have put on the shared shelf.
 * `/lecturer/settings` is the part only they see: password, notifications,
 * language. Merging the two produced one long page where "change your
 * password" sat under "what learners read about you", and nobody could find
 * either.
 *
 * The one thing a lecturer cannot change is the one they most want to:
 * their assignments. Showing them read-only, with the name of who to ask, is
 * more use than leaving them off - "who decides this" is the real question
 * behind "why can I not edit this".
 */
export default function LecturerProfilePage() {
  const member = staffById(SESSION.lecturer);
  if (!member) throw new Error("[lecturer] no session account");

  const load = lectureLoad(member);
  const assigned = modulesFor(member);
  const uploads = uploadsBy(member.id);

  return (
    <PageBody>
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        lead="What learners and colleagues see. Your password, notifications and language are in settings."
        actions={
          <Link href="/lecturer/settings" className="btn-ripple btn-solid btn-sm">
            <span aria-hidden="true" className="btn-wave" />
            <span className="btn-label">Account settings</span>
          </Link>
        }
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard label="Modules" value={assigned.length} hint="assigned to you" />
        <MetricCard
          label="Lectures published"
          value={load.published}
          hint="live for learners"
        />
        <MetricCard
          label="Still to finish"
          value={load.unwritten}
          hint="not started or still drafting"
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
            description="Your name appears against every lecture you publish, and beside the module on the page a learner reads."
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
                Bio
              </span>
              <textarea
                rows={3}
                defaultValue={member.profile?.bio}
                placeholder="What you work on, and where."
                className="field"
              />
              <span className={`mt-2 block ${META.base}`}>
                Required. The opening line of your public profile page - see
                below for the rest of it.
              </span>
            </label>
          </SettingsGroup>

          <Section
            title="Your public profile"
            description="Qualifications, experience, publications and achievements - what a learner reads before deciding to trust you on a subject. All of this was set when you were appointed and is entirely yours to keep current."
            action={
              <Link
                href={`/lecturers/${member.id}`}
                className="link-wipe text-lg font-semibold text-primary"
              >
                View it as a learner does
              </Link>
            }
          >
            <div className="space-y-8">
              <ProfileEntrySection
                title="Qualifications"
                singular="qualification"
                fields={QUALIFICATION_FIELDS}
                entries={member.profile?.qualifications ?? []}
                emptyLabel="None recorded."
                addLabel="Add a qualification"
              />
              <ProfileEntrySection
                title="Experience"
                singular="experience entry"
                fields={EXPERIENCE_FIELDS}
                entries={member.profile?.experience ?? []}
                emptyLabel="None recorded."
                addLabel="Add an experience entry"
              />
              <ProfileEntrySection
                title="Publications"
                singular="publication"
                fields={PUBLICATION_FIELDS}
                entries={member.profile?.publications ?? []}
                emptyLabel="None recorded."
                addLabel="Add a publication"
              />
              <ProfileEntrySection
                title="Achievements"
                singular="achievement"
                fields={ACHIEVEMENT_FIELDS}
                entries={member.profile?.achievements ?? []}
                emptyLabel="None recorded yet."
                addLabel="Add an achievement"
              />
            </div>
          </Section>

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
                      href={`/lecturer/materials/${entry.asset.id}`}
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
                        ? `${entry.usage.length} ${entry.usage.length === 1 ? "lecture" : "lectures"}`
                        : "Never used"}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <Panel>
                <p className={BODY.base}>
                  Nothing yet. Anything you upload to the library is available
                  to every other lecturer, which is how the platform stops
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
                assigned.map((mdl) => (
                  <li key={mdl.id}>
                    <Link
                      href={`/lecturer/modules/${mdl.id}`}
                      className="flex items-start justify-between gap-3 rounded-sm border border-surface-deep bg-paper px-4 py-3"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-lg font-semibold text-ink">
                          <span className="link-wipe">{mdl.title}</span>
                        </span>
                        <span className={`block ${META.base}`}>
                          {mdl.lectureCount} lectures
                        </span>
                      </span>
                      <Badge tone={mdl.status === "draft" ? "neutral" : "done"}>
                        {mdl.status === "draft" ? "Draft" : "Published"}
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
              href="/lecturer/settings"
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

/* ------------------------------------------------------- profile sections */

/**
 * One category of the public profile - qualifications, experience,
 * publications, achievements - with full control over it: add one, edit one,
 * remove one. Unlike the read-only version of this same list on the admin's
 * lecturer detail page, this is the one place these entries can actually be
 * changed, because it is the lecturer's own account.
 */
function ProfileEntrySection({
  title,
  singular,
  fields,
  entries,
  emptyLabel,
  addLabel,
}: {
  title: string;
  /** "qualification", "experience entry", ... - used in the confirmation
   *  and drawer copy so a lecturer knows exactly which entry they are
   *  changing. */
  singular: string;
  fields: EntryField[];
  entries: Record<string, unknown>[];
  emptyLabel: string;
  addLabel: string;
}) {
  const values = entries.map(toEntryValues);
  // Built here, not as a callback passed down: this page is a server
  // component, and a server component can hand a client component finished
  // JSX but not a plain function - see the note on `EntryManagedList`.
  const actions = values.map((entry, i) => (
    <Fragment key={i}>
      <EditEntryAction
        fields={fields}
        initial={entry}
        drawerTitle={`Edit this ${singular}`}
        drawerDescription="Change any field and save - this only affects your own profile, and takes effect immediately once it is real."
      />
      <RemoveEntryAction question={`Remove this ${singular}?`} />
    </Fragment>
  ));

  return (
    <div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <div className="mt-3">
        <EntryManagedList
          fields={fields}
          entries={values}
          emptyLabel={emptyLabel}
          actions={actions}
        />
      </div>
      <div className="mt-4">
        <AddEntryAction
          fields={fields}
          drawerTitle={addLabel}
          drawerDescription="Added to the end of the list on your public profile."
          buttonLabel={addLabel}
        />
      </div>
    </div>
  );
}
