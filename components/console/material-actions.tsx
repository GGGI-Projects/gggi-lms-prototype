"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { CARD, META } from "@/lib/theme";
import { CheckIcon, SearchIcon } from "@/components/student-portal/icons";
import { PlusIcon, TrashIcon } from "@/components/console/icons";

/**
 * Putting something on the shelf, and taking something off it into a lecture.
 *
 * These are the two interactions the library exists for, and they are written
 * together because they are two halves of one decision: whether the thing you
 * need is already there. The picker therefore opens on the LIBRARY, not on an
 * upload field - "upload a file" is the fallback, not the default, and a
 * picker that leads with a drop zone teaches people to upload a fourth copy of
 * the unit cost table.
 *
 * Nothing uploads and nothing attaches. Both say so once used.
 */

/** The shape the server hands down. Deliberately flat - no data imports here. */
export type PickerMaterial = {
  id: string;
  title: string;
  kind: string;
  size?: string;
  groupId: string;
  groupName: string;
  /** How many lectures already attach it. Shown so the shelf reads as used. */
  uses: number;
};

export type PickerGroup = {
  id: string;
  name: string;
  description: string;
  count: number;
};

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

/* ------------------------------------------------------------------ upload */

/**
 * Add a file to the library.
 *
 * THE GROUP IS REQUIRED. An upload with no shelf is how a library becomes a
 * folder called "misc" holding two hundred files, and the person who can
 * answer "which group does this belong on" is the person uploading it, at the
 * moment they upload it - never afterwards.
 */
export function UploadMaterial({
  groups,
  onCancelHref,
  formId,
}: {
  groups: PickerGroup[];
  /** Where "cancel" goes. Absent on a page that is only this form. */
  onCancelHref?: string;
  /** See the note on `InviteForm`'s `formId` - same device: a drawer's footer
   *  submits a form that lives in the scrollable body above it. Omit for a
   *  standalone form, which keeps its own inline button. */
  formId?: string;
}) {
  const [saved, setSaved] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [group, setGroup] = useState(groups[0]?.id ?? "");

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(title.trim() || "the file");
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-lg font-semibold text-ink">
            The file
          </span>
          <span className="flex flex-col items-center justify-center rounded-sm border border-dashed border-muted-light bg-paper px-6 py-10 text-center">
            <PlusIcon className="size-6 text-muted-light" />
            <span className="mt-3 block text-lg text-ink">
              Drop a file here, or choose one
            </span>
            <span className={`mt-1 block ${META.base}`}>
              PDF, slides, spreadsheet, dataset or a recording. 200 MB per file.
            </span>
            <input type="file" className="mt-4 max-w-full text-sm text-muted" />
          </span>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Title
          </span>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What a learner will see it called"
            className="field"
          />
          <span className={`mt-2 block ${META.base}`}>
            This is the name on the learner&rsquo;s download list, and it is how
            the platform tracks where the file is used. Two files cannot share
            one.
          </span>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-lg font-semibold text-ink">
            What it is
          </span>
          <textarea
            rows={2}
            placeholder="One sentence. What it contains and who it is for."
            className="field"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Group
          </span>
          <select
            value={group}
            onChange={(event) => setGroup(event.target.value)}
            className="field"
          >
            {groups.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name} ({entry.count})
              </option>
            ))}
          </select>
          <span className={`mt-2 block ${META.base}`}>
            {groups.find((entry) => entry.id === group)?.description}
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Language
          </span>
          <select className="field" defaultValue="English">
            <option>English</option>
          </select>
          <span className={`mt-2 block ${META.base}`}>
            Learners are told which language a handout is in before they open
            it.
          </span>
        </label>
      </div>

      {!formId ? (
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <ActionButton type="submit" variant="solid" size="sm">
            Add to the library
          </ActionButton>
          {onCancelHref ? (
            <a href={onCancelHref} className="text-lg font-semibold text-primary">
              <span className="link-wipe">Cancel</span>
            </a>
          ) : null}
        </div>
      ) : null}

      {saved ? (
        <DoneNote>
          Prototype - {saved} was not uploaded and the library is unchanged. A
          real upload would appear on the shelf immediately and be available to
          every lecturer.
        </DoneNote>
      ) : null}
    </form>
  );
}

/* ------------------------------------------------------------------ picker */

/**
 * Attach material to a lecture, from the shelf.
 *
 * Search, or narrow to a group first - the group filter is what covers "this
 * lecture needs the whole waste-templates set" without a second, separate way
 * of doing the same thing. Whatever is checked lands in the same list
 * underneath, which is what the lecture will attach.
 *
 * Removing something here does not delete it from the library, and the screen
 * says so - that confusion is the single most likely misunderstanding of a
 * shared shelf, and it is the one that loses somebody else's file.
 */
export function AttachMaterials({
  materials,
  groups,
  attached,
  uploadHref,
  formId,
}: {
  materials: PickerMaterial[];
  groups: PickerGroup[];
  /** Titles the lecture already attaches. */
  attached: string[];
  uploadHref: string;
  /** See the note on `InviteForm`'s `formId` - same device: a drawer's
   *  footer submits this from below the scrollable body. Omit for a
   *  standalone picker, which keeps its own inline button. */
  formId?: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [saved, setSaved] = useState(false);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return materials.filter((material) => {
      const inGroup = group === "all" || material.groupId === group;
      const matches =
        !needle ||
        material.title.toLowerCase().includes(needle) ||
        material.groupName.toLowerCase().includes(needle);
      return inGroup && matches;
    });
  }, [materials, query, group]);

  const toggle = (id: string) => {
    setSaved(false);
    setSelected((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  };

  const chosen = materials.filter((material) => selected.includes(material.id));

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        if (chosen.length) setSaved(true);
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Search the library</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-light" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the library"
            className="field py-2.5 pl-12"
          />
        </label>

        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">Filter by group</span>
          <select
            value={group}
            onChange={(event) => setGroup(event.target.value)}
            className="field py-2.5"
          >
            <option value="all">Every group</option>
            {groups.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul
        data-lenis-prevent
        className={`${CARD} mt-4 max-h-96 divide-y divide-surface-deep overflow-y-auto`}
      >
        {shown.length ? (
          shown.map((material) => {
            const already = attached.includes(material.title);
            const picked = selected.includes(material.id);

            return (
              <li key={material.id}>
                <label
                  className={`flex items-center gap-4 px-5 py-3.5 transition-colors duration-200 ${already ? "cursor-default opacity-60" : "cursor-pointer"
                    } ${picked ? "bg-tint-mist" : already ? "" : "hover:bg-surface/70"}`}
                >
                  <input
                    type="checkbox"
                    checked={picked || already}
                    disabled={already}
                    onChange={() => toggle(material.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`grid size-5 shrink-0 place-items-center rounded-xs border-2 transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
                      picked || already
                        ? "border-primary bg-primary text-paper"
                        : "border-surface-deep bg-paper-raised text-transparent"
                    }`}
                  >
                    <CheckIcon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg text-ink">
                      {material.title}
                    </span>
                    <span className={`block truncate ${META.base}`}>
                      {material.groupName}
                      {material.size ? ` · ${material.size}` : null}
                      {material.uses
                        ? ` · used by ${material.uses} ${material.uses === 1 ? "lecture" : "lectures"}`
                        : " · not used yet"}
                    </span>
                  </span>
                  {already ? (
                    <span className={`shrink-0 ${META.base}`}>
                      Already attached
                    </span>
                  ) : null}
                </label>
              </li>
            );
          })
        ) : (
          <li className="px-5 py-10 text-center text-lg text-muted">
            Nothing on the shelf matches that.{" "}
            <a href={uploadHref} className="link-wipe font-semibold text-primary">
              Upload a new file
            </a>
            .
          </li>
        )}
      </ul>

      {/* --------------------------------------------------- what is chosen */}
      {chosen.length ? (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-ink">
            Attaching {chosen.length} {chosen.length === 1 ? "file" : "files"}
          </h3>
          <ul className="mt-3 space-y-2">
            {chosen.map((material) => (
              <li
                key={material.id}
                className="flex items-center gap-3 rounded-sm border border-surface-deep bg-paper px-4 py-2.5"
              >
                <CheckIcon className="size-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate text-lg text-ink">
                  {material.title}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(material.id)}
                  className="shrink-0 text-sm font-semibold text-clay"
                  aria-label={`Remove ${material.title}`}
                >
                  <TrashIcon className="size-4" />
                </button>
              </li>
            ))}
          </ul>

          {!formId ? (
            <div className="mt-5">
              <ActionButton type="submit" variant="solid" size="sm">
                Attach to this lecture
              </ActionButton>
            </div>
          ) : null}
        </div>
      ) : null}

      {saved ? (
        <DoneNote>
          Prototype - nothing was attached. Removing a file from a lecture never
          deletes it from the library; it stays on its shelf for every other
          lecture that uses it.
        </DoneNote>
      ) : null}

      <p className={`mt-6 ${META.base}`}>
        Nothing on the shelf?{" "}
        <a href={uploadHref} className="link-wipe font-semibold text-primary">
          Upload a new file
        </a>{" "}
        - it goes into the library, so the next person writing about the same
        thing finds it.
      </p>
    </form>
  );
}
