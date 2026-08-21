"use client";

import { useRole } from "@/components/console/role-context";
import { EmptyState } from "@/components/console/ui";
import { META } from "@/lib/theme";
import { formatDate } from "@/lib/portal";
import type { StaffRole } from "@/lib/permissions";
import type { SentAnnouncementView } from "@/lib/comms";

/**
 * An administrator's own sent log - viewpoint-dependent the same way the
 * notifications page is, and for the same reason: `staff-admin-1` and
 * `staff-super` are different accounts with different histories, and the
 * switcher's choice lives in client state.
 */
export function RoleScopedSentLog({
  log,
}: {
  log: Partial<Record<StaffRole, SentAnnouncementView[]>>;
}) {
  const { role } = useRole();
  const items = log[role] ?? [];

  if (!items.length) {
    return (
      <EmptyState
        title="Nothing sent yet"
        body="Announcements you send from this viewpoint will be logged here."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-sm border border-surface-deep bg-paper-raised px-5 py-4"
        >
          <p className="text-lg font-semibold text-ink">{item.title}</p>
          <p className={`mt-1 ${META.base}`}>
            {item.audience} · {formatDate(item.date)}
          </p>
          <p className="mt-3 text-lg leading-relaxed text-ink">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
