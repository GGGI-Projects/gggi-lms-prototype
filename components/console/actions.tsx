"use client";

import { useState, type ReactNode } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { BODY, HEADING, META } from "@/lib/theme";
import { CheckIcon, CloseIcon } from "@/components/student-portal/icons";
import { Avatar } from "@/components/student-portal/ui";
import { AlertIcon, LockIcon } from "@/components/console/icons";
import { useLockedGroup } from "@/components/console/locked-context";
import { EntryListBuilder } from "@/components/console/profile-entries";
import {
  ACHIEVEMENT_FIELDS,
  EXPERIENCE_FIELDS,
  PUBLICATION_FIELDS,
  QUALIFICATION_FIELDS,
  type EntryValues,
} from "@/lib/profile-fields";

/**
 * The console's verbs.
 *
 * Every one of these would write to a database in the real thing. In the
 * prototype they change what is on screen and then SAY SO, in the same voice
 * the sign-up form uses - a decision made once for the whole product: a
 * control that silently does nothing teaches a client that the demo is broken,
 * and a control that pretends to have saved teaches them something worse.
 *
 * They live together because they share one rule about consequence: anything
 * that would be hard to undo asks a second time, and the second question names
 * the thing being acted on. "Are you sure?" is not a question anyone can
 * answer; "Suspend Sajith Weerakoon's account?" is.
 */

/* ------------------------------------------------------------------ notices */

/** What a control says after it has been used. */
function DoneNote({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="mt-4 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
    >
      {children}
    </p>
  );
}

/* --------------------------------------------------------------- moderation */

/**
 * Approve or reject one review.
 *
 * REJECTION ASKS FOR A REASON and approval does not, which is the asymmetry
 * the job actually has: publishing is agreeing with what the learner already
 * wrote, refusing is a decision someone may have to answer for later. The
 * reason lands on the record beside the moderator's name.
 */
export function ModerationActions({
  reviewId,
  author,
  disabled = false,
}: {
  reviewId: string;
  author: string;
  disabled?: boolean;
}) {
  const [decision, setDecision] = useState<"published" | "rejected" | null>(null);
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState("");

  if (decision) {
    return (
      <div className="mt-5">
        <p className="flex items-center gap-2 text-lg font-semibold text-primary">
          <CheckIcon className="size-5" />
          {decision === "published"
            ? "Published to the module page"
            : "Rejected and hidden"}
        </p>
        <p className={`mt-2 ${META.base}`}>
          Prototype - {reviewId} is unchanged. Nothing was written and the
          learner was not notified.
        </p>
      </div>
    );
  }

  if (asking) {
    return (
      <div className="mt-5 rounded-sm border border-clay/25 bg-clay-pale px-5 py-4">
        <p className="text-lg font-semibold text-ink">
          Why is {author}&rsquo;s review being rejected?
        </p>
        <p className={`mt-1 ${BODY.base}`}>
          Recorded against the review and shown in the audit log. The learner is
          told that it was not published, not what was written here.
        </p>

        <label className="mt-4 block">
          <span className="sr-only">Reason for rejection</span>
          <textarea
            rows={2}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Advertising, abusive language, personal data…"
            className="field"
          />
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ActionButton
            variant="solid"
            size="sm"
            onClick={() => reason.trim() && setDecision("rejected")}
          >
            Reject the review
          </ActionButton>
          <button
            type="button"
            onClick={() => setAsking(false)}
            className="text-lg font-semibold text-primary"
          >
            <span className="link-wipe">Cancel</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <ActionButton
        variant="solid"
        size="sm"
        className="group"
        onClick={() => !disabled && setDecision("published")}
      >
        <CheckIcon className="size-4" />
        Publish
      </ActionButton>

      <button
        type="button"
        onClick={() => !disabled && setAsking(true)}
        className="inline-flex items-center gap-1.5 text-lg font-semibold text-clay"
      >
        <CloseIcon className="size-4" />
        <span className="link-wipe">Reject</span>
      </button>

      {disabled ? (
        <span className={`inline-flex items-center gap-2 ${META.base}`}>
          <LockIcon className="size-4" />
          Your role cannot moderate reviews.
        </span>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------- confirm & act */

/**
 * One button whose consequence is worth a second thought.
 *
 * The confirmation is INLINE rather than a dialog. A modal for "suspend this
 * account" trains people to dismiss modals; the row expanding under the button
 * to state exactly what will happen does not.
 *
 * COLOUR CARRIES `tone`, not just the confirmation panel underneath it. Three
 * of these can sit in one card - a password reset, a suspension, an export -
 * and if all three are the same amber pill, none of them stands out as the
 * one that is actually dangerous, and the one that only reads data looks like
 * the one that changes it. Every state stays FILLED, matching every other
 * button in the console - only the fill changes. An outline would read as a
 * lower-emphasis control, and the point here is to tell three actions apart,
 * not to demote two of them.
 */
const CONFIRM_TONE = {
  /** Suspend, delete, withdraw, archive, clear - anything hard to undo. */
  warn: { variant: "warn", panel: "border-clay/25 bg-clay-pale" },
  /** The everyday "go" action - reset a password, resend an invitation. */
  neutral: { variant: "solid", panel: "border-surface-deep bg-surface" },
  /** Reads or produces data rather than changing the account - an export. */
  info: { variant: "info", panel: "border-marine/25 bg-marine-pale" },
} as const;

export function ConfirmAction({
  label,
  question,
  detail,
  confirmLabel,
  tone = "warn",
  done,
  disabled = false,
  disabledNote,
  size = "sm",
}: {
  label: string;
  /** Names the thing being acted on. Never "Are you sure?". */
  question: string;
  detail?: string;
  confirmLabel: string;
  tone?: keyof typeof CONFIRM_TONE;
  /** What the screen says afterwards. */
  done: string;
  disabled?: boolean;
  disabledNote?: string;
  /**
   * `sm`, as everywhere this sits in a panel. Pass `"table"` when this
   * renders inside a table row - see the note on `.btn-table` - so the
   * confirm step it expands into keeps the same scale as the button that
   * opened it.
   */
  size?: "sm" | "table";
}) {
  const [asking, setAsking] = useState(false);
  const [acted, setActed] = useState(false);
  const { variant, panel } = CONFIRM_TONE[tone];

  if (acted) return <DoneNote>{done}</DoneNote>;

  if (asking) {
    return (
      <div className={`rounded-sm border px-5 py-4 ${panel}`}>
        <p className="text-lg font-semibold text-ink">{question}</p>
        {detail ? <p className={`mt-1.5 ${BODY.base}`}>{detail}</p> : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ActionButton variant={variant} size={size} onClick={() => setActed(true)}>
            {confirmLabel}
          </ActionButton>
          <button
            type="button"
            onClick={() => setAsking(false)}
            className="text-lg font-semibold text-primary"
          >
            <span className="link-wipe">Keep as it is</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ActionButton
        variant={variant}
        size={size}
        onClick={() => !disabled && setAsking(true)}
      >
        {label}
      </ActionButton>
      {disabled && disabledNote ? (
        <p className={`mt-2 flex items-start gap-2 ${META.base}`}>
          <LockIcon className="mt-0.5 size-4 shrink-0" />
          {disabledNote}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------- assignment */

/**
 * Which modules a lecturer may author.
 *
 * Checkboxes and one save, not a drag-and-drop board: the list is five items
 * long and the question is "which of these", which is what a checkbox group
 * is. It shows the CONSEQUENCE of unticking a module the lecturer has
 * already written lectures for, because that is the mistake this screen exists
 * to prevent.
 */
export function AssignModules({
  lecturer,
  modules,
  assigned,
  disabled = false,
}: {
  lecturer: string;
  modules: { id: string; title: string; status: string; lectures: number }[];
  assigned: string[];
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(assigned);
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => {
    setSaved(false);
    setSelected((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  };

  const removed = assigned.filter((id) => !selected.includes(id));

  return (
    <div>
      <ul className="space-y-3">
        {modules.map((mdl) => {
          const checked = selected.includes(mdl.id);
          return (
            <li key={mdl.id}>
              <label
                className={`flex cursor-pointer items-start gap-4 rounded-sm border px-5 py-4 transition-colors duration-300 ${
                  checked
                    ? "border-primary bg-tint-mist"
                    : "border-surface-deep bg-paper hover:border-muted-light"
                } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(mdl.id)}
                  className="checkbox mt-1"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-semibold text-ink">
                    {mdl.title}
                  </span>
                  <span className={`mt-0.5 block ${META.base}`}>
                    {mdl.status} · {mdl.lectures} lectures
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {removed.length ? (
        <p className="mt-4 flex items-start gap-2 rounded-sm border border-clay/25 bg-clay-pale px-5 py-4 text-lg leading-relaxed text-ink">
          <AlertIcon className="mt-1 size-5 shrink-0 text-clay" />
          <span>
            Removing {removed.length === 1 ? "a module" : "modules"} does
            not delete anything {lecturer} has written. They lose the ability
            to edit it, and the lectures stay published.
          </span>
        </p>
      ) : null}

      <div className="mt-6">
        <ActionButton
          variant="solid"
          size="sm"
          onClick={() => !disabled && setSaved(true)}
        >
          Save assignments
        </ActionButton>
      </div>

      {saved ? (
        <DoneNote>
          Prototype - {lecturer}&rsquo;s assignments are unchanged, and no
          notification was sent.
        </DoneNote>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ invite */

/**
 * Create an account for somebody.
 *
 * The same form for an administrator and a lecturer, because it is the same
 * act - name, email, role, and for a lecturer the modules they start
 * with. What differs is who is allowed to press it, and that is decided by the
 * page, not here.
 *
 * A LECTURER ALSO CARRIES A FULL PROFILE, MANDATORY AT CREATION - bio,
 * qualifications, experience, publications, achievements - because this is
 * a public-facing appointment, not an internal account: a learner reads this
 * profile from the lecturer's own page before the account exists in any
 * other sense (see FR-INS-201). THE BUTTON STAYS CLICKABLE EITHER WAY, same
 * device as the quiz runner's "answer every question first": submitting
 * with a category still empty does not silently fail, it explains exactly
 * which ones are missing, right next to the button that failed.
 */
export function InviteForm({
  kind,
  modules = [],
  formId,
}: {
  kind: "administrator" | "lecturer";
  modules?: { id: string; title: string }[];
  /**
   * Set when the submit button lives OUTSIDE this form - a drawer's footer,
   * say. Passing an id both names the `<form>` for a `<button form={formId}>`
   * elsewhere to target and switches off the form's own inline button, so the
   * two do not end up side by side. Omit for a standalone form, which keeps
   * its usual button at the bottom of the fields.
   */
  formId?: string;
}) {
  const [sent, setSent] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState<EntryValues[]>([]);
  const [experience, setExperience] = useState<EntryValues[]>([]);
  const [publications, setPublications] = useState<EntryValues[]>([]);
  const [achievements, setAchievements] = useState<EntryValues[]>([]);

  const missing =
    kind === "lecturer"
      ? [
          !bio.trim() && "a bio",
          !qualifications.length && "a qualification",
          !experience.length && "an experience entry",
          !publications.length && "a publication",
          !achievements.length && "an achievement",
        ].filter((entry): entry is string => Boolean(entry))
      : [];

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        if (missing.length) {
          setBlocked(true);
          return;
        }
        setBlocked(false);
        setSent(name.trim() || `the new ${kind}`);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Full name
          </span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="As it should appear in the console"
            className="field"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Email address
          </span>
          <input
            required
            type="email"
            placeholder="name@example.lk"
            className="field"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-lg font-semibold text-ink">
            {kind === "administrator" ? "Job title" : "Field"}
          </span>
          <input
            placeholder={
              kind === "administrator"
                ? "Module operations, learner support…"
                : "Climate adaptation, waste engineering…"
            }
            className="field"
          />
        </label>
      </div>

      {kind === "lecturer" && modules.length ? (
        <fieldset className="mt-7">
          <legend className="mb-3 text-lg font-semibold text-ink">
            Modules they may author
          </legend>
          <div className="flex flex-wrap gap-2">
            {modules.map((mdl) => (
              <label
                key={mdl.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-full border border-surface-deep bg-paper px-4 py-2 text-lg text-ink-soft transition-colors hover:border-muted-light"
              >
                <input type="checkbox" className="checkbox" />
                {mdl.title}
              </label>
            ))}
          </div>
          <p className={`mt-3 ${META.base}`}>
            Can be changed at any time from the lecturer&rsquo;s page.
          </p>
        </fieldset>
      ) : null}

      {kind === "lecturer" ? (
        <div className="mt-9 space-y-8 border-t border-surface-deep pt-8">
          <div>
            <h3 className="text-lg font-semibold text-ink">Public profile</h3>
            <p className={`mt-1 ${META.base}`}>
              What a learner reads on this lecturer&rsquo;s own page. Required
              now, and theirs to keep up to date afterwards.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-lg font-semibold text-ink">Bio</span>
            <textarea
              rows={3}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="A short paragraph introducing them - background, what they specialise in, and why."
              className="field"
            />
          </label>

          <div>
            <h4 className="text-lg font-semibold text-ink">Qualifications</h4>
            <div className="mt-3">
              <EntryListBuilder
                fields={QUALIFICATION_FIELDS}
                entries={qualifications}
                onChange={setQualifications}
                addLabel="Add a qualification"
              />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-ink">Experience</h4>
            <div className="mt-3">
              <EntryListBuilder
                fields={EXPERIENCE_FIELDS}
                entries={experience}
                onChange={setExperience}
                addLabel="Add an experience entry"
              />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-ink">Publications</h4>
            <div className="mt-3">
              <EntryListBuilder
                fields={PUBLICATION_FIELDS}
                entries={publications}
                onChange={setPublications}
                addLabel="Add a publication"
              />
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-ink">Achievements</h4>
            <div className="mt-3">
              <EntryListBuilder
                fields={ACHIEVEMENT_FIELDS}
                entries={achievements}
                onChange={setAchievements}
                addLabel="Add an achievement"
              />
            </div>
          </div>
        </div>
      ) : null}

      {!formId ? (
        <div className="mt-7">
          <ActionButton type="submit" variant="solid" size="sm">
            Send the invitation
          </ActionButton>
        </div>
      ) : null}

      {blocked ? (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-clay/35 bg-clay-pale px-5 py-4 text-lg leading-relaxed text-clay"
        >
          Still missing: {missing.join(", ")}. A lecturer&rsquo;s profile is
          part of appointing them, not an afterthought.
        </p>
      ) : null}

      {sent ? (
        <DoneNote>
          Prototype - no account was created and no email reached {sent}. In the
          finished platform this sends a single-use link that expires in seven
          days.
        </DoneNote>
      ) : null}
    </form>
  );
}

/* -------------------------------------------------------------- modules */

/**
 * Start a module.
 *
 * It creates a DRAFT and says so on the button, because a module that
 * appears in the public catalogue the moment someone types a title is a
 * module that will appear there half-written. Publishing is a separate,
 * deliberate act on the module's own page, once it has lectures in it.
 */
export function NewModuleForm({
  lecturers,
  formId,
}: {
  lecturers: { id: string; name: string; initials: string; avatarUrl: string }[];
  /** See the note on `InviteForm`'s `formId` - same device, same reason: a
   *  drawer's footer submits a form that lives in the scrollable body above
   *  it. Omit for a standalone form, which keeps its own inline button. */
  formId?: string;
}) {
  const [created, setCreated] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        setCreated(title.trim() || "the new module");
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-lg font-semibold text-ink">Title</span>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Green Buildings & Efficient Cooling"
            className="field"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-lg font-semibold text-ink">
            What it is for
          </span>
          <textarea
            rows={3}
            placeholder="One or two sentences, in the words a learner would use about their own job."
            className="field"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">Level</span>
          <select className="field" defaultValue="Foundation">
            <option>Foundation</option>
            <option>Intermediate</option>
          </select>
        </label>
      </div>

      {lecturers.length ? (
        <fieldset className="mt-7">
          <legend className="mb-3 text-lg font-semibold text-ink">
            Lecturers
          </legend>
          <div className="flex flex-wrap gap-2">
            {lecturers.map((lecturer) => (
              <label
                key={lecturer.id}
                className="flex cursor-pointer items-center gap-2.5 rounded-full border border-surface-deep bg-paper py-1.5 pl-2 pr-4 text-lg text-ink-soft transition-colors hover:border-muted-light"
              >
                <input type="checkbox" className="checkbox" />
                <Avatar
                  src={lecturer.avatarUrl}
                  initials={lecturer.initials}
                  tone="light"
                  className="size-7 text-sm"
                />
                {lecturer.name}
              </label>
            ))}
          </div>
          <p className={`mt-3 ${META.base}`}>
            Optional, and not exclusive - a module can have more than one
            lecturer, and every one of them writes any lecture in it. Can be
            changed at any time from the module&rsquo;s own page.
          </p>
        </fieldset>
      ) : null}

      {!formId ? (
        <div className="mt-7">
          <ActionButton type="submit" variant="solid" size="sm">
            Create as a draft
          </ActionButton>
        </div>
      ) : null}

      {created ? (
        <DoneNote>
          Prototype - {created} was not created. A real one would open as a
          draft, invisible to learners until it is published.
        </DoneNote>
      ) : null}
    </form>
  );
}

/* ------------------------------------------------------------------ lectures */

/**
 * Start a lecture.
 *
 * ONLY WHAT A PLAN NEEDS: a title and roughly how long it runs. NOT A KIND -
 * a lecture is not "a video" or "a reading", it is whatever mix of video
 * blocks, written sections and attached materials its lecturer builds it
 * from, one at a time, on the lecture's own page. Asking here which one this
 * lecture "is" would describe a shape the finished platform does not have.
 *
 * It creates a DRAFT at the next open position, never a specific one: lectures
 * are read in order, and a form that let somebody choose "position 3" would
 * also have to explain what happens to the lecture already there.
 */
export function NewLectureForm({
  nextNumber,
  formId,
}: {
  /** Where this lecture lands, e.g. "05" - decided by what already exists in
   *  the module, not chosen here. */
  nextNumber: string;
  /** See the note on `InviteForm`'s `formId` - same device, same reason. */
  formId?: string;
}) {
  const [created, setCreated] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        setCreated(title.trim() || "the new lecture");
      }}
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">Title</span>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Reading a term sheet"
            className="field"
          />
        </label>

        <label className="block max-w-40">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Study time
          </span>
          <input
            type="number"
            min={5}
            step={5}
            defaultValue={20}
            className="field"
          />
          <span className={`mt-1.5 block ${META.base}`}>Minutes</span>
        </label>
      </div>

      <p className={`mt-5 ${META.base}`}>
        Lands as lecture {nextNumber}, in draft and empty - visible only in
        this console until it is published. Video, writing, and any number of
        attached materials are then added block by block from the
        lecture&rsquo;s own page, and its quiz after that.
      </p>

      {!formId ? (
        <div className="mt-7">
          <ActionButton type="submit" variant="solid" size="sm">
            Add the lecture
          </ActionButton>
        </div>
      ) : null}

      {created ? (
        <DoneNote>
          Prototype - {created} was not created. A real one would open as
          lecture {nextNumber}, empty and in draft until its content is
          written.
        </DoneNote>
      ) : null}
    </form>
  );
}

/**
 * Move a lecture or a module between states.
 *
 * One control for the whole lifecycle rather than a Publish button here and an
 * Unpublish there: the states are exclusive and seeing the others is how
 * somebody learns what the lifecycle is.
 */
export function StateControl({
  states,
  current,
  subject,
  disabled = false,
  disabledNote,
}: {
  states: { value: string; label: string; description: string }[];
  current: string;
  /** Named in the confirmation - "lecture 03", "this module". */
  subject: string;
  disabled?: boolean;
  disabledNote?: string;
}) {
  const [chosen, setChosen] = useState(current);
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <ul className="space-y-2.5">
        {states.map((state) => {
          const active = state.value === chosen;
          return (
            <li key={state.value}>
              <label
                className={`flex cursor-pointer items-start gap-3.5 rounded-sm border px-4 py-3 transition-colors duration-300 ${
                  active
                    ? "border-primary bg-tint-mist"
                    : "border-surface-deep bg-paper hover:border-muted-light"
                } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <input
                  type="radio"
                  name={`state-${subject}`}
                  checked={active}
                  disabled={disabled}
                  onChange={() => {
                    setChosen(state.value);
                    setSaved(false);
                  }}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`mt-1 grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                    active ? "border-primary bg-primary" : "border-muted-light"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-paper" />
                </span>
                <span className="min-w-0">
                  <span className="block text-lg font-semibold text-ink">
                    {state.label}
                  </span>
                  <span className={`mt-0.5 block ${META.base}`}>
                    {state.description}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {chosen !== current && !disabled ? (
        <div className="mt-5">
          <ActionButton variant="solid" size="sm" onClick={() => setSaved(true)}>
            Apply to {subject}
          </ActionButton>
        </div>
      ) : null}

      {disabled && disabledNote ? (
        <p className={`mt-4 flex items-start gap-2 ${META.base}`}>
          <LockIcon className="mt-0.5 size-4 shrink-0" />
          {disabledNote}
        </p>
      ) : null}

      {saved ? (
        <DoneNote>Prototype - {subject} is unchanged.</DoneNote>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------- forms */

/** A titled group of controls, with the save button and the honest note. */
export function SettingsGroup({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const [saved, setSaved] = useState(false);
  // Whether this group is read-only is not the page's decision to repeat on
  // every group - it comes from the `<SettingsGate>` the page wraps them in,
  // which asks the permission model once.
  const lock = useLockedGroup();
  const locked = Boolean(lock);
  const lockNote = lock?.note;

  return (
    <section className="rounded-sm border border-surface-deep bg-paper-raised p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className={HEADING.card}>{title}</h2>
          {description ? (
            <p className={`measure mt-2 ${BODY.base}`}>{description}</p>
          ) : null}
        </div>
        {locked ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-surface-deep bg-surface px-3 py-1 text-sm font-medium text-muted">
            <LockIcon className="size-4" />
            Read only
          </span>
        ) : null}
      </div>

      {/* `fieldset[disabled]` switches off every control inside in one
          declaration, rather than each control being told separately and one
          of them being missed. */}
      <fieldset disabled={locked} className={locked ? "opacity-70" : ""}>
        <div className="mt-7 space-y-6">{children}</div>
      </fieldset>

      {locked ? (
        <p className={`mt-6 flex items-start gap-2 ${META.base}`}>
          <LockIcon className="mt-0.5 size-4 shrink-0" />
          {lockNote ?? "Only the super administrator can change these."}
        </p>
      ) : (
        <div className="mt-7">
          <ActionButton variant="solid" size="sm" onClick={() => setSaved(true)}>
            Save changes
          </ActionButton>
        </div>
      )}

      {saved ? <DoneNote>Prototype - nothing was saved.</DoneNote> : null}
    </section>
  );
}

/**
 * A switch. Lifted from the portal's settings page rather than rewritten, with
 * the same note about why the knob is moved the way it is: `peer-*` compiles
 * to a sibling selector and the knob is a descendant, so `peer-checked:` on
 * the knob itself silently never moves it.
 */
export function Toggle({
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
