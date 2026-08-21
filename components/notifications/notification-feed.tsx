import { Badge, EmptyState, Section } from "@/components/console/ui";
import { CONSOLE, META } from "@/lib/theme";
import { formatDate } from "@/lib/portal";
import { ThreadDrawer } from "@/components/notifications/thread-drawer";
import type { FeedView } from "@/lib/comms";

/**
 * The two sections every notifications page is built from - Announcements,
 * then Messages, newest first in each. A plain, server-safe component: it
 * has no state of its own, only `ThreadDrawer` (nested per message) does,
 * so it can be rendered straight from a server page (the lecturer and
 * student areas) or from a client wrapper that first has to pick which
 * viewpoint's data to hand it (the admin area - see
 * `RoleScopedNotifications`).
 */
export function NotificationFeed({
  view,
  viewerId,
  emptyAnnouncements,
  stackClassName = CONSOLE.stack,
}: {
  view: FeedView;
  viewerId: string;
  /** What to say when there are none - an administrator's viewpoints never
   *  receive an announcement at all (see `announcementsForStaff` in
   *  `lib/comms.ts`), so that page's explanation reads differently from a
   *  lecturer's or a student's "none right now". */
  emptyAnnouncements: string;
  /** The area's own vertical rhythm between the two sections - `CONSOLE.stack`
   *  by default; the student page passes `PORTAL.stack`. */
  stackClassName?: string;
}) {
  return (
    <>
      <Section title="Announcements" className={stackClassName}>
        {view.announcements.length ? (
          <ul className="space-y-3">
            {view.announcements.map((announcement) => (
              <li
                key={announcement.id}
                className="rounded-sm border border-surface-deep bg-paper-raised px-5 py-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-ink">{announcement.title}</p>
                  {announcement.isNew ? <Badge tone="info">New</Badge> : null}
                </div>
                <p className={`mt-1 ${META.base}`}>
                  {announcement.from} · {announcement.audience} ·{" "}
                  {formatDate(announcement.date)}
                </p>
                <p className="mt-3 text-lg leading-relaxed text-ink">{announcement.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Nothing yet" body={emptyAnnouncements} />
        )}
      </Section>

      <Section
        title="Messages"
        className={stackClassName}
        description="Conversations you can reply to - unlike an announcement."
      >
        {view.messages.length ? (
          <ul className="space-y-3">
            {view.messages.map((message) => (
              <li key={message.thread.id}>
                <ThreadDrawer
                  thread={message.thread}
                  viewerId={viewerId}
                  otherName={message.otherName}
                  unread={message.unread}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Nothing yet"
            body="Conversations you're part of will show up here."
          />
        )}
      </Section>
    </>
  );
}
