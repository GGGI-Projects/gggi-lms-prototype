import type { Metadata } from "next";
import { SESSION } from "@/content/staff";
import { staffById } from "@/lib/admin";
import { feedViewForStaff } from "@/lib/comms";
import { PageBody, PageHeader } from "@/components/console/ui";
import { NotificationFeed } from "@/components/notifications/notification-feed";

export const metadata: Metadata = { title: "Notifications" };

/**
 * Everything sent to this lecturer - announcements from the administration,
 * and their own conversations.
 *
 * NOT VIEWPOINT-DEPENDENT, unlike the admin area's equivalent page. There is
 * one lecturer role and nothing to switch between here, so this is a plain
 * server component reading `SESSION.lecturer` directly and rendering the
 * shared `NotificationFeed` with one view - see
 * `app/admin/notifications/page.tsx` for the viewpoint-switching version.
 */
export default function LecturerNotificationsPage() {
  const member = staffById(SESSION.lecturer);
  if (!member) throw new Error("[lecturer] no session account");

  return (
    <PageBody>
      <PageHeader
        eyebrow="Account"
        title="Notifications"
        lead="What the administration has sent you, and your own conversations. To send something yourself, see Communications."
      />
      <NotificationFeed
        view={feedViewForStaff(member)}
        viewerId={member.id}
        emptyAnnouncements="Announcements from the administration will show up here."
      />
    </PageBody>
  );
}
