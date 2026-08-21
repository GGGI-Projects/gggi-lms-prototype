import type { Metadata } from "next";
import { sessionFor } from "@/lib/admin";
import { feedViewForStaff } from "@/lib/comms";
import { PageBody, PageHeader } from "@/components/console/ui";
import { RoleScopedFeed } from "@/components/notifications/role-scoped-feed";

export const metadata: Metadata = { title: "Notifications" };

/**
 * The administration's notifications page.
 *
 * BOTH VIEWPOINTS' DATA IS COMPUTED HERE, on the server, and handed to a
 * client component that picks the live one - see `RoleScopedFeed` and the
 * long note on `AccountIdentity`, the only other screen with the same
 * "who am I right now" problem.
 */
export default function AdminNotificationsPage() {
  const superAdmin = sessionFor("super-admin");
  const admin = sessionFor("admin");

  return (
    <PageBody>
      <PageHeader
        eyebrow="Account"
        title="Notifications"
        lead="Your own conversations with lecturers and students. To send something yourself, see Communications."
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
