import type { Metadata } from "next";
import { LEARNER, ENROLMENTS } from "@/content/portal";
import { studentById } from "@/lib/admin";
import { adminContactForStudent, feedViewForStudent, messageContactsForStudent } from "@/lib/comms";
import { BODY, CARD, HEADING, PORTAL } from "@/lib/theme";
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
 *
 * Reaching the administration is a SEPARATE, always-available channel, not
 * folded into that same picker - a learner has no module-enrolment
 * relationship to an administrator the way they do to a lecturer, so there
 * is exactly one account it goes to (`adminContactForStudent`) and it is
 * never conditional on enrolment. Presented as its own card sitting above
 * the Announcements/Messages tabs (`NotificationFeed`'s `beforeTabs`) rather
 * than another header button or something buried inside the Messages tab -
 * it isn't Announcements or Messages content itself, and living inside one
 * tab would make it disappear whenever the other tab is open.
 */
export default function NotificationsPage() {
  const enrolledModuleIds = ENROLMENTS.map((enrolment) => enrolment.moduleId);
  const student = studentById(LEARNER.id);
  const contacts = student ? messageContactsForStudent(student) : [];
  const admin = adminContactForStudent();

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
        beforeTabs={
          <div className={`${CARD} px-6 py-5`}>
            <p className={HEADING.card}>Contact GreenFin admin</p>
            <p className={`mt-2 measure-wide ${BODY.base}`}>
              The official channel to the administration - for anything a lecturer
              can&apos;t help with: billing, certificates, account access, or a concern
              about a lecturer.
            </p>
            <div className="mt-4">
              <ComposeMessageAction
                contacts={[{ id: admin.id, label: admin.name }]}
                preselectedId={admin.id}
                buttonLabel="Contact GreenFin admin"
                drawerTitle={`Message ${admin.name}`}
                drawerDescription="They can reply - this starts a conversation with the administration, not a broadcast."
              />
            </div>
          </div>
        }
      />
    </PageBody>
  );
}
