"use client";

import { useId, useState, type ReactNode } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { ConfirmAction } from "@/components/console/actions";
import { Drawer } from "@/components/console/drawer";
import { IfCan, LockedNote } from "@/components/console/permission";
import { EditIcon, PlusIcon } from "@/components/console/icons";
import { META } from "@/lib/theme";
import type { Capability } from "@/lib/permissions";
import {
  emptyValues,
  summarise,
  type EntryField,
  type EntryValues,
} from "@/lib/profile-fields";

export type { EntryField, EntryValues };

// The field schemas, `summarise()`, `emptyValues()` and `toEntryValues()`
// live in `lib/profile-fields.ts`, not here - this file is `"use client"`,
// and a server component (the admin lecturer page, the student lecturer
// page) can render a client COMPONENT but cannot call a plain function
// exported from a client module, not even by re-exporting it through here.
// Server pages import those directly from `@/lib/profile-fields`; this file
// keeps only the interactive pieces.

/**
 * The interactive half of a lecturer's profile - four lists (qualifications,
 * experience, publications, achievements) that are the same shape of thing
 * wearing different field labels. ONE GENERIC SET OF COMPONENTS, driven by
 * the field schemas in `lib/profile-fields.ts`, rather than four
 * almost-identical forms that would drift the moment one of them got a field
 * the others did not.
 *
 * Values are kept as a loose `Record<string, string>` rather than the typed
 * `QualificationEntry` / `ExperienceEntry` / etc. from `content/staff.ts` -
 * this is the editing surface, where every field is just text in a box, and
 * nothing here ever writes back to that typed data anyway (see the note on
 * every form in this console: nothing saves).
 */

/* --------------------------------------------------------- read-only view */

/**
 * The credentials as written - what an administrator sees on a lecturer's
 * detail page (no `actions`, nothing to change from there), and what a
 * lecturer sees on their own profile page (`actions` set, so an Edit and a
 * Remove control sit beside each entry). One list, one way of reading an
 * entry, whichever context asks for it.
 *
 * `actions` IS AN ARRAY OF ALREADY-BUILT ELEMENTS, ONE PER ENTRY, not a
 * render-prop callback - a server component (both call sites are server
 * pages) can hand a client component finished JSX, but not a plain function,
 * across that boundary. The caller builds each entry's controls with
 * `entries.map(...)` before rendering this, the same shape either way.
 */
export function EntryManagedList({
  fields,
  entries,
  emptyLabel,
  actions,
}: {
  fields: EntryField[];
  entries: EntryValues[];
  emptyLabel: string;
  actions?: ReactNode[];
}) {
  if (!entries.length) {
    return <p className={META.base}>{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry, i) => {
        const summary = summarise(fields, entry);
        return (
          <li
            key={i}
            className="flex items-start justify-between gap-4 rounded-sm border border-surface-deep bg-paper-raised px-4 py-3"
          >
            <div className="min-w-0">
              <p className="font-semibold text-ink">{summary.title}</p>
              {summary.detail ? <p className={`mt-0.5 ${META.base}`}>{summary.detail}</p> : null}
            </div>
            {actions?.[i] ? (
              <div className="flex shrink-0 items-center gap-3">{actions[i]}</div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------ the fields */

function EntryFields({
  fields,
  values,
  onChange,
}: {
  fields: EntryField[];
  values: EntryValues;
  onChange: (next: EntryValues) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <label
          key={field.key}
          className={field.multiline ? "block sm:col-span-2" : "block"}
        >
          <span className="mb-1.5 block text-sm font-semibold text-ink">
            {field.label}
            {field.required ? null : (
              <span className="font-normal text-muted"> (optional)</span>
            )}
          </span>
          {field.multiline ? (
            <textarea
              rows={2}
              value={values[field.key] ?? ""}
              onChange={(event) =>
                onChange({ ...values, [field.key]: event.target.value })
              }
              placeholder={field.placeholder}
              className="field"
            />
          ) : (
            <input
              required={field.required}
              value={values[field.key] ?? ""}
              onChange={(event) =>
                onChange({ ...values, [field.key]: event.target.value })
              }
              placeholder={field.placeholder}
              className="field"
            />
          )}
        </label>
      ))}
    </div>
  );
}

/* --------------------------------------------- inline builder (creation) */

/**
 * Building up a whole list from scratch - used on the "new lecturer" form,
 * where an administrator has to enter every category before the account can
 * be appointed at all (see FR-INS-201). Entries already added are shown as
 * removable cards above the fields for the next one; the "Add" control stays
 * disabled until every required field for THIS entry is filled, and the
 * category as a whole is satisfied once `entries.length` is at least one -
 * `InviteForm` reads that to decide whether the whole form can submit.
 */
export function EntryListBuilder({
  fields,
  entries,
  onChange,
  addLabel,
}: {
  fields: EntryField[];
  entries: EntryValues[];
  onChange: (next: EntryValues[]) => void;
  addLabel: string;
}) {
  const [draft, setDraft] = useState<EntryValues>(() => emptyValues(fields));

  const canAdd = fields
    .filter((field) => field.required)
    .every((field) => draft[field.key]?.trim());

  function add() {
    if (!canAdd) return;
    onChange([...entries, draft]);
    setDraft(emptyValues(fields));
  }

  return (
    <div>
      {entries.length ? (
        <ul className="mb-4 space-y-2">
          {entries.map((entry, i) => {
            const summary = summarise(fields, entry);
            return (
              <li
                key={i}
                className="flex items-start justify-between gap-3 rounded-sm border border-surface-deep bg-paper-raised px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{summary.title}</p>
                  {summary.detail ? (
                    <p className={`mt-0.5 ${META.base}`}>{summary.detail}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => onChange(entries.filter((_, index) => index !== i))}
                  className="shrink-0 text-sm font-semibold text-clay"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <EntryFields fields={fields} values={draft} onChange={setDraft} />

      <ActionButton
        type="button"
        variant="line"
        size="sm"
        className={`mt-3 ${canAdd ? "" : "pointer-events-none opacity-40"}`}
        onClick={add}
      >
        <PlusIcon className="size-4" />
        {addLabel}
      </ActionButton>
      {!canAdd ? (
        <p className={`mt-2 ${META.base}`}>
          Fill in the required fields above to add this one.
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------ add/edit/remove (CRUD) */

function EntryForm({
  formId,
  fields,
  initial,
}: {
  formId: string;
  fields: EntryField[];
  initial?: EntryValues;
}) {
  const [values, setValues] = useState<EntryValues>(() => initial ?? emptyValues(fields));
  const [saved, setSaved] = useState(false);

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <EntryFields fields={fields} values={values} onChange={setValues} />

      {saved ? (
        <p
          role="status"
          className="mt-6 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
        >
          Prototype - {initial ? "nothing was changed" : "nothing was added"}.{" "}
          A real save would update the profile a learner reads immediately.
        </p>
      ) : null}
    </form>
  );
}

/** The lecturer's own "Add" control for one category of their profile. */
export function AddEntryAction({
  fields,
  drawerTitle,
  drawerDescription,
  buttonLabel,
  capability,
}: {
  fields: EntryField[];
  drawerTitle: string;
  drawerDescription: string;
  buttonLabel: string;
  capability?: Capability;
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();

  const button = (
    <ActionButton variant="mono" size="sm" onClick={() => setOpen(true)}>
      <PlusIcon className="size-4" />
      {buttonLabel}
    </ActionButton>
  );

  return (
    <>
      {capability ? (
        <IfCan capability={capability} fallback={<LockedNote capability={capability} />}>
          {button}
        </IfCan>
      ) : (
        button
      )}

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={drawerTitle}
        description={drawerDescription}
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Add it
          </ActionButton>
        }
      >
        <EntryForm formId={formId} fields={fields} />
      </Drawer>
    </>
  );
}

export function EditEntryAction({
  fields,
  initial,
  drawerTitle,
  drawerDescription,
}: {
  fields: EntryField[];
  initial: EntryValues;
  drawerTitle: string;
  drawerDescription: string;
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary"
      >
        <EditIcon className="size-4" />
        Edit
      </button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={drawerTitle}
        description={drawerDescription}
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Save changes
          </ActionButton>
        }
      >
        <EntryForm formId={formId} fields={fields} initial={initial} />
      </Drawer>
    </>
  );
}

export function RemoveEntryAction({ question }: { question: string }) {
  return (
    <ConfirmAction
      label="Remove"
      question={question}
      detail="This only changes your own profile - nothing about your account or your assigned modules."
      confirmLabel="Remove it"
      tone="warn"
      done="Prototype - nothing was removed."
      size="table"
    />
  );
}
