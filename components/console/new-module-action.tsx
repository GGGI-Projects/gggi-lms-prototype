"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { NewModuleForm } from "@/components/console/actions";
import { IfCan, LockedNote } from "@/components/console/permission";
import { PlusIcon } from "@/components/console/icons";

/**
 * "Add a module" and the drawer it opens. Same recipe as
 * `<NewProgrammeAction>` and `<NewInstructorAction>` - see the notes there
 * for the shape.
 *
 * GATED ON `authorModules`, NOT `manageProgrammes` - the one place in the
 * console this distinction is load-bearing rather than decorative. An
 * administrator creates the programme; the instructors assigned to it create
 * everything inside it. This control only ever renders on an instructor's own
 * programme page, but it is gated the same way every other "add" control in
 * the console is - shown, not hidden, with the reason underneath for a
 * viewpoint that reaches it without the capability.
 */
export function NewModuleAction({ nextNumber }: { nextNumber: string }) {
  const [open, setOpen] = useState(false);
  const formId = useId();

  return (
    <>
      <ActionButton
        variant="solid"
        size="sm"
        className="group shrink-0"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="size-4" />
        Add a module
      </ActionButton>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Add a module"
        description="Lands as a draft, at the end of the programme. Nobody outside this console sees it until it is written and published."
        size="sm"
        footer={
          <IfCan capability="authorModules">
            <ActionButton type="submit" form={formId} variant="solid" size="sm">
              Add the module
            </ActionButton>
          </IfCan>
        }
      >
        <IfCan
          capability="authorModules"
          fallback={<LockedNote capability="authorModules" />}
        >
          <NewModuleForm nextNumber={nextNumber} formId={formId} />
        </IfCan>
      </Drawer>
    </>
  );
}
