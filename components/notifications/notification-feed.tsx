"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { EmptyState } from "@/components/console/ui";
import { CheckIcon } from "@/components/student-portal/icons";
import { CONSOLE, META } from "@/lib/theme";
import { formatDate } from "@/lib/portal";
import { FilledTag, NewTag } from "@/components/notifications/filled-tag";
import { ThreadDrawer } from "@/components/notifications/thread-drawer";
import type { FeedView } from "@/lib/comms";

type TabId = "announcements" | "messages";

/**
 * The two views every notification-reading screen is built from -
 * Announcements and Messages, switched by a tab rather than stacked as two
 * always-visible sections (that was the original shape; switched to tabs so
 * a screen with plenty of both doesn't force scrolling past one to reach
 * the other). Used by the student area's dedicated Notifications page and
 * by the admin/lecturer Communications pages, which fold reading and
 * composing into one screen - see the note on `AnnouncementView.sentByMe`
 * in `lib/comms.ts` for how an account's own sent announcements end up in
 * the same Announcements list as what it received, badged rather than kept
 * in a separate log.
 *
 * Real `role="tablist"` semantics, not the pill-filter pattern `ModuleFilter`
 * uses elsewhere - these two are actually different panels of content, not
 * one list filtered two ways, so arrow-key movement between them is the
 * behaviour a screen reader user would expect.
 */
export function NotificationFeed({
  view,
  viewerId,
  emptyAnnouncements,
  stackClassName = CONSOLE.stack,
  beforeTabs,
}: {
  view: FeedView;
  viewerId: string;
  /** What to say when there are none - an administrator's viewpoints never
   *  receive an announcement at all (see `announcementsForStaff` in
   *  `lib/comms.ts`), so that page's explanation reads differently from a
   *  lecturer's or a student's "none right now". */
  emptyAnnouncements: string;
  /** The area's own vertical rhythm above this block - `CONSOLE.stack` by
   *  default; the student page passes `PORTAL.stack`. */
  stackClassName?: string;
  /** Extra content pinned above the Announcements/Messages tabs themselves -
   *  currently just the student portal's "Contact GreenFin admin" card
   *  (see `app/(studentportal)/notifications/page.tsx`). Outside the tabs
   *  deliberately: it is not part of either Announcements or Messages, it's
   *  a standing channel that should read the same regardless of which tab
   *  is open, so it can't live inside one tabpanel without disappearing
   *  when the other tab is selected. A prop rather than a new prop on every
   *  caller, since only one screen needs it and the other two (admin/
   *  lecturer Communications) already have their own "start a new message"
   *  button in the page header. */
  beforeTabs?: ReactNode;
}) {
  const [active, setActive] = useState<TabId>("announcements");
  const baseId = useId();
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    announcements: null,
    messages: null,
  });

  const unreadMessages = view.messages.filter((message) => message.unread).length;

  const tabs: { id: TabId; label: string; count: number; dot?: boolean }[] = [
    { id: "announcements", label: "Announcements", count: view.announcements.length },
    { id: "messages", label: "Messages", count: view.messages.length, dot: unreadMessages > 0 },
  ];

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = event.key === "ArrowRight" ? "messages" : "announcements";
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className={stackClassName}>
      {beforeTabs ? <div className="mb-6">{beforeTabs}</div> : null}

      <div
        role="tablist"
        aria-label="Notifications"
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-2 border-b border-surface-deep"
      >
        {tabs.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-${tab.id}-tab`}
              aria-selected={selected}
              aria-controls={`${baseId}-${tab.id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={`relative -mb-px inline-flex items-center gap-2 border-b-2 px-1 py-3 text-lg font-semibold transition-colors ${
                selected
                  ? "border-primary text-ink"
                  : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {tab.label}
              <span className="text-sm font-medium text-muted">{tab.count}</span>
              {tab.dot ? (
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full bg-accent"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-announcements-panel`}
        aria-labelledby={`${baseId}-announcements-tab`}
        hidden={active !== "announcements"}
        className="mt-5"
      >
        {view.announcements.length ? (
          <ul className="space-y-3">
            {view.announcements.map((announcement) => (
              <li
                key={announcement.id}
                className="rounded-sm border border-surface-deep bg-paper-raised px-5 py-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-ink">{announcement.title}</p>
                  {announcement.sentByMe ? (
                    <FilledTag tone="primary" icon={<CheckIcon className="size-3.5" />}>
                      Sent by you
                    </FilledTag>
                  ) : null}
                  {announcement.isNew ? <NewTag /> : null}
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
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-messages-panel`}
        aria-labelledby={`${baseId}-messages-tab`}
        hidden={active !== "messages"}
        className="mt-5"
      >
        <p className={META.base}>Conversations you can reply to - unlike an announcement.</p>
        {view.messages.length ? (
          <ul className="mt-4 space-y-3">
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
      </div>
    </div>
  );
}
