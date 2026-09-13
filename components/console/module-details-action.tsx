"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { IfCan, LockedNote } from "@/components/console/permission";
import { EditIcon } from "@/components/console/icons";
import { META } from "@/lib/theme";
import { CATEGORIES, HAZARDS } from "@/content/tags";
import type { Capability } from "@/lib/permissions";

/**
 * A Module's own details and tags - summary, level, Hazards, Categories.
 *
 * A GAP THIS PLATFORM HAD UNTIL FR-MODADM-020: the module editor
 * (`<RenameAction>`) only ever handled the title, and "New module" only ever
 * set tags at creation - nothing let anyone change a Module's tags
 * afterwards, published or draft. `relatedPoolForModule()` in
 * `lib/laws-tools.ts` has read `hazardIds`/`categoryIds` off `ManagedModule`
 * since a Module Administrator needed to set them on a Module that has no
 * public catalogue entry yet (a draft) - this is the form that actually
 * writes them, for a Module Administrator's own module and, unchanged, for
 * the Super Administrator's oversight copy on `/admin/modules/[moduleId]`.
 *
 * TITLE STAYS OUT OF THIS FORM - `<RenameAction>` already owns it, and
 * splitting "the thing typed once in a hurry" from "the things read and
 * reconsidered together" is a distinction this codebase already draws
 * everywhere else a title sits beside a longer form.
 */
export function EditModuleDetails({
  moduleTitle,
  summary,
  level,
  hazardIds: initialHazardIds,
  categoryIds: initialCategoryIds,
  capability,
}: {
  moduleTitle: string;
  summary?: string;
  level: string;
  hazardIds: string[];
  categoryIds: string[];
  capability: Capability;
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hazardIds, setHazardIds] = useState<string[]>(initialHazardIds);
  const [categoryIds, setCategoryIds] = useState<string[]>(initialCategoryIds);
  const formId = useId();

  const close = () => {
    setOpen(false);
    setSaved(false);
    setHazardIds(initialHazardIds);
    setCategoryIds(initialCategoryIds);
  };

  const toggle = (list: string[], set: (next: string[]) => void, id: string) => {
    set(list.includes(id) ? list.filter((entry) => entry !== id) : [...list, id]);
  };

  return (
    <>
      <IfCan capability={capability} fallback={<LockedNote capability={capability} />}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="link-wipe inline-flex items-center gap-1.5 text-lg font-semibold text-primary"
        >
          <EditIcon className="size-4" />
          Edit details
        </button>
      </IfCan>

      <Drawer
        open={open}
        onClose={close}
        title="Edit module details"
        description={`${moduleTitle}'s summary, level and tags. Its title is renamed separately.`}
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Save
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
          <div className="grid gap-5">
            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                Summary
              </span>
              <textarea
                rows={3}
                defaultValue={summary}
                placeholder="One or two sentences, in the words a learner would use about their own job."
                className="field"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-lg font-semibold text-ink">
                Level
              </span>
              <select defaultValue={level} className="field">
                <option>Foundation</option>
                <option>Intermediate</option>
              </select>
            </label>

            <fieldset>
              <legend className="mb-3 text-lg font-semibold text-ink">
                Hazards
              </legend>
              <div className="flex flex-wrap gap-2">
                {HAZARDS.map((hazard) => (
                  <label
                    key={hazard.id}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-surface-deep bg-paper py-1.5 pl-2 pr-4 text-lg text-ink-soft transition-colors hover:border-muted-light"
                  >
                    <input
                      type="checkbox"
                      checked={hazardIds.includes(hazard.id)}
                      onChange={() => toggle(hazardIds, setHazardIds, hazard.id)}
                      className="checkbox"
                    />
                    {hazard.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-lg font-semibold text-ink">
                Categories
              </legend>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <label
                    key={category.id}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-surface-deep bg-paper py-1.5 pl-2 pr-4 text-lg text-ink-soft transition-colors hover:border-muted-light"
                  >
                    <input
                      type="checkbox"
                      checked={categoryIds.includes(category.id)}
                      onChange={() => toggle(categoryIds, setCategoryIds, category.id)}
                      className="checkbox"
                    />
                    {category.label}
                  </label>
                ))}
              </div>
              <p className={`mt-3 ${META.base}`}>
                A hazard or a category tag is how this module reaches the Law
                and Tool libraries - one in common is enough (BR-26). Neither
                list is required, but a module with no tags at all shows no
                related laws or tools anywhere it appears.
              </p>
            </fieldset>
          </div>

          {saved ? (
            <p
              role="status"
              className="mt-6 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
            >
              Prototype - {moduleTitle}&rsquo;s details are unchanged.
            </p>
          ) : null}
        </form>
      </Drawer>
    </>
  );
}
