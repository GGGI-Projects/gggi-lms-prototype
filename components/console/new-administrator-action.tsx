"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { InviteForm } from "@/components/console/actions";
import { PlusIcon } from "@/components/console/icons";

/**
 * "New administrator" and the drawer it opens.
 *
 * Same recipe as `<NewLecturerAction>` - see the notes there for why the
 * button sits at the table's edge rather than in a panel below it, and why
 * the submit button lives in the drawer's footer rather than under the
 * fields. What is different here is what is NOT here: no `<IfCan>` wraps
 * either half. The page this renders on is already behind
 * `<Restricted capability="manageAdmins">` - reaching this component at all
 * already proves the viewpoint is the super administrator, so gating it a
 * second time would be checking a fact that cannot be false.
 */
export function NewAdministratorAction() {
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
        New administrator
      </ActionButton>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Appoint an administrator"
        description="They get everything an administrator has except this page, the audit log, and changing platform settings."
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Send the invitation
          </ActionButton>
        }
      >
        <InviteForm kind="administrator" formId={formId} />
      </Drawer>
    </>
  );
}
