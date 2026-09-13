import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConsoleShell } from "@/components/console/console-shell";
import { consoleAccounts } from "@/lib/admin";
import { sessionNotifications } from "@/lib/comms";

/**
 * The Module Administrator console (docs/SRS.md §4.29).
 *
 * ITS OWN AREA, for the same reason the lecturer and registrar consoles are
 * each their own area rather than the admin console with buttons removed -
 * see the long note on `ConsoleShell`. A Module Administrator's own module
 * detail page is naturally scoped already (the URL names the one Module it
 * is about), but the SURROUNDING screens are not: `/admin/reviews` and
 * `/admin/certificates` show every Module's, and `/admin` itself is the
 * whole platform's dashboard. A hard "this Module (or these Modules) only"
 * boundary has to live in which routes exist, not in which button is greyed
 * out.
 */
export const metadata: Metadata = {
  title: { default: "Module admin", template: "%s · Module admin" },
};

export default function ModuleAdminLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleShell
      area="module-admin"
      accounts={consoleAccounts()}
      notifications={sessionNotifications()}
    >
      {children}
    </ConsoleShell>
  );
}
