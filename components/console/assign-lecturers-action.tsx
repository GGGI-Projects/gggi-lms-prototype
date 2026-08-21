"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { Avatar } from "@/components/student-portal/ui";
import { IfCan, LockedNote } from "@/components/console/permission";
import { META } from "@/lib/theme";
import type { Capability } from "@/lib/permissions";

/**
 * Which lecturers may write a module's lectures.
 *
 * The mirror of `AssignModules` in `console/actions.tsx` - that one is a
 * lecturer's own page asking "which modules", this is a module's page asking
 * "which lecturers" - same checkbox-list-and-save shape, read from the other
 * side. Unlike `AssignModules`, unchecking someone here carries no removal
 * warning: the module keeps every lecture already written regardless of who
 * is assigned to write the next one.
 *
 * A DRAWER, not an inline panel, for the same reason `<AttachLectureMaterials>`
 * keeps its picker behind a button - assigning lecturers is an occasional act,
 * while the list of who is already assigned is the thing read every time this
 * page opens.
 */
export function AssignModuleLecturers({
  moduleTitle,
  lecturers,
  assigned,
  capability,
}: {
  moduleTitle: string;
  lecturers: {
    id: string;
    name: string;
    initials: string;
    avatarUrl: string;
    title: string;
  }[];
  /** Ids of the lecturers already on this module. */
  assigned: string[];
  capability: Capability;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(assigned);
  const [saved, setSaved] = useState(false);
  const formId = useId();

  const close = () => {
    setOpen(false);
    setSaved(false);
    setSelected(assigned);
  };

  const toggle = (id: string) => {
    setSaved(false);
    setSelected((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  };

  return (
    <>
      <IfCan
        capability={capability}
        fallback={<LockedNote capability={capability} />}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="link-wipe shrink-0 text-lg font-semibold text-primary"
        >
          Assign
        </button>
      </IfCan>

      <Drawer
        open={open}
        onClose={close}
        title="Assign lecturers"
        description={`Who may write ${moduleTitle}'s lectures. Any number can be checked - a module is not exclusive to one, and every lecturer assigned can write any lecture in it.`}
        size="sm"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Save assignment
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
          <ul className="space-y-3">
            {lecturers.map((lecturer) => {
              const checked = selected.includes(lecturer.id);
              return (
                <li key={lecturer.id}>
                  <label
                    className={`flex cursor-pointer items-center gap-4 rounded-sm border px-5 py-4 transition-colors duration-300 ${
                      checked
                        ? "border-primary bg-tint-mist"
                        : "border-surface-deep bg-paper hover:border-muted-light"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(lecturer.id)}
                      className="checkbox"
                    />
                    <Avatar
                      src={lecturer.avatarUrl}
                      initials={lecturer.initials}
                      tone="light"
                      className="size-9 text-sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-semibold text-ink">
                        {lecturer.name}
                      </span>
                      <span className={`block truncate ${META.base}`}>
                        {lecturer.title}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          {saved ? (
            <p
              role="status"
              className="mt-6 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
            >
              Prototype - {moduleTitle}&rsquo;s lecturers are unchanged, and
              nobody was notified.
            </p>
          ) : null}
        </form>
      </Drawer>
    </>
  );
}
