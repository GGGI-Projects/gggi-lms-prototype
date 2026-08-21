import type { Metadata } from "next";
import Link from "next/link";
import { SESSION } from "@/content/staff";
import { staffById } from "@/lib/admin";
import {
  announcementScopesForLecturer,
  messageContactsForLecturer,
  sentAnnouncementViewsFor,
} from "@/lib/comms";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { EmptyState, PageBody, PageHeader, Section } from "@/components/console/ui";
import { ComposeAnnouncementAction } from "@/components/notifications/compose-announcement";
import { ComposeMessageAction } from "@/components/notifications/compose-message";
import { formatDate } from "@/lib/portal";

export const metadata: Metadata = { title: "Communications" };

/**
 * A lecturer's own reach - their students, and the administrator who
 * appointed them. Narrower on both ends than the administration's version
 * of this page: an announcement only ever goes to their own students (see
 * `announcementScopesForLecturer`), and a message only to those students or
 * to `adminContactFor` - never another lecturer.
 */
export default function LecturerCommunicationsPage() {
  const member = staffById(SESSION.lecturer);
  if (!member) throw new Error("[lecturer] no session account");

  const sent = sentAnnouncementViewsFor(member.id);

  return (
    <PageBody>
      <PageHeader
        eyebrow="Learners"
        title="Communications"
        lead="Reach your own students, or the administrator who appointed you. Replies show up in your notifications."
        actions={
          <>
            <ComposeAnnouncementAction scopes={announcementScopesForLecturer(member)} />
            <ComposeMessageAction contacts={messageContactsForLecturer(member)} />
          </>
        }
      />

      <Section title="Sent announcements" className={CONSOLE.stack}>
        <p className={`mb-4 ${BODY.base}`}>
          Only announcements - message threads and their replies are on your{" "}
          <Link href="/lecturer/notifications" className="font-semibold text-primary">
            <span className="link-wipe">notifications page</span>
          </Link>
          .
        </p>
        {sent.length ? (
          <ul className="space-y-3">
            {sent.map((item) => (
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
        ) : (
          <EmptyState
            title="Nothing sent yet"
            body="Announcements you send to your students will be logged here."
          />
        )}
      </Section>
    </PageBody>
  );
}
