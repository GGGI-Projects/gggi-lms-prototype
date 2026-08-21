import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConsoleShell } from "@/components/console/console-shell";
import { consoleAccounts } from "@/lib/admin";
import { sessionNotifications } from "@/lib/comms";

/**
 * The administration console.
 *
 * `/admin` is a real segment rather than a route group, unlike the student
 * portal's `(studentportal)`. The portal owns the bare paths because it is
 * what a learner thinks the product IS - `/modules` is the catalogue they
 * were sent a link to. The console is a place staff go, and every address in
 * it saying so is worth more than four characters of tidiness: a screenshot,
 * a bookmark or a support ticket carries its own context.
 *
 * There is no auth check, because there is no auth - the same position the
 * portal takes. Every screen is reachable directly, which is what lets any of
 * them be shown without walking through a sign-in first, and the role model is
 * demonstrated by the viewpoint switcher in the rail. See the long note in
 * `components/console/role-context.tsx`.
 */
export const metadata: Metadata = {
  title: { default: "Console", template: "%s · Console" },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Read here, on the server, and handed to the shell - see the note on
  // `ConsoleShell`'s props for why the client half does not look them up.
  return (
    <ConsoleShell
      area="admin"
      accounts={consoleAccounts()}
      notifications={sessionNotifications()}
    >
      {children}
    </ConsoleShell>
  );
}
