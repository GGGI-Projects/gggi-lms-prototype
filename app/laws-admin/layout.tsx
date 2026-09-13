import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConsoleShell } from "@/components/console/console-shell";
import { consoleAccounts } from "@/lib/admin";
import { sessionNotifications } from "@/lib/comms";

/**
 * The Laws Administrator console (docs/SRS.md §4.30).
 *
 * ITS OWN AREA even though the role is global, not instance-scoped, unlike
 * the lecturer/registrar/module-admin areas this mirrors. The client's own
 * description keeps this role "deliberately narrow: this role does not
 * touch Modules, lecturers, or learners at all" - and the shared `/admin`
 * shell's dashboard and its mostly-ungated "Students"/"Modules"/"Lecturers"
 * rows would hand it exactly that reach if this role opened it there. So the
 * boundary here is not "which Law can you see" (every Law, always - that is
 * the job) but "which OTHER screens can you reach at all" - none.
 */
export const metadata: Metadata = {
  title: { default: "Laws admin", template: "%s · Laws admin" },
};

export default function LawsAdminLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleShell
      area="laws-admin"
      accounts={consoleAccounts()}
      notifications={sessionNotifications()}
    >
      {children}
    </ConsoleShell>
  );
}
