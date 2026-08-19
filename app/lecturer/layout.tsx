import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConsoleShell } from "@/components/console/console-shell";
import { consoleAccounts, pendingReviewCount } from "@/lib/admin";

/**
 * The lecturer console.
 *
 * ITS OWN AREA, not the admin console with buttons removed. A lecturer's
 * job is a different job - write the material, see whether it is landing - and
 * the screens for it are different screens rather than a subset. Building it
 * as a subset is how lecturers end up with a learner register they have no
 * business browsing, greyed out but still occupying the second row of the
 * navigation.
 *
 * The shell is the same component in a different configuration, so the two
 * consoles cannot drift apart visually. `components/console/nav.tsx` holds
 * what actually differs.
 */
export const metadata: Metadata = {
  title: { default: "Lecturer", template: "%s · Lecturer" },
};

export default function LecturerLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleShell
      area="lecturer"
      accounts={consoleAccounts()}
      pendingReviews={pendingReviewCount()}
    >
      {children}
    </ConsoleShell>
  );
}
