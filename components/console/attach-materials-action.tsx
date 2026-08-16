"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import {
  AttachMaterials,
  UploadMaterial,
  type PickerGroup,
  type PickerMaterial,
} from "@/components/console/material-actions";
import { IfCan, LockedNote } from "@/components/console/permission";
import { PlusIcon } from "@/components/console/icons";
import type { Capability } from "@/lib/permissions";

/**
 * The two ways a lecture gains a material, both behind a button rather than
 * left open on the page.
 *
 * THE PICKER USED TO SIT HERE PERMANENTLY, and it was the busiest thing on
 * the lecture screen - a search field, a group filter and a scrolling list of
 * most of the shelf, sitting under a list of what is already attached, which
 * is the thing this section is actually for and the thing read every time
 * the page is opened. Reaching for more is occasional; an occasional act
 * belongs behind a button, not staged open beneath something read constantly.
 *
 * TWO BUTTONS, NOT ONE, because attaching a shelf file and adding a new one
 * to the library are different acts with different endings - one closes
 * having gained a file on this lecture, the other closes having gained one on
 * the shelf, still unattached to anything. Naming both here is what tells an
 * instructor the second one exists at all.
 */
export function AttachLectureMaterials({
  materials,
  groups,
  attached,
  uploadHref,
  capability,
}: {
  materials: PickerMaterial[];
  groups: PickerGroup[];
  /** Titles the lecture already attaches. */
  attached: string[];
  uploadHref: string;
  /** What a role needs to use either drawer. */
  capability: Capability;
}) {
  const [open, setOpen] = useState<"library" | "upload" | null>(null);
  const libraryFormId = useId();
  const uploadFormId = useId();

  return (
    <>
      <IfCan
        capability={capability}
        fallback={<LockedNote capability={capability} />}
      >
        <div className="flex flex-wrap gap-3">
          <ActionButton
            variant="solid"
            size="sm"
            onClick={() => setOpen("library")}
          >
            <PlusIcon className="size-4" />
            Add from the library
          </ActionButton>
          <ActionButton
            variant="mono"
            size="sm"
            onClick={() => setOpen("upload")}
          >
            <PlusIcon className="size-4" />
            Upload a file
          </ActionButton>
        </div>
      </IfCan>

      <Drawer
        open={open === "library"}
        onClose={() => setOpen(null)}
        title="Attach from the library"
        description="Search the shelf or narrow it to a group, then check whatever this lecture needs. Uploading is the fallback, not the first move."
        size="md"
        footer={
          <ActionButton
            type="submit"
            form={libraryFormId}
            variant="solid"
            size="sm"
          >
            Attach to this lecture
          </ActionButton>
        }
      >
        <AttachMaterials
          materials={materials}
          groups={groups}
          attached={attached}
          uploadHref={uploadHref}
          formId={libraryFormId}
        />
      </Drawer>

      <Drawer
        open={open === "upload"}
        onClose={() => setOpen(null)}
        title="Add a file to the library"
        description="It goes on a shelf, not into this lecture. Attaching it is a separate act - once it is on the shelf, close this and use &ldquo;Add from the library&rdquo;."
        size="md"
        footer={
          <ActionButton
            type="submit"
            form={uploadFormId}
            variant="solid"
            size="sm"
          >
            Add to the library
          </ActionButton>
        }
      >
        <UploadMaterial groups={groups} formId={uploadFormId} />
      </Drawer>
    </>
  );
}
