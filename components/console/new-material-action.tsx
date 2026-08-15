"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { UploadMaterial, type PickerGroup } from "@/components/console/material-actions";
import { IfCan, LockedNote } from "@/components/console/permission";
import { PlusIcon } from "@/components/console/icons";
import type { ConsoleArea } from "@/components/console/nav";
import type { Capability } from "@/lib/permissions";

/**
 * "New material" and the drawer it opens. Same recipe as
 * `<NewInstructorAction>`.
 *
 * The gate depends on which console is asking - an administrator uploads
 * under `manageProgrammes`, an instructor under `authorModules` - which is
 * the same split `<MaterialsLibrary>` already makes for the rest of the page,
 * kept here rather than duplicated as a second decision about who may add to
 * the shelf.
 */
export function NewMaterialAction({
  area,
  groups,
}: {
  area: ConsoleArea;
  groups: PickerGroup[];
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const capability: Capability =
    area === "admin" ? "manageProgrammes" : "authorModules";

  return (
    <>
      <ActionButton
        variant="solid"
        size="sm"
        className="group shrink-0"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="size-4" />
        New material
      </ActionButton>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Add a file to the library"
        description="It goes on a shelf, not into a module. Attaching it to a module is a separate act, done from that module - which is what lets one file be used by six of them."
        size="md"
        footer={
          <IfCan capability={capability}>
            <ActionButton type="submit" form={formId} variant="solid" size="sm">
              Add to the library
            </ActionButton>
          </IfCan>
        }
      >
        <IfCan capability={capability} fallback={<LockedNote capability={capability} />}>
          <UploadMaterial groups={groups} formId={formId} />
        </IfCan>
      </Drawer>
    </>
  );
}
