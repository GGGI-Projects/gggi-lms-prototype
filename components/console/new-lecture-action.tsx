"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { NewLectureForm } from "@/components/console/actions";
import { IfCan, LockedNote } from "@/components/console/permission";
import { PlusIcon } from "@/components/console/icons";

/**
 * "Add a lecture" and the drawer it opens. Same recipe as
 * `<NewModuleAction>` and `<NewLecturerAction>` - see the notes there
 * for the shape.
 *
 * GATED ON `authorLectures`, NOT `manageModules` - the one place in the
 * console this distinction is load-bearing rather than decorative. An
 * administrator creates the module; the lecturers assigned to it create
 * everything inside it. This control only ever renders on a lecturer's own
 * module page, but it is gated the same way every other "add" control in
 * the console is - shown, not hidden, with the reason underneath for a
 * viewpoint that reaches it without the capability.
 */
export function NewLectureAction({ nextNumber }: { nextNumber: string }) {
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
        Add a lecture
      </ActionButton>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Add a lecture"
        description="Lands as a draft, at the end of the module. Nobody outside this console sees it until it is written and published."
        size="sm"
        footer={
          <IfCan capability="authorLectures">
            <ActionButton type="submit" form={formId} variant="solid" size="sm">
              Add the lecture
            </ActionButton>
          </IfCan>
        }
      >
        <IfCan
          capability="authorLectures"
          fallback={<LockedNote capability="authorLectures" />}
        >
          <NewLectureForm nextNumber={nextNumber} formId={formId} />
        </IfCan>
      </Drawer>
    </>
  );
}
