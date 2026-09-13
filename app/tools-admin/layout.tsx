import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConsoleShell } from "@/components/console/console-shell";
import { consoleAccounts } from "@/lib/admin";
import { sessionNotifications } from "@/lib/comms";

/**
 * The Tools Administrator console (docs/SRS.md §4.31) - the mirror of
 * `/laws-admin`'s own layout, for exactly the same reason. See the note
 * there.
 */
export const metadata: Metadata = {
  title: { default: "Tools admin", template: "%s · Tools admin" },
};

export default function ToolsAdminLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleShell
      area="tools-admin"
      accounts={consoleAccounts()}
      notifications={sessionNotifications()}
    >
      {children}
    </ConsoleShell>
  );
}
