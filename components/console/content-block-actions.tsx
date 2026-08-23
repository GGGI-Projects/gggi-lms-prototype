"use client";

import { useId, useState, type ReactNode } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { ConfirmAction } from "@/components/console/actions";
import { Drawer } from "@/components/console/drawer";
import { IfCan, LockedNote } from "@/components/console/permission";
import {
  BoldIcon,
  BulletListIcon,
  EditIcon,
  ItalicIcon,
  LinkIcon,
  NumberedListIcon,
  PlusIcon,
  QuoteIcon,
  UnderlineIcon,
} from "@/components/console/icons";
import { META } from "@/lib/theme";
import type { ContentBlock } from "@/content/curriculum";
import type { Capability } from "@/lib/permissions";

/**
 * Writing a block - a video or a piece of reading, added to a lecture
 * or opened to change what is already there.
 *
 * ONE PAIR OF FORMS, TWO DOORS IN. `<AddContentBlockActions>` is the two
 * buttons under a lecture's block list; `<EditContentBlockAction>` is the
 * "Edit block" control on a block already written, opening the same form
 * with `initial` set. A block that can be added and a block that can be
 * edited are not two different things to build - the second is the first
 * with values already in the fields.
 *
 * Nothing here saves. Same rule as every other write in this console: the
 * form is real, the fields behave, and the ending says what a finished
 * platform would have done - because the prototype's job is the shape of the
 * screen an author would actually work in, not a working document store.
 */

/** What a control says after it has been used. */
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

/** Every block a lecture can hold, minus the one this screen never edits here -
 *  materials are attached from the library, not authored as a block. */
type EditableBlock = Exclude<ContentBlock, { type: "materials" }>;

/* ------------------------------------------------------------------ video */

function VideoBlockForm({
  initial,
  formId,
}: {
  initial?: Extract<EditableBlock, { type: "video" }>;
  /** See the note on `InviteForm`'s `formId` in `actions.tsx` - same device:
   *  a drawer's footer submits a form that lives in the scrollable body
   *  above it. Omit for a standalone form, which keeps its own button. */
  formId?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");

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
          <span className="mb-2 block text-lg font-semibold text-ink">Title</span>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Generation, transmission, distribution"
            className="field"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            The recording
          </span>
          <span className="flex flex-col items-center justify-center rounded-sm border border-dashed border-muted-light bg-paper px-6 py-10 text-center">
            <PlusIcon className="size-6 text-muted-light" />
            <span className="mt-3 block text-lg text-ink">
              Drop a video here, or choose one
            </span>
            <span className={`mt-1 block ${META.base}`}>
              MP4, or a link to where it is already hosted. 2 GB per file.
            </span>
            <input type="file" className="mt-4 max-w-full text-sm text-muted" />
          </span>
        </label>

        <label className="block max-w-40">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Minutes
          </span>
          <input
            type="number"
            min={1}
            defaultValue={initial?.minutes ?? 10}
            className="field"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Caption
          </span>
          <textarea
            rows={3}
            defaultValue={initial?.caption}
            placeholder="What a learner would otherwise get from the first thirty seconds of it."
            className="field"
          />
        </label>
      </div>

      {!formId ? (
        <div className="mt-7">
          <ActionButton type="submit" variant="solid" size="sm">
            {initial ? "Save changes" : "Add the block"}
          </ActionButton>
        </div>
      ) : null}

      {saved ? (
        <DoneNote>
          Prototype - {initial ? "nothing was changed" : "the block was not added"}.{" "}
          {initial
            ? "A real save would update what a learner sees immediately."
            : "A real block would land at the end of the content list, ready to reorder."}
        </DoneNote>
      ) : null}
    </form>
  );
}

/* ------------------------------------------------------------------- text */

/** One square button on the toolbar below - see the note on
 *  `FormattingToolbar` for why it does nothing.
 *
 *  Solid `text-ink` at rest, not the fainter `text-ink-soft` most icon
 *  buttons in this console use - those sit next to their own visible label
 *  text, this is the only thing in its row, and at `text-ink-soft` on the
 *  toolbar's `bg-surface` the glyphs read as barely-there.
 *
 *  `pointer-events-none`, ON PURPOSE - not just `tabIndex={-1}`. The Drawer
 *  this sits in slides into place with a CSS `transition-transform`; a
 *  browser only recomputes `:hover` on an actual pointer event, not on
 *  every animated frame, so a button that ends its slide-in sitting under
 *  wherever the cursor happened to be when the drawer's trigger was clicked
 *  can be left showing a `:hover` style it never really earned, and it then
 *  stays stuck that way until the next real mouse move happens to land
 *  somewhere that clears it - which is what the user saw and reported as
 *  "hovering the text field highlights the buttons". A functioning button
 *  would need real interaction to fix that properly; a decorative one that
 *  does nothing on click has no reason to run any risk of it at all -
 *  `pointer-events-none` removes it from hit-testing entirely, so `:hover`
 *  (and this stale-hover class of bug) can never match it, full stop. */
function ToolbarButton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      tabIndex={-1}
      className="pointer-events-none grid size-8 shrink-0 place-items-center rounded-sm text-ink"
    >
      {children}
    </button>
  );
}

/** A hairline between two groups of buttons - bold/italic/underline sit apart
 *  from the list controls, which sit apart from quote/link, the same
 *  grouping a real editor's toolbar draws with a divider rather than a gap
 *  alone. */
function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-surface-deep" />;
}

/**
 * Sits above the Passage field as its own bordered strip, `mb-2` of daylight
 * between the two - NOT fused flush on top of it. An earlier version shared
 * the field's own border (`rounded-t-none` on the field, no bottom border on
 * the toolbar) to read as one continuous control; the user reported hovering
 * the field itself appeared to light up the buttons, and with the two now
 * fully separate boxes there is no shared edge left for that to happen on -
 * keep the gap if this is touched again, don't re-fuse them.
 *
 * DELIBERATELY INERT, same as before. The user's own words: "no need to
 * work... want to look like a text editor." The Passage field is a plain
 * `<textarea>` - there is no rich-text model underneath for Bold to act on,
 * and wiring these up to mutate raw text (wrapping a selection in
 * `**`/`*`/markdown) would be a half-built markdown editor nobody asked for,
 * a different and much bigger feature than "the drawer should look like a
 * text editor." Every button is `type="button"` (never accidentally submits
 * the form) and `tabIndex={-1}` (a keyboard user tabbing through the form
 * skips straight to the field itself, not seven buttons that do nothing).
 */
function FormattingToolbar() {
  return (
    <div
      aria-hidden="true"
      className="mb-2 flex flex-wrap items-center gap-0.5 rounded-sm border border-surface-deep bg-surface px-2 py-1.5"
    >
      <ToolbarButton label="Bold">
        <BoldIcon className="size-4.5" />
      </ToolbarButton>
      <ToolbarButton label="Italic">
        <ItalicIcon className="size-4.5" />
      </ToolbarButton>
      <ToolbarButton label="Underline">
        <UnderlineIcon className="size-4.5" />
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton label="Bulleted list">
        <BulletListIcon className="size-4.5" />
      </ToolbarButton>
      <ToolbarButton label="Numbered list">
        <NumberedListIcon className="size-4.5" />
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton label="Quote">
        <QuoteIcon className="size-4.5" />
      </ToolbarButton>
      <ToolbarButton label="Link">
        <LinkIcon className="size-4.5" />
      </ToolbarButton>
    </div>
  );
}

function TextBlockForm({
  initial,
  formId,
}: {
  initial?: Extract<EditableBlock, { type: "text" }>;
  formId?: string;
}) {
  const [saved, setSaved] = useState(false);
  const [heading, setHeading] = useState(initial?.heading ?? "");

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
            Heading
          </span>
          <input
            required
            value={heading}
            onChange={(event) => setHeading(event.target.value)}
            placeholder="The evening peak is the problem"
            className="field"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Passage
          </span>
          <FormattingToolbar />
          <textarea
            required
            rows={8}
            defaultValue={initial?.body}
            placeholder="One heading, one passage - never a wall. Say the thing this block exists to say."
            className="field"
          />
        </label>
      </div>

      {!formId ? (
        <div className="mt-7">
          <ActionButton type="submit" variant="solid" size="sm">
            {initial ? "Save changes" : "Add the block"}
          </ActionButton>
        </div>
      ) : null}

      {saved ? (
        <DoneNote>
          Prototype - {initial ? "nothing was changed" : "the block was not added"}.{" "}
          {initial
            ? "A real save would update what a learner sees immediately."
            : "A real block would land at the end of the content list, ready to reorder."}
        </DoneNote>
      ) : null}
    </form>
  );
}

/* -------------------------------------------------------------------- add */

/**
 * The two ways a lecture gains a block, each its own button and its own
 * drawer - not one "Add a block" control with a kind picker inside it, which
 * would hide the choice this screen most wants an author to see: a lecture is
 * a video, or an argument written out, and which one comes next is a
 * decision made here, not on a second screen.
 */
export function AddContentBlockActions({
  capability,
}: {
  capability: Capability;
}) {
  const [open, setOpen] = useState<"video" | "text" | null>(null);
  const videoFormId = useId();
  const textFormId = useId();

  return (
    <>
      <IfCan
        capability={capability}
        fallback={<LockedNote capability={capability} />}
      >
        <div className="flex flex-wrap gap-2">
          <ActionButton
            variant="mono"
            size="sm"
            onClick={() => setOpen("video")}
          >
            <PlusIcon className="size-4" />
            Add a video block
          </ActionButton>
          <ActionButton
            variant="mono"
            size="sm"
            onClick={() => setOpen("text")}
          >
            <PlusIcon className="size-4" />
            Add a written section
          </ActionButton>
        </div>
      </IfCan>

      <Drawer
        open={open === "video"}
        onClose={() => setOpen(null)}
        title="Add a video block"
        description="A recorded video. The title and the minutes are what the block list shows; the caption is what a learner reads before pressing play."
        size="md"
        footer={
          <ActionButton
            type="submit"
            form={videoFormId}
            variant="solid"
            size="sm"
          >
            Add the block
          </ActionButton>
        }
      >
        <VideoBlockForm formId={videoFormId} />
      </Drawer>

      <Drawer
        open={open === "text"}
        onClose={() => setOpen(null)}
        title="Add a written section"
        description="One heading, one passage - never a wall. This is the argument, written out."
        size="md"
        footer={
          <ActionButton
            type="submit"
            form={textFormId}
            variant="solid"
            size="sm"
          >
            Add the block
          </ActionButton>
        }
      >
        <TextBlockForm formId={textFormId} />
      </Drawer>
    </>
  );
}

/* ------------------------------------------------------------------- edit */

/** A block already written, opened to change it. */
export function EditContentBlockAction({
  block,
  capability,
}: {
  block: EditableBlock;
  capability: Capability;
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const name = block.type === "video" ? block.title : block.heading;

  return (
    <>
      <IfCan capability={capability}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary"
        >
          <EditIcon className="size-4" />
          Edit block
        </button>
      </IfCan>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={block.type === "video" ? "Edit video block" : "Edit written section"}
        description={`"${name}"`}
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Save changes
          </ActionButton>
        }
      >
        {block.type === "video" ? (
          <VideoBlockForm formId={formId} initial={block} />
        ) : (
          <TextBlockForm formId={formId} initial={block} />
        )}
      </Drawer>
    </>
  );
}

/* ----------------------------------------------------------------- remove */

/**
 * A block, taken out of the lecture.
 *
 * `<ConfirmAction>`, not a bare "Remove" - a written block is not a checkbox
 * left over from before the library existed, it is writing, and the console's
 * own rule is that anything hard to undo asks a second time and names the
 * thing being acted on. `table` keeps the trigger at the same scale as "Edit
 * block" beside it rather than the full-panel size this control wears in a
 * sidebar.
 */
export function RemoveContentBlockAction({
  block,
  capability,
}: {
  block: EditableBlock;
  capability: Capability;
}) {
  const name = block.type === "video" ? block.title : block.heading;

  return (
    <IfCan capability={capability}>
      <ConfirmAction
        label="Remove block"
        question={`Remove "${name}"?`}
        detail="Its writing goes with it. Learners already past this block keep their progress; the lecture simply reads shorter from here."
        confirmLabel="Remove it"
        tone="warn"
        done="Prototype - the block is unchanged."
        size="table"
      />
    </IfCan>
  );
}
