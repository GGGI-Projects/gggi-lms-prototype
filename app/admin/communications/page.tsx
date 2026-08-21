import type { Metadata } from "next";
import Link from "next/link";
import { sessionFor } from "@/lib/admin";
import {
  announcementScopesForAdmin,
  messageContactsForAdmin,
  sentAnnouncementViewsFor,
} from "@/lib/comms";
import { BODY, CONSOLE } from "@/lib/theme";
import { PageBody, PageHeader, Section } from "@/components/console/ui";
import { ComposeAnnouncementAction } from "@/components/notifications/compose-announcement";
import { ComposeMessageAction } from "@/components/notifications/compose-message";
import { RoleScopedSentLog } from "@/components/notifications/role-scoped-sent-log";

export const metadata: Metadata = { title: "Communications" };

/**
 * Sending an announcement or a message - the section the notification
 * system exists to feed. WRITING ONLY: replies to anything sent from here
 * live on the Notifications page, not this one - a message thread shown in
 * both places would be one conversation with two different "reply" boxes.
 *
 * The compose actions are NOT viewpoint-dependent - an administrator may
 * address every lecturer or every student regardless of which admin account
 * is doing it, so `announcementScopesForAdmin()` / `messageContactsForAdmin()`
 * are the same for both. Only the sent log below differs by who is looking,
 * which is why that alone is wrapped in a client component that reads the
 * live viewpoint.
 */
export default function AdminCommunicationsPage() {
  const superAdmin = sessionFor("super-admin");
  const admin = sessionFor("admin");

  return (
    <PageBody>
      <PageHeader
        eyebrow="People"
        title="Communications"
        lead="Reach lecturers or students directly. Replies to anything you send show up in your notifications."
        actions={
          <>
            <ComposeAnnouncementAction scopes={announcementScopesForAdmin()} />
            <ComposeMessageAction contacts={messageContactsForAdmin()} />
          </>
        }
      />

      <Section title="Sent announcements" className={CONSOLE.stack}>
        <p className={`mb-4 ${BODY.base}`}>
          Only announcements - message threads and their replies are on your{" "}
          <Link href="/admin/notifications" className="font-semibold text-primary">
            <span className="link-wipe">notifications page</span>
          </Link>
          .
        </p>
        <RoleScopedSentLog
          log={{
            "super-admin": sentAnnouncementViewsFor(superAdmin.id),
            admin: sentAnnouncementViewsFor(admin.id),
          }}
        />
      </Section>
    </PageBody>
  );
}
