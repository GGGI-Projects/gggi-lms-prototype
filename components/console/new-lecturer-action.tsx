"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { InviteForm } from "@/components/console/actions";
import { IfCan, LockedNote } from "@/components/console/permission";
import { PlusIcon } from "@/components/console/icons";
import type { Capability } from "@/lib/permissions";

/**
 * "New lecturer" and the drawer it opens, kept as one component rather than
 * a boolean threaded between two.
 *
 * IT USED TO BE A PANEL BELOW THE TABLE, past every row already appointed. A
 * register is read top to bottom, and the thing that adds to it belongs where
 * the eye already is when the question "is so-and-so on here yet" turns into
 * "then add them" - beside the search box, not forty rows and a scroll away.
 *
 * The drawer's content is gated the same way the old panel was: shown to
 * every role, with the form itself replaced by `<LockedNote>` for a role that
 * cannot appoint one. A control that opens onto an explanation is still worth
 * opening. THE GATE IS APPLIED TWICE - once around the fields, once around the
 * footer's submit button - because they are now two separate places in the
 * tree: a role that cannot appoint a lecturer must not be left looking at
 * a "Send the invitation" button with no form behind it to submit.
 *
 * The submit button itself lives in the drawer's FOOTER rather than under the
 * fields, wired to the form by id (`<form id={formId}>` … `<button
 * form={formId}>`) rather than by nesting - the native way to put a submit
 * control somewhere other than inside the form it submits. `useId()` rather
 * than a hand-written string, so two of these never collide if this ever
 * renders twice on one page.
 */
export function NewLecturerAction({
  modules,
  capability = "manageLecturers",
  description = "The super administrator can appoint one. Assigning modules now is optional - it can be done later from their page. Their public profile is not: bio, qualifications, experience, publications and achievements are all required before the account can be created.",
}: {
  modules: { id: string; title: string }[];
  /** `manageLecturers` (platform-wide, the default) on `/admin/lecturers`,
   *  or `manageModuleLecturers` (scoped to one module, FR-MODADM-050) from a
   *  Module Administrator's own module page. */
  capability?: Capability;
  description?: string;
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
        New lecturer
      </ActionButton>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Add a lecturer"
        description={description}
        // The basics plus a full public profile - `lg` is what a form this
        // long needs, and the footer's submit button stays put below it
        // regardless of how far the fields scroll.
        size="lg"
        footer={
          <IfCan capability={capability}>
            <ActionButton type="submit" form={formId} variant="solid" size="sm">
              Send the invitation
            </ActionButton>
          </IfCan>
        }
      >
        <IfCan capability={capability} fallback={<LockedNote capability={capability} />}>
          <InviteForm kind="lecturer" modules={modules} formId={formId} />
        </IfCan>
      </Drawer>
    </>
  );
}
