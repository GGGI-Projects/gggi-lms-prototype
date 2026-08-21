"use client";

import { useRole } from "@/components/console/role-context";
import { NotificationFeed } from "@/components/notifications/notification-feed";
import type { StaffRole } from "@/lib/permissions";
import type { FeedView } from "@/lib/comms";

/**
 * The admin area's notifications page - the one place `NotificationFeed`
 * cannot simply be rendered by the server page directly, because who "you"
 * are is whichever viewpoint the switcher is on (see the note on
 * `AccountIdentity`, the only other screen with the same problem). The
 * server page computes both viewpoints' data up front and hands them both
 * here; this file's only job is picking the live one.
 */
export function RoleScopedFeed({
  views,
  viewerIds,
}: {
  views: Partial<Record<StaffRole, FeedView>>;
  viewerIds: Partial<Record<StaffRole, string>>;
}) {
  const { role } = useRole();
  const view = views[role] ?? { announcements: [], messages: [] };
  const viewerId = viewerIds[role] ?? "";

  return (
    <NotificationFeed
      view={view}
      viewerId={viewerId}
      emptyAnnouncements="Nobody broadcasts to an administrator on this platform - announcements go from you to lecturers and students. See Communications to send one."
    />
  );
}
