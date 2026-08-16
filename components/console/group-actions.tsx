"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { IfCan, LockedNote } from "@/components/console/permission";
import { EditIcon, PlusIcon } from "@/components/console/icons";
import type { ConsoleArea } from "@/components/console/nav";
import type { Capability } from "@/lib/permissions";
import type { MaterialGroup } from "@/content/materials";

/**
 * Opening a shelf, or renaming one already open.
 *
 * ONE FORM, TWO DOORS IN - same device as `content-block-actions.tsx` and
 * `add-question-action.tsx`: `<AddGroupAction>` sits beside the group list on
 * the library page, `<EditGroupAction>` sits on a shelf's own page, opening
 * the same form with `initial` set.
 *
 * A group is a name and a one-line description - see the note on
 * `MaterialGroup` in `content/materials.ts` for why that is all a shelf
 * needs to be: a subject shelf, not an owner, so there is nothing here to
 * configure beyond what it is called and what belongs on it.
 *
 * The capability is derived from `area` rather than passed in, same as
 * `<NewMaterialAction>` beside this on the library page: an administrator
 * opens a shelf under `manageModules`, an instructor under
 * `authorLectures` - the same split the rest of this screen already makes.
 */
function capabilityFor(area: ConsoleArea): Capability {
  return area === "admin" ? "manageModules" : "authorLectures";
}

function GroupForm({
  formId,
  initial,
}: {
  formId: string;
  initial?: MaterialGroup;
}) {
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Name
          </span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Grid and transmission references"
            className="field"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Description
          </span>
          <textarea
            required
            rows={3}
            defaultValue={initial?.description}
            placeholder="One line - shown on the group card and when picking a shelf for a lecture."
            className="field"
          />
        </label>
      </div>

      {saved ? (
        <p
          role="status"
          className="mt-6 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
        >
          Prototype - {initial ? "nothing was changed" : "the group was not opened"}.{" "}
          {initial
            ? "A real save would update the name everywhere it appears."
            : "A real shelf would appear at the end of the list, ready for files."}
        </p>
      ) : null}
    </form>
  );
}

/* -------------------------------------------------------------------- add */

export function AddGroupAction({ area }: { area: ConsoleArea }) {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const capability = capabilityFor(area);

  return (
    <>
      <IfCan
        capability={capability}
        fallback={<LockedNote capability={capability} />}
      >
        <ActionButton
          variant="solid"
          size="sm"
          className="group shrink-0"
          onClick={() => setOpen(true)}
        >
          <PlusIcon className="size-4" />
          New group
        </ActionButton>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Open a group"
        description="A subject shelf, not an owner - anybody on staff can use anything on it once it exists."
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Open the group
          </ActionButton>
        }
      >
        <GroupForm formId={formId} />
      </Drawer>
    </>
  );
}

/* ------------------------------------------------------------------- edit */

export function EditGroupAction({
  group,
  area,
}: {
  group: MaterialGroup;
  area: ConsoleArea;
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const capability = capabilityFor(area);

  return (
    <>
      <IfCan
        capability={capability}
        fallback={<LockedNote capability={capability} />}
      >
        <ActionButton variant="mono" size="sm" onClick={() => setOpen(true)}>
          <EditIcon className="size-4" />
          Edit group
        </ActionButton>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Edit group"
        description={`"${group.name}"`}
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Save changes
          </ActionButton>
        }
      >
        <GroupForm formId={formId} initial={group} />
      </Drawer>
    </>
  );
}
