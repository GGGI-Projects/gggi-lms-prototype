import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConsoleShell } from "@/components/console/console-shell";
import { consoleAccounts } from "@/lib/admin";
import { sessionNotifications } from "@/lib/comms";

/**
 * The Provincial Registrar console (docs/SRS.md §4.33).
 *
 * ITS OWN AREA, for the same reason the lecturer console is its own area
 * rather than the admin console with buttons removed - see the long note on
 * `LecturerLayout`. A registrar's job is smaller still: a queue to decide,
 * and the learners that queue has already let in, both narrowed to exactly
 * one province (FR-REG-010). Reusing `/admin/students` and hiding rows with
 * client-side role checks would not actually narrow anything - every `/admin`
 * page is a server component that renders its full data regardless of which
 * viewpoint the rail is on (see the note in `role-context.tsx`), so a hard
 * visibility rule like "this province only" has to live in which route
 * exists, not in which button is greyed out.
 */
export const metadata: Metadata = {
  title: { default: "Registrar", template: "%s · Registrar" },
};

export default function RegistrarLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleShell
      area="registrar"
      accounts={consoleAccounts()}
      notifications={sessionNotifications()}
    >
      {children}
    </ConsoleShell>
  );
}
