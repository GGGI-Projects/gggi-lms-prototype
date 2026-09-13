"use client";

import { useId, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Drawer } from "@/components/console/drawer";
import { InviteForm, type AppointableRole } from "@/components/console/actions";
import { PlusIcon } from "@/components/console/icons";
import { ROLE_LABEL, ROLE_SUMMARY } from "@/lib/permissions";

/** Every role the Super Administrator can appoint from this drawer - every
 *  appointable role except Lecturer, which has its own dedicated "New
 *  lecturer" action on `/admin/lecturers` and its own module (see
 *  `<NewLecturerAction>`) - a lecturer is appointed from where the eye
 *  already is when the question comes up, the same reasoning that action's
 *  own doc comment gives. */
const APPOINTABLE: Exclude<AppointableRole, "lecturer">[] = [
  "module-admin",
  "laws-admin",
  "tools-admin",
  "list-manager",
  "provincial-registrar",
];

/**
 * "New staff" and the drawer it opens - one entry point for every one of the
 * five appointed console roles (FR-SA-010), replacing what used to be a
 * single "New administrator" button for the one flat role that no longer
 * exists (BR-31).
 *
 * THE ROLE PICKER IS THE FIRST QUESTION, deliberately above the name and
 * email fields it changes the shape of - a Provincial Registrar's form has a
 * province field a List Manager's does not, and asking "who are you
 * appointing" before "what are their details" is the order the question
 * actually gets decided in.
 *
 * Same recipe as `<NewLecturerAction>` otherwise - see the notes there for
 * why the button sits at the table's edge rather than in a panel below it,
 * and why the submit button lives in the drawer's footer rather than under
 * the fields. No `<IfCan>` wraps either half: the page this renders on is
 * already behind `<Restricted capability="manageAdmins">` - reaching this
 * component at all already proves the viewpoint is the super administrator.
 */
export function NewStaffAction({
  modules,
}: {
  modules: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Exclude<AppointableRole, "lecturer">>(
    "module-admin",
  );
  const formId = useId();

  const close = () => {
    setOpen(false);
    setRole("module-admin");
  };

  return (
    <>
      <ActionButton
        variant="solid"
        size="sm"
        className="group shrink-0"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="size-4" />
        New staff
      </ActionButton>

      <Drawer
        open={open}
        onClose={close}
        title={`Appoint a ${ROLE_LABEL[role].toLowerCase()}`}
        description={ROLE_SUMMARY[role]}
        size="md"
        footer={
          <ActionButton type="submit" form={formId} variant="solid" size="sm">
            Send the invitation
          </ActionButton>
        }
      >
        <label className="mb-7 block">
          <span className="mb-2 block text-lg font-semibold text-ink">
            Role
          </span>
          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value as Exclude<AppointableRole, "lecturer">)
            }
            className="field"
          >
            {APPOINTABLE.map((entry) => (
              <option key={entry} value={entry}>
                {ROLE_LABEL[entry]}
              </option>
            ))}
          </select>
        </label>

        {/* `key={role}` resets the form's own state when the role changes -
            switching from Module Administrator to List Manager should not
            carry a half-filled module picker across into a form with no
            module field to show it in. */}
        <InviteForm key={role} kind={role} modules={modules} formId={formId} />
      </Drawer>
    </>
  );
}
