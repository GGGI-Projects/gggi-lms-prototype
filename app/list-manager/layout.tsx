import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConsoleShell } from "@/components/console/console-shell";
import { consoleAccounts } from "@/lib/admin";
import { sessionNotifications } from "@/lib/comms";

/**
 * The List Manager console (docs/SRS.md §4.32) - the mirror of
 * `/laws-admin`'s own layout, for exactly the same reason. See the note
 * there. The client has flagged this role as possibly unnecessary on its
 * own (Appendix D, item 7) - giving it its own area rather than folding it
 * into another role's console keeps that question answerable later without
 * having to first untangle it from somewhere else's screens.
 */
export const metadata: Metadata = {
  title: { default: "List manager", template: "%s · List manager" },
};

export default function ListManagerLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleShell
      area="list-manager"
      accounts={consoleAccounts()}
      notifications={sessionNotifications()}
    >
      {children}
    </ConsoleShell>
  );
}
