"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { NewProgrammeForm } from "@/components/console/actions";
import { IfCan, LockedNote } from "@/components/console/permission";
import { PlusIcon } from "@/components/console/icons";

/**
 * "New programme" and the drawer it opens. Same recipe as
 * `<NewInstructorAction>` - see the notes there for the shape.
 *
 * Unlike the administrators page, `/admin/programmes` is not itself behind a
 * `<Restricted>` gate - an instructor viewpoint can open it (there is
 * nothing on the page it should not see), just not create from it. So both
 * halves are gated independently here: the drawer's body falls back to
 * `<LockedNote>` in place of the form, and the footer's submit button is
 * withheld entirely rather than left pointing at a form that is not there.
 */
export function NewProgrammeAction({
  instructors,
}: {
  instructors: { id: string; name: string; initials: string }[];
}) {
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
        New programme
      </ActionButton>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Start a programme"
        description="Both administrators and the super administrator can create one. Instructors cannot - they write modules inside programmes that already exist. It opens as a draft, invisible to learners until somebody publishes it."
        size="md"
        footer={
          <IfCan capability="manageProgrammes">
            <ActionButton type="submit" form={formId} variant="solid" size="sm">
              Create as a draft
            </ActionButton>
          </IfCan>
        }
      >
        <IfCan
          capability="manageProgrammes"
          fallback={<LockedNote capability="manageProgrammes" />}
        >
          <NewProgrammeForm instructors={instructors} formId={formId} />
        </IfCan>
      </Drawer>
    </>
  );
}
