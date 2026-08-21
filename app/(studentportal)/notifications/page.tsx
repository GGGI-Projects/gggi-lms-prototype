import type { Metadata } from "next";
import { LEARNER, ENROLMENTS } from "@/content/portal";
import { studentById } from "@/lib/admin";
import { feedViewForStudent, messageContactsForStudent } from "@/lib/comms";
import { PORTAL } from "@/lib/theme";
import { PageBody, PageHeader } from "@/components/student-portal/ui";
import { NotificationFeed } from "@/components/notifications/notification-feed";
import { ComposeMessageAction } from "@/components/notifications/compose-message";

export const metadata: Metadata = { title: "Notifications" };

/**
 * Announcements from a learner's lecturers and the administration, and
 * their own conversations - reached from the bell, same as the console.
 *
 * "Message a lecturer" only ever offers lecturers teaching a module this
 * learner is actually enrolled in - see `messageContactsForStudent`. A
 * learner who has never enrolled in anything sees no button at all, which
 * `ComposeMessageAction` handles on its own.
 */
export default function NotificationsPage() {
  const enrolledModuleIds = ENROLMENTS.map((enrolment) => enrolment.moduleId);
  const student = studentById(LEARNER.id);
  const contacts = student ? messageContactsForStudent(student) : [];

  return (
    <PageBody>
      <PageHeader
        eyebrow="Account"
        title="Notifications"
        lead="Announcements from your lecturers and the administration, and your own conversations."
        actions={
          <ComposeMessageAction
            contacts={contacts}
            buttonLabel="Message a lecturer"
            drawerTitle="Message a lecturer"
            drawerDescription="They can reply - this starts a conversation, not a broadcast."
          />
        }
      />
      <NotificationFeed
        view={feedViewForStudent(LEARNER.id, enrolledModuleIds)}
        viewerId={LEARNER.id}
        emptyAnnouncements="Announcements from your lecturers and the administration will show up here."
        stackClassName={PORTAL.stack}
      />
    </PageBody>
  );
}
