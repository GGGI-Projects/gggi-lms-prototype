"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { IfCan, LockedNote } from "@/components/console/permission";
import { EditIcon, PlusIcon } from "@/components/console/icons";
import { META } from "@/lib/theme";
import { CATEGORIES, HAZARDS } from "@/content/tags";
import type { Tool } from "@/content/tools";

/**
 * Opening a Tool, or editing one already in the directory.
 *
 * SAME SHAPE AS `<AddLawAction>`/`<EditLawAction>` (see `law-actions.tsx`) -
 * one form behind two doors in, gated on its own capability. What is
 * missing here, on purpose, is a scope toggle: a Tool carries no province
 * (FR-STU-630), so there is nothing for it to apply to beyond existing at
 * all. A "Reference" field becomes "Link", since a Tool is not a document to
 * cite but an outside resource to point at.
 */

function ToolForm({ formId, initial }: { formId: string; initial?: Tool }) {
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [hazardIds, setHazardIds] = useState<string[]>(initial?.hazardIds ?? []);
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initial?.categoryIds ?? [],
  );

  const toggle = (list: string[], set: (next: string[]) => void, id: string) => {
    set(list.includes(id) ? list.filter((entry) => entry !== id) : [...list, id]);
  };

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
            Title
          </span>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Climate Risk Screening Tool"
            className="field"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Link
          </span>
          <input
            required
            type="url"
            defaultValue={initial?.link}
            placeholder="https://tools.example.lk/climate-risk-screening"
            className="field"
          />
          <span className={`mt-2 block ${META.base}`}>
            An outside resource - opening it leaves the platform. This
            directory keeps the link and the explanation current, not the
            tool itself.
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            How to use it
          </span>
          <textarea
            required
            rows={3}
            defaultValue={initial?.explanation}
            placeholder="One or two sentences - what it does, and what task it is for."
            className="field"
          />
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
            A hazard or a category tag is how this Tool reaches a Module - one
            in common is enough (see BR-26). Neither list is required, but a
            Tool with no tags at all will not appear on any Module&rsquo;s
            page.
          </p>
        </fieldset>
      </div>

      {saved ? (
        <p
          role="status"
          className="mt-6 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
        >
          Prototype - {initial ? "nothing was changed" : "the tool was not added"}.{" "}
          {initial
            ? "A real save would update it everywhere it already appears."
            : "A real one would start as a draft, invisible to learners until published."}
        </p>
      ) : null}
    </form>
  );
}

/* -------------------------------------------------------------------- add */

export function AddToolAction() {
  const [open, setOpen] = useState(false);
  const formId = useId();

  return (
    <>
      <IfCan capability="manageTools" fallback={<LockedNote capability="manageTools" />}>
        <ActionButton
          variant="solid"
          size="sm"
          className="group shrink-0"
          onClick={() => setOpen(true)}
        >
          <PlusIcon className="size-4" />
          New tool
        </ActionButton>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Add a tool"
        description="It starts as a draft, invisible to learners and unrelated to any module until it is tagged and published."
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Add as a draft
          </ActionButton>
        }
      >
        <ToolForm formId={formId} />
      </Drawer>
    </>
  );
}

/* ------------------------------------------------------------------- edit */

export function EditToolAction({ tool }: { tool: Tool }) {
  const [open, setOpen] = useState(false);
  const formId = useId();

  return (
    <>
      <IfCan capability="manageTools" fallback={<LockedNote capability="manageTools" />}>
        <ActionButton variant="mono" size="sm" onClick={() => setOpen(true)}>
          <EditIcon className="size-4" />
          Edit
        </ActionButton>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Edit tool"
        description={`"${tool.title}"`}
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Save changes
          </ActionButton>
        }
      >
        <ToolForm formId={formId} initial={tool} />
      </Drawer>
    </>
  );
}
