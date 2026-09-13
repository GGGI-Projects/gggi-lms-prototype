"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { IfCan, LockedNote } from "@/components/console/permission";
import { EditIcon, PlusIcon } from "@/components/console/icons";
import { META } from "@/lib/theme";
import { CATEGORIES, HAZARDS } from "@/content/tags";
import { PROVINCES, type Law } from "@/content/laws";

/**
 * Opening a Law, or editing one already in the library.
 *
 * ONE FORM, TWO DOORS IN - same device as `group-actions.tsx`: `<AddLawAction>`
 * sits on the library list, `<EditLawAction>` sits on a Law's own page,
 * opening the same form with `initial` set.
 *
 * SCOPE IS A TOGGLE, NOT A SECOND FORM. A Law is either national - it applies
 * everywhere, and naming individual provinces under it would say the opposite
 * of what "national" means - or scoped to one or more named provinces. Ticking
 * "Applies nationally" hides the province list rather than leaving it there to
 * be half-filled and ignored (see `LawScope` in `content/laws.ts`).
 *
 * Laws Administration has no lecturer-facing side, unlike the Materials
 * Library - the capability is fixed at `manageLaws`, not derived from an
 * `area` prop.
 */

function LawForm({ formId, initial }: { formId: string; initial?: Law }) {
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [national, setNational] = useState(
    initial ? initial.scope === "national" : true,
  );
  const [provinces, setProvinces] = useState<string[]>(
    initial && initial.scope !== "national" ? initial.scope : [],
  );
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
            placeholder="National Environmental Act"
            className="field"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Summary
          </span>
          <textarea
            required
            rows={3}
            defaultValue={initial?.summary}
            placeholder="One or two sentences - what it covers, and why a learner would want to read it."
            className="field"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Reference
          </span>
          <input
            defaultValue={initial?.reference}
            placeholder="No. 47 of 1980, as amended"
            className="field"
          />
          <span className={`mt-2 block ${META.base}`}>
            An Act number, or a plain note where the document is a policy
            rather than an Act.
          </span>
        </label>

        <fieldset>
          <legend className="mb-3 text-lg font-semibold text-ink">
            Where it applies
          </legend>
          <label className="flex cursor-pointer items-center gap-2.5 text-lg text-ink-soft">
            <input
              type="checkbox"
              checked={national}
              onChange={(event) => setNational(event.target.checked)}
              className="checkbox"
            />
            Applies nationally (every province)
          </label>

          {!national ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {PROVINCES.map((province) => (
                <label
                  key={province}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-surface-deep bg-paper py-1.5 pl-2 pr-4 text-lg text-ink-soft transition-colors hover:border-muted-light"
                >
                  <input
                    type="checkbox"
                    checked={provinces.includes(province)}
                    onChange={() => toggle(provinces, setProvinces, province)}
                    className="checkbox"
                  />
                  {province}
                </label>
              ))}
            </div>
          ) : null}
        </fieldset>

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
            A hazard or a category tag is how this Law reaches a Module - one
            in common is enough (see BR-26). Neither list is required, but a
            Law with no tags at all will not appear on any Module&rsquo;s page.
          </p>
        </fieldset>
      </div>

      {saved ? (
        <p
          role="status"
          className="mt-6 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
        >
          Prototype - {initial ? "nothing was changed" : "the law was not added"}.{" "}
          {initial
            ? "A real save would update it everywhere it already appears."
            : "A real one would start as a draft, invisible to learners until published."}
        </p>
      ) : null}
    </form>
  );
}

/* -------------------------------------------------------------------- add */

export function AddLawAction() {
  const [open, setOpen] = useState(false);
  const formId = useId();

  return (
    <>
      <IfCan capability="manageLaws" fallback={<LockedNote capability="manageLaws" />}>
        <ActionButton
          variant="solid"
          size="sm"
          className="group shrink-0"
          onClick={() => setOpen(true)}
        >
          <PlusIcon className="size-4" />
          New law
        </ActionButton>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Add a law"
        description="It starts as a draft, invisible to learners and unrelated to any module until it is tagged and published."
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Add as a draft
          </ActionButton>
        }
      >
        <LawForm formId={formId} />
      </Drawer>
    </>
  );
}

/* ------------------------------------------------------------------- edit */

export function EditLawAction({ law }: { law: Law }) {
  const [open, setOpen] = useState(false);
  const formId = useId();

  return (
    <>
      <IfCan capability="manageLaws" fallback={<LockedNote capability="manageLaws" />}>
        <ActionButton variant="mono" size="sm" onClick={() => setOpen(true)}>
          <EditIcon className="size-4" />
          Edit
        </ActionButton>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Edit law"
        description={`"${law.title}"`}
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Save changes
          </ActionButton>
        }
      >
        <LawForm formId={formId} initial={law} />
      </Drawer>
    </>
  );
}
