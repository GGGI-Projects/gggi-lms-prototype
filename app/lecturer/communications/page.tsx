import type { Metadata } from "next";
import { SESSION } from "@/content/staff";
import { staffById } from "@/lib/admin";
import {
  announcementScopesForLecturer,
  feedViewForStaff,
  messageContactsForLecturer,
} from "@/lib/comms";
import { PageBody, PageHeader } from "@/components/console/ui";
import { ComposeAnnouncementAction } from "@/components/notifications/compose-announcement";
import { ComposeMessageAction } from "@/components/notifications/compose-message";
import { NotificationFeed } from "@/components/notifications/notification-feed";

export const metadata: Metadata = { title: "Communications" };

/**
 * A lecturer's own reach - their students, and the administrator who
 * appointed them - AND everything sent to or by them, on the same screen.
 * Narrower than the administration's version of this page on both ends: an
 * announcement only ever goes to their own students (see
 * `announcementScopesForLecturer`), and a message only to those students or
 * to `adminContactFor` - never another lecturer.
 *
 * Used to be split from a separate Notifications page; merged for the same
 * reason as the admin area's version - see the doc comment there.
 *
 * NOT VIEWPOINT-DEPENDENT, unlike the admin area's equivalent page. There is
 * one lecturer role and nothing to switch between here, so this is a plain
 * server component reading `SESSION.lecturer` directly and rendering the
 * shared `NotificationFeed` with one view.
 */
export default function LecturerCommunicationsPage() {
  const member = staffById(SESSION.lecturer);
  if (!member) throw new Error("[lecturer] no session account");

  return (
    <PageBody>
      <PageHeader
        eyebrow="Learners"
        title="Communications"
        lead="Reach your own students, or the administrator who appointed you, and see everything sent to you or by you below."
        actions={
          <>
            <ComposeAnnouncementAction scopes={announcementScopesForLecturer(member)} />
            <ComposeMessageAction contacts={messageContactsForLecturer(member)} />
          </>
        }
      />

      <NotificationFeed
        view={feedViewForStaff(member)}
        viewerId={member.id}
        emptyAnnouncements="Announcements from the administration, and any you send to your own students, will show up here."
      />
    </PageBody>
  );
}
