"use client";

import { useState, type ReactNode } from "react";
import { ActionButton } from "@/components/ui/action-button";
import {
  PasswordField,
  SelectField,
  TextField,
} from "@/components/auth/fields";
import { LEARNER } from "@/content/portal";
import { BODY, EYEBROW, HEADING, META } from "@/lib/theme";

/**
 * The profile and settings forms.
 *
 * They live in one file because they are the same object twice - a titled
 * group of controls with one save button and one honest note about the
 * prototype - and because the FieldGroup and Toggle below are shared between
 * them. Split across two files, the second one grows its own group heading
 * treatment within a week.
 *
 * The controls themselves are the account pages' (`components/auth/fields`),
 * not new ones. A learner filled in the sign-up form with those exact fields;
 * meeting a different input on the settings page is how a product starts to
 * feel assembled from parts.
 *
 * Nothing submits anywhere. Each form says so after a save rather than
 * silently doing nothing - the same choice `<SignupForm>` makes.
 */

/* ---------------------------------------------------------------- shared */

function FieldGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-surface-deep pt-8 first:border-0 first:pt-0">
      <h2 className={HEADING.card}>{title}</h2>
      {description ? (
        <p className={`measure-wide mt-2 ${BODY.base}`}>{description}</p>
      ) : null}
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}

/**
 * A switch, built on a real checkbox.
 *
 * The input is the control - it keeps the keyboard behaviour, the label
 * association and the form value - and everything visible is drawn from its
 * `peer` state. A div with an `onClick` would have to re-implement all three
 * and would get at least one of them wrong.
 */
function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      {/* The knob is moved by `peer-checked:[&>span]:…` rather than by a
          `peer-checked:` class on the knob itself: `peer-*` compiles to a
          SIBLING selector, and the knob is a descendant of the track, not a
          sibling of the input. Written the obvious way it silently never
          moves. */}
      <span
        aria-hidden="true"
        className="mt-1 flex h-6 w-11 shrink-0 items-center rounded-full bg-surface-deep p-0.5 transition-colors duration-300 peer-checked:bg-primary peer-checked:[&>span]:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
      >
        <span className="size-5 rounded-full bg-paper-raised shadow-sm transition-transform duration-300 ease-out-expo" />
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-semibold text-ink">{label}</span>
        <span className={`mt-1 block ${BODY.base}`}>{description}</span>
      </span>
    </label>
  );
}

/** The note every one of these forms shows once it has been saved. */
function SavedNote({ shown }: { shown: boolean }) {
  if (!shown) return null;

  return (
    <p
      role="status"
      className="mt-5 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
    >
      This is a design prototype - nothing was saved and nothing was sent
      anywhere.
    </p>
  );
}

/* ---------------------------------------------------------------- profile */

const SECTORS = [
  "Government or public sector",
  "Provincial or local authority",
  "Private sector",
  "NGO or development organisation",
  "University or school",
  "Something else",
] as const;

export function ProfileForm() {
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
      className="space-y-10"
    >
      <FieldGroup
        title="Your details"
        description="The name on your certificates is held separately, because a certificate carries the name on your identity documents and the platform greets you by the one you go by."
      >
        <TextField
          label="Display name"
          name="name"
          autoComplete="name"
          defaultValue={LEARNER.name}
          hint="What the portal calls you."
        />
        <TextField
          label="Name on certificates"
          name="certificateName"
          defaultValue={LEARNER.certificateName}
          hint="Printed exactly as written here. Certificates already issued are not reprinted."
        />
        <TextField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={LEARNER.email}
          hint="Used to sign in and to send your certificates. Nothing else."
        />
      </FieldGroup>

      <FieldGroup
        title="Where you work"
        description="Optional throughout, and it never affects what you can enrol in. It tells us which modules to build next."
      >
        <TextField
          label="Role"
          name="role"
          defaultValue={LEARNER.role}
          optional
        />
        <TextField
          label="Organisation"
          name="organisation"
          defaultValue={LEARNER.organisation}
          optional
        />
        <SelectField
          label="Sector"
          name="sector"
          options={SECTORS}
          defaultValue={LEARNER.sector}
          optional
        />
        <TextField
          label="District"
          name="district"
          defaultValue={LEARNER.district}
          optional
        />
      </FieldGroup>

      <div className="border-t border-surface-deep pt-8">
        <ActionButton type="submit" variant="solid" size="md">
          Save changes
        </ActionButton>
        <SavedNote shown={saved} />
      </div>
    </form>
  );
}

/* --------------------------------------------------------------- settings */

const LANGUAGES = ["English", "සිංහල (coming soon)", "தமிழ் (coming soon)"] as const;
const REMINDERS = ["Weekly", "Fortnightly", "Monthly", "Never"] as const;

export function SettingsForm() {
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
      className="space-y-10"
    >
      <FieldGroup
        title="Email"
        description="Three switches, and none of them is on by default because it suits us. Progress and certificates are about your own account; the third is marketing and starts off."
      >
        <Toggle
          name="emailProgress"
          label="Progress and certificates"
          description="A note when a certificate issues, and a summary of what you finished."
          defaultChecked={LEARNER.preferences.emailProgress}
        />
        <Toggle
          name="emailNewModules"
          label="New modules"
          description="When a module is published, including the Sinhala and Tamil editions."
          defaultChecked={LEARNER.preferences.emailNewModules}
        />
        <Toggle
          name="emailProduct"
          label="Platform news"
          description="Occasional updates about the platform itself. Off unless you ask for it."
          defaultChecked={LEARNER.preferences.emailProduct}
        />
      </FieldGroup>

      <FieldGroup
        title="Study reminders"
        description="Self-paced means self-paced - a reminder is a nudge, never a deadline, and turning it off changes nothing about your enrolments."
      >
        <SelectField
          label="Remind me to carry on"
          name="reminders"
          options={REMINDERS}
          defaultValue={LEARNER.preferences.reminders}
          optional
        />
      </FieldGroup>

      <FieldGroup
        title="Language"
        description="The first modules are published in English. Sinhala and Tamil are on the roadmap and the platform is built to carry all three side by side."
      >
        <SelectField
          label="Interface language"
          name="language"
          options={LANGUAGES}
          defaultValue={LEARNER.preferences.language}
          optional
        />
      </FieldGroup>

      <FieldGroup
        title="Password"
        description="Changing it signs you out of other devices."
      >
        <PasswordField
          label="Current password"
          name="currentPassword"
          autoComplete="current-password"
        />
        <PasswordField
          label="New password"
          name="newPassword"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          meter
        />
      </FieldGroup>

      <div className="border-t border-surface-deep pt-8">
        <ActionButton type="submit" variant="solid" size="md">
          Save settings
        </ActionButton>
        <SavedNote shown={saved} />
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ danger */

/**
 * Closing the account.
 *
 * Kept out of the settings form and given its own confirmation step, because
 * it is the one irreversible thing on the platform and it must not be one
 * mis-click away from "Save settings". The copy says plainly what happens to
 * the certificates, which is the only question anyone actually has here.
 */
export function DeleteAccount() {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div className="rounded-sm border border-clay/30 bg-clay-pale/50 p-6 sm:p-8">
      <p className={`${EYEBROW.muted} text-clay`}>Close your account</p>
      <h2 className={`${HEADING.card} mt-3`}>Delete everything</h2>
      <p className={`measure mt-3 ${BODY.base}`}>
        Your enrolments, your progress and your certificates are removed and
        cannot be restored. Certificates already issued stay valid in the
        register under their reference, but you will no longer be able to
        download them here.
      </p>

      {confirming ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setDone(true)}
            className="rounded-full border-2 border-clay bg-clay px-6 py-3 text-lg font-semibold text-paper transition-colors duration-300 hover:bg-clay/90"
          >
            Yes, delete my account
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="link-wipe text-lg font-semibold text-ink-soft"
          >
            Keep my account
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-6 rounded-full border-2 border-clay px-6 py-3 text-lg font-semibold text-clay transition-colors duration-300 hover:bg-clay hover:text-paper"
        >
          Close my account
        </button>
      )}

      {done ? (
        <p role="status" className={`mt-4 ${META.base}`}>
          Design prototype - no account exists to delete.
        </p>
      ) : null}
    </div>
  );
}
