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
import { RoleScopedFeed } from "@/components/notifications/role-scoped-feed";

export const metadata: Metadata = { title: "Communications" };

/**
 * Reaching lecturers or students, AND reading what came back - one screen,
 * not two. This used to be split from a separate Notifications page (compose
 * here, read/reply there); merged because the split added a second
 * destination for one connected idea with no real benefit - replying never
 * happened here even before the merge, since a message thread only ever had
 * one "reply" box, so folding the read side in didn't reintroduce that risk.
 *
 * BOTH VIEWPOINTS' DATA IS COMPUTED HERE, on the server, and handed to a
 * client component that picks the live one - see `RoleScopedFeed` and the
 * long note on `AccountIdentity`, the only other screen with the same
 * "who am I right now" problem.
 *
 * The compose actions are NOT viewpoint-dependent - an administrator may
 * address every lecturer or every student regardless of which admin account
 * is doing it, so `announcementScopesForAdmin()` / `messageContactsForAdmin()`
 * are the same for both.
 */
export default function AdminCommunicationsPage() {
  const superAdmin = sessionFor("super-admin");
  const admin = sessionFor("admin");

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

      <RoleScopedFeed
        views={{
          "super-admin": feedViewForStaff(superAdmin),
          admin: feedViewForStaff(admin),
        }}
        viewerIds={{ "super-admin": superAdmin.id, admin: admin.id }}
      />
    </PageBody>
  );
}
