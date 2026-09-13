import type { Metadata } from "next";
import { sessionFor } from "@/lib/admin";
import {
  announcementScopesForAdmin,
  feedViewForStaff,
  messageContactsForAdmin,
} from "@/lib/comms";
import { PageBody, PageHeader } from "@/components/console/ui";
import { ComposeAnnouncementAction } from "@/components/notifications/compose-announcement";
import { ComposeMessageAction } from "@/components/notifications/compose-message";
import { NotificationFeed } from "@/components/notifications/notification-feed";

export const metadata: Metadata = { title: "Communications" };

/**
 * Reaching lecturers or students, AND reading what came back - one screen,
 * not two. This used to be split from a separate Notifications page (compose
 * here, read/reply there); merged because the split added a second
 * destination for one connected idea with no real benefit - replying never
 * happened here even before the merge, since a message thread only ever had
 * one "reply" box, so folding the read side in didn't reintroduce that risk.
 *
 * A PLAIN SERVER PAGE, not a role-scoped client one - it used to compute both
 * the super administrator's and the (now-retired) flat administrator's own
 * feeds and hand both to a client component that picked the live one, back
 * when the `admin` area could render as either. Now the `admin` area only
 * ever renders as `super-admin` (BR-31), there is exactly one feed to
 * compute, so this reads it once, here, the ordinary way.
 */
export default function AdminCommunicationsPage() {
  const superAdmin = sessionFor("super-admin");

  return (
    <PageBody>
      <PageHeader
        eyebrow="People"
        title="Communications"
        lead="Reach lecturers or students directly, and see everything sent to you or by you below."
        actions={
          <>
            <ComposeAnnouncementAction scopes={announcementScopesForAdmin()} />
            <ComposeMessageAction contacts={messageContactsForAdmin()} />
          </>
        }
      />

      <NotificationFeed
        view={feedViewForStaff(superAdmin)}
        viewerId={superAdmin.id}
        emptyAnnouncements="Nobody broadcasts to the super administrator on this platform - announcements go from you to lecturers and students. Send one above and it'll show up here, marked as sent by you."
      />
    </PageBody>
  );
}
