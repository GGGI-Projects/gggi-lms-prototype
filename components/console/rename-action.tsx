"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { IfCan, LockedNote } from "@/components/console/permission";
import { EditIcon } from "@/components/console/icons";
import type { Capability } from "@/lib/permissions";

/**
 * Renaming a module or a lecture.
 *
 * ONE COMPONENT FOR BOTH SUBJECTS, same device as `<EditGroupAction>`: what
 * changes between "this module's title" and "this lecture's title" is a word
 * and a capability, both passed in, so this cannot drift into two forms that
 * used to agree.
 *
 * Neither `<LectureEditor>` nor the module's own settings panel treats its
 * own title as a field - both were built around everything BELOW the name,
 * on the assumption that a title is fixed at creation. This is the one place
 * that assumption is wrong: a title gets typed once, in a hurry, and is the
 * first thing anyone notices needs a second look.
 */
export function RenameAction({
  subject,
  title,
  capability,
}: {
  /** Lower-case, singular - "module" or "lecture". Used in the drawer's copy. */
  subject: string;
  title: string;
  capability: Capability;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(title);
  const [saved, setSaved] = useState(false);
  const formId = useId();

  const close = () => {
    setOpen(false);
    setSaved(false);
    setName(title);
  };

  return (
    <>
      <IfCan
        capability={capability}
        fallback={<LockedNote capability={capability} />}
      >
        <ActionButton variant="mono" size="sm" onClick={() => setOpen(true)}>
          <EditIcon className="size-4" />
          Edit title
        </ActionButton>
      </IfCan>

      <Drawer
        open={open}
        onClose={close}
        title={`Rename this ${subject}`}
        description={`"${title}"`}
        size="sm"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Save changes
          </ActionButton>
        }
      >
        <form
          id={formId}
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(true);
          }}
        >
          <label className="block">
            <span className="mb-2 block text-lg font-semibold text-ink">
              Title
            </span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="field"
            />
          </label>

          {saved ? (
            <p
              role="status"
              className="mt-6 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
            >
              Prototype - the {subject}&rsquo;s title is unchanged. A real save
              would update it everywhere this {subject} is named.
            </p>
          ) : null}
        </form>
      </Drawer>
    </>
  );
}
