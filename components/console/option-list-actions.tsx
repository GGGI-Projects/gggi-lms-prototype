"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { IfCan, LockedNote } from "@/components/console/permission";
import { EditIcon, PlusIcon } from "@/components/console/icons";
import { META } from "@/lib/theme";
import type { OptionList, OptionValue } from "@/content/tags";

/**
 * Adding a list, adding a value to one, or renaming a value already in one -
 * three small forms, all gated on `manageOptionLists`.
 *
 * NO REORDER HERE, on purpose. FR-LIST-010 names it, but this prototype's own
 * pattern for a not-yet-built interaction (see `content-block-actions.tsx`,
 * `add-question-action.tsx`) is to say so plainly rather than fake a working
 * drag or a pair of arrow buttons that do nothing real - the same restraint
 * applies here, not a lower bar for this screen specifically.
 *
 * RETIRING IS A TOGGLE, NOT A DRAWER - unlike archiving a whole Law or Tool,
 * which the platform frames as consequential enough to need a confirmation
 * step. A single tag value is lower-stakes and instantly reversible (BR-11's
 * "hidden, not erased" rule applies here too), so `<RetireValueAction>` acts
 * directly, the same weight as a filter toggle.
 */

function ValueForm({
  formId,
  initial,
}: {
  formId: string;
  initial?: OptionValue;
}) {
  const [saved, setSaved] = useState(false);
  const [label, setLabel] = useState(initial?.label ?? "");

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <label className="block">
        <span className="mb-2 block text-lg font-semibold text-ink">
          Label
        </span>
        <input
          required
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Extreme Heat"
          className="field"
        />
        <span className={`mt-2 block ${META.base}`}>
          Shown wherever this tag appears - a Module&rsquo;s tags, a Law or
          Tool&rsquo;s own, and every filter built from this list.
        </span>
      </label>

      {saved ? (
        <p
          role="status"
          className="mt-6 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
        >
          Prototype - {initial ? "nothing was renamed" : "nothing was added"}.{" "}
          {initial
            ? "A real rename would update the label everywhere it already appears."
            : "A real value would appear at the end of the list immediately, ready to be picked."}
        </p>
      ) : null}
    </form>
  );
}

function ListForm({ formId }: { formId: string }) {
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <label className="block">
        <span className="mb-2 block text-lg font-semibold text-ink">
          List name
        </span>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Sectors"
          className="field"
        />
        <span className={`mt-2 block ${META.base}`}>
          Its own group in every tagging picker, alongside Hazards and
          Categories - it starts empty, ready for its first value.
        </span>
      </label>

      {saved ? (
        <p
          role="status"
          className="mt-6 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
        >
          Prototype - {name.trim() || "the new list"} was not opened. A real
          one would appear here immediately, empty and ready for values.
        </p>
      ) : null}
    </form>
  );
}

/* --------------------------------------------------------------- add list */

export function AddListAction() {
  const [open, setOpen] = useState(false);
  const formId = useId();

  return (
    <>
      <IfCan
        capability="manageOptionLists"
        fallback={<LockedNote capability="manageOptionLists" />}
      >
        <ActionButton
          variant="mono"
          size="sm"
          className="group shrink-0"
          onClick={() => setOpen(true)}
        >
          <PlusIcon className="size-4" />
          New list
        </ActionButton>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Open a new list"
        description="Alongside Hazards and Categories, not instead of them - every existing tag stays exactly as it was."
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Open the list
          </ActionButton>
        }
      >
        <ListForm formId={formId} />
      </Drawer>
    </>
  );
}

/* -------------------------------------------------------------- add value */

export function AddValueAction({ list }: { list: OptionList }) {
  const [open, setOpen] = useState(false);
  const formId = useId();

  return (
    <>
      <IfCan
        capability="manageOptionLists"
        fallback={<LockedNote capability="manageOptionLists" />}
      >
        <ActionButton
          variant="solid"
          size="sm"
          className="group shrink-0"
          onClick={() => setOpen(true)}
        >
          <PlusIcon className="size-4" />
          Add to {list.name}
        </ActionButton>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={`Add to ${list.name}`}
        description="It appears in every tagging picker immediately, ready to be picked on a Module, a Law or a Tool."
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Add it
          </ActionButton>
        }
      >
        <ValueForm formId={formId} />
      </Drawer>
    </>
  );
}

/* ------------------------------------------------------------- edit value */

export function EditValueAction({
  list,
  value,
}: {
  list: OptionList;
  value: OptionValue;
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();

  return (
    <>
      <IfCan
        capability="manageOptionLists"
        fallback={<LockedNote capability="manageOptionLists" />}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary"
        >
          <EditIcon className="size-3.5" />
          Rename
        </button>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={`Rename in ${list.name}`}
        description={`"${value.label}"`}
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Save the new label
          </ActionButton>
        }
      >
        <ValueForm formId={formId} initial={value} />
      </Drawer>
    </>
  );
}

/* ---------------------------------------------------------- retire value */

export function RetireValueAction({ value }: { value: OptionValue }) {
  const [saved, setSaved] = useState(false);

  return (
    <IfCan
      capability="manageOptionLists"
      fallback={<LockedNote capability="manageOptionLists" />}
    >
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={() => setSaved(true)}
          className="shrink-0 text-sm font-semibold text-clay"
        >
          {value.active ? "Retire" : "Restore"}
        </button>
        {saved ? (
          <span className={META.base}>Prototype - unchanged</span>
        ) : null}
      </div>
    </IfCan>
  );
}
