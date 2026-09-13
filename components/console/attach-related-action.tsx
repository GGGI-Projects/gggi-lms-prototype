"use client";

import { useId, useMemo, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { IfCan, LockedNote } from "@/components/console/permission";
import { PlusIcon, TrashIcon } from "@/components/console/icons";
import { CheckIcon, SearchIcon } from "@/components/student-portal/icons";
import { CARD, META } from "@/lib/theme";

/**
 * Picking a lecture's related Laws or Tools, from its Module's own pool.
 *
 * SAME SHAPE AS `<AttachMaterials>`, deliberately - a lecturer choosing from
 * a bounded shelf and seeing what is already chosen is the same interaction
 * whether the shelf is the materials library or a Module's related pool.
 * What is missing on purpose is the group filter: the materials library is
 * the whole platform's shelf and needs narrowing, but this picker is never
 * shown anything wider than the Module's own pool to begin with
 * (FR-INS-105) - there is nothing left to filter down from.
 *
 * ONE COMPONENT, TWO NOUNS. Laws and Tools are never picked from the same
 * list - each call site passes its own `items`, scoped to one library only -
 * but the picking interaction itself (search, check, see what you chose) is
 * identical, and two copies of it would drift the day only one gets a fix.
 */

export type PickableRelatedItem = {
  id: string;
  title: string;
  /** One line under the title - a Law's reference, a Tool's explanation. */
  detail: string;
  /** Tag labels, for display only - not filtered on here (see the note
   *  above on why there is no group/tag filter in this picker). */
  tags: string[];
};

export function AttachRelatedItems({
  noun,
  items,
  attachedIds,
  capability,
}: {
  /** Drives copy only ("law"/"tool") - never which items are offered. */
  noun: "law" | "tool";
  /** The Module's own related pool for this kind, and nothing wider. */
  items: PickableRelatedItem[];
  /** Ids this lecture already picks - shown checked and un-pickable here,
   *  the same "remove somewhere else, not in the picker" rule
   *  `<AttachMaterials>` follows for a lecture's existing attachments. */
  attachedIds: string[];
  capability: "manageModules" | "authorLectures";
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const directory = noun === "law" ? "library" : "directory";

  return (
    <>
      <IfCan capability={capability} fallback={<LockedNote capability={capability} />}>
        <ActionButton variant="solid" size="sm" onClick={() => setOpen(true)}>
          <PlusIcon className="size-4" />
          Pick related {noun}s
        </ActionButton>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={`Pick related ${noun}s`}
        description={`Only ${noun}s already sharing a tag with this module can be picked here - never the whole ${noun === "law" ? "Law" : "Tool"} ${directory}. To relate a different one, tag the module or the ${noun} with something they share.`}
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Save picks
          </ActionButton>
        }
      >
        <RelatedItemPicker
          items={items}
          attachedIds={attachedIds}
          noun={noun}
          formId={formId}
        />
      </Drawer>
    </>
  );
}

function RelatedItemPicker({
  items,
  attachedIds,
  noun,
  formId,
}: {
  items: PickableRelatedItem[];
  attachedIds: string[];
  noun: string;
  formId: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(false);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter(
      (item) => !needle || item.title.toLowerCase().includes(needle),
    );
  }, [items, query]);

  const toggle = (id: string) => {
    setSaved(false);
    setSelected((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  };

  const chosen = items.filter((item) => selected.includes(item.id));

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        if (chosen.length) setSaved(true);
      }}
    >
      <label className="relative block w-full sm:max-w-xs">
        <span className="sr-only">Search related {noun}s</span>
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-light" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search related ${noun}s`}
          className="field py-2.5 pl-12"
        />
      </label>

      <ul
        data-lenis-prevent
        className={`${CARD} mt-4 max-h-96 divide-y divide-surface-deep overflow-y-auto`}
      >
        {shown.length ? (
          shown.map((item) => {
            const already = attachedIds.includes(item.id);
            const picked = selected.includes(item.id);

            return (
              <li key={item.id}>
                <label
                  className={`flex items-start gap-4 px-5 py-3.5 transition-colors duration-200 ${
                    already ? "cursor-default opacity-60" : "cursor-pointer"
                  } ${picked ? "bg-tint-mist" : already ? "" : "hover:bg-surface/70"}`}
                >
                  <input
                    type="checkbox"
                    checked={picked || already}
                    disabled={already}
                    onChange={() => toggle(item.id)}
                    className="peer sr-only mt-1"
                  />
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-xs border-2 transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
                      picked || already
                        ? "border-primary bg-primary text-paper"
                        : "border-surface-deep bg-paper-raised text-transparent"
                    }`}
                  >
                    <CheckIcon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg text-ink">
                      {item.title}
                    </span>
                    <span className={`block truncate ${META.base}`}>
                      {item.detail}
                    </span>
                    {item.tags.length ? (
                      <span className="mt-1.5 flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-surface-deep bg-paper px-2 py-0.5 text-xs text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                    ) : null}
                  </span>
                  {already ? (
                    <span className={`shrink-0 ${META.base}`}>
                      Already picked
                    </span>
                  ) : null}
                </label>
              </li>
            );
          })
        ) : (
          <li className="px-5 py-10 text-center text-lg text-muted">
            Nothing in the pool matches that.
          </li>
        )}
      </ul>

      {chosen.length ? (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-ink">
            Picking {chosen.length} more {chosen.length === 1 ? noun : `${noun}s`}
          </h3>
          <ul className="mt-3 space-y-2">
            {chosen.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-sm border border-surface-deep bg-paper px-4 py-2.5"
              >
                <CheckIcon className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate text-lg text-ink">
                  {item.title}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="shrink-0 text-sm font-semibold text-clay"
                  aria-label={`Remove ${item.title}`}
                >
                  <TrashIcon className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {saved ? (
        <p
          role="status"
          className="mt-4 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
        >
          Prototype - nothing was saved. Removing a {noun} from a lecture
          never removes it from the module&rsquo;s related pool; it stays
          available to pick again.
        </p>
      ) : null}
    </form>
  );
}
