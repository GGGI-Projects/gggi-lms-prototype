/**
 * Derivations over `content/comms.ts` - who receives which announcement, who
 * is in which conversation, and the combined feed the notification bell and
 * the notifications page both read from.
 *
 * Same rule as the rest of this file's neighbours (`lib/admin.ts`,
 * `lib/portal.ts`, `lib/profile-fields.ts`): a screen never filters the raw
 * arrays itself, so "who does this announcement reach" is answered once, not
 * once per screen with a slightly different filter each time.
 */

import {
  ANNOUNCEMENTS,
  THREADS,
  type Announcement,
  type Audience,
  type MessageThread,
  type Party,
} from "@/content/comms";
import {
  learnersFor,
  lecturers,
  lecturersFor,
  managedModule,
  modulesFor,
  publishedModules,
  sessionFor,
  staffById,
  staffName,
  students,
  studentById,
} from "@/lib/admin";
import { SESSION, type StaffMember, type StaffRole } from "@/content/staff";
import type { StudentRecord } from "@/content/students";

/* ----------------------------------------------------------- announcements */

/** What a lecturer receives. Admins and super administrators never receive
 *  an announcement in this system - they are the ones sending them. */
export function announcementsForStaff(member: StaffMember): Announcement[] {
  if (member.role !== "lecturer") return [];
  return ANNOUNCEMENTS.filter(
    (announcement) =>
      announcement.audience.kind === "all-lecturers" ||
      (announcement.audience.kind === "lecturers" &&
        announcement.audience.staffIds.includes(member.id)),
  );
}

/** What a student receives, given the modules they're enrolled in. */
export function announcementsForStudent(
  studentId: string,
  enrolledModuleIds: string[],
): Announcement[] {
  return ANNOUNCEMENTS.filter((announcement) => {
    const audience = announcement.audience;
    return (
      audience.kind === "all-students" ||
      (audience.kind === "students" && audience.studentIds.includes(studentId)) ||
      (audience.kind === "module" && enrolledModuleIds.includes(audience.moduleId))
    );
  });
}

/** What a member of staff has sent - their own log, not their inbox. */
export function announcementsSentBy(staffId: string): Announcement[] {
  return ANNOUNCEMENTS.filter((announcement) => announcement.from === staffId);
}

/** A human reading of who an announcement went to, for the sent log. */
export function audienceLabel(audience: Audience): string {
  switch (audience.kind) {
    case "all-lecturers":
      return "All lecturers";
    case "lecturers":
      return audience.staffIds.length === 1
        ? staffName(audience.staffIds[0])
        : `${audience.staffIds.length} lecturers`;
    case "all-students":
      return "All students";
    case "students":
      return audience.studentIds.length === 1
        ? (studentById(audience.studentIds[0])?.name ?? "1 student")
        : `${audience.studentIds.length} students`;
    case "module":
      return `Students in ${managedModule(audience.moduleId)?.title ?? audience.moduleId}`;
  }
}

/* ----------------------------------------------------------------- threads */

/** A name for either kind of party, staff or student. */
export function partyName(party: Party): string {
  if (party.kind === "staff") return staffName(party.id);
  return studentById(party.id)?.name ?? "Unknown learner";
}

export function partyInitials(party: Party): string {
  if (party.kind === "staff") return staffById(party.id)?.initials ?? "?";
  return studentById(party.id)?.initials ?? "?";
}

export function threadById(id: string): MessageThread | undefined {
  return THREADS.find((thread) => thread.id === id);
}

export function threadsFor(partyId: string): MessageThread[] {
  return THREADS.filter((thread) =>
    thread.participants.some((party) => party.id === partyId),
  );
}

/** The person on the other end, seen from `myId`'s side of the thread. */
export function otherParty(thread: MessageThread, myId: string): Party {
  return thread.participants[0].id === myId
    ? thread.participants[1]
    : thread.participants[0];
}

export function isThreadUnread(thread: MessageThread, forId: string): boolean {
  return thread.unreadFor.includes(forId);
}

export function lastMessage(thread: MessageThread) {
  return thread.messages[thread.messages.length - 1];
}

/* -------------------------------------------------------------- the feed */

export type FeedItem =
  | { kind: "announcement"; date: string; announcement: Announcement }
  | { kind: "message"; date: string; thread: MessageThread; unread: boolean };

function byDateDesc(a: FeedItem, b: FeedItem): number {
  return b.date.localeCompare(a.date);
}

/** The bell panel and the notifications page both read this - one list,
 *  sorted newest first, announcements and messages interleaved. */
export function feedForStaff(member: StaffMember): FeedItem[] {
  const announcementItems: FeedItem[] = announcementsForStaff(member).map(
    (announcement) => ({ kind: "announcement", date: announcement.sentOn, announcement }),
  );
  const messageItems: FeedItem[] = threadsFor(member.id).map((thread) => ({
    kind: "message",
    date: lastMessage(thread).sentOn,
    thread,
    unread: isThreadUnread(thread, member.id),
  }));
  return [...announcementItems, ...messageItems].sort(byDateDesc);
}

export function feedForStudent(
  studentId: string,
  enrolledModuleIds: string[],
): FeedItem[] {
  const announcementItems: FeedItem[] = announcementsForStudent(
    studentId,
    enrolledModuleIds,
  ).map((announcement) => ({ kind: "announcement", date: announcement.sentOn, announcement }));
  const messageItems: FeedItem[] = threadsFor(studentId).map((thread) => ({
    kind: "message",
    date: lastMessage(thread).sentOn,
    thread,
    unread: isThreadUnread(thread, studentId),
  }));
  return [...announcementItems, ...messageItems].sort(byDateDesc);
}

/** Whether the bell should show its dot at all - a new announcement or an
 *  unread message, either is worth a glance. */
export function feedNeedsAttention(items: FeedItem[]): boolean {
  return items.some((item) =>
    item.kind === "announcement" ? Boolean(item.announcement.isNew) : item.unread,
  );
}

/* ------------------------------------------------------- compose targets */

/** Every lecturer, for an administrator's audience picker. */
export function lecturerOptions(): { id: string; label: string }[] {
  return lecturers().map((member) => ({ id: member.id, label: member.name }));
}

/** Every student in the register sample, for an administrator's picker. */
export function studentOptions(): { id: string; label: string }[] {
  return students().map((student) => ({ id: student.id, label: student.name }));
}

/** The lecturers teaching a student's own modules - who they may message,
 *  and who a "Message this lecturer" button on a lecturer's public page is
 *  allowed to point at. */
export function lecturersForStudent(student: StudentRecord): StaffMember[] {
  const seen = new Map<string, StaffMember>();
  for (const enrolment of student.enrolments) {
    for (const lecturer of lecturersFor(enrolment.moduleId)) {
      seen.set(lecturer.id, lecturer);
    }
  }
  return [...seen.values()];
}

/**
 * Who a lecturer's "Message admin" goes to - whoever appointed them, the
 * same account their profile page already points to for "who to ask" about
 * an assignment. Falls back to the session administrator, in case a lecturer
 * was ever seeded without one.
 */
export function adminContactFor(member: StaffMember): StaffMember {
  const appointedBy = member.createdBy ? staffById(member.createdBy) : undefined;
  return appointedBy ?? staffById(SESSION.admin)!;
}

/* ----------------------------------------------------------- the bell panel */

export type NotificationSummary = {
  id: string;
  kind: "announcement" | "message";
  from: string;
  headline: string;
  snippet: string;
  date: string;
  unread: boolean;
};

function truncate(text: string, max = 88): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/**
 * The panel's rows and the notifications page's previews read this, not the
 * raw feed - a `FeedItem` still carries the full `Announcement` or
 * `MessageThread`, which is more than a component that only ever prints one
 * line needs to know how to read.
 */
export function summariseFeed(
  items: FeedItem[],
  viewerId: string,
): NotificationSummary[] {
  return items.map((item) => {
    if (item.kind === "announcement") {
      return {
        id: item.announcement.id,
        kind: "announcement" as const,
        from: staffName(item.announcement.from),
        headline: item.announcement.title,
        snippet: truncate(item.announcement.body),
        date: item.date,
        unread: Boolean(item.announcement.isNew),
      };
    }
    const other = otherParty(item.thread, viewerId);
    const last = lastMessage(item.thread);
    return {
      id: item.thread.id,
      kind: "message" as const,
      from: partyName(other),
      headline: `Message from ${partyName(other)}`,
      snippet: truncate(last.body),
      date: item.date,
      unread: item.unread,
    };
  });
}

/* -------------------------------------------------- composing an announcement */

/**
 * One selectable audience on the "send an announcement" form, plus - for
 * anything narrower than "everyone" - the list to pick from. Built here
 * rather than by the form itself, so who an administrator may address and
 * who a lecturer may address are both answered in one place, not decided
 * twice by two forms that could quietly drift apart.
 */
export type AnnouncementScope =
  | { kind: "all-lecturers"; label: string }
  | { kind: "lecturers"; label: string; options: { id: string; label: string }[] }
  | { kind: "all-students"; label: string }
  | { kind: "own-students"; label: string }
  | { kind: "students"; label: string; options: { id: string; label: string }[] }
  | { kind: "module"; label: string; options: { id: string; label: string }[] };

export function moduleOptions(): { id: string; label: string }[] {
  return publishedModules().map((mdl) => ({ id: mdl.id, label: mdl.title }));
}

export function announcementScopesForAdmin(): AnnouncementScope[] {
  return [
    { kind: "all-lecturers", label: "All lecturers" },
    { kind: "lecturers", label: "Specific lecturers", options: lecturerOptions() },
    { kind: "all-students", label: "All students" },
    { kind: "students", label: "Specific students", options: studentOptions() },
    { kind: "module", label: "Students in one module", options: moduleOptions() },
  ];
}

/** A lecturer only ever addresses their own students - never the whole
 *  platform, never another lecturer's. */
export function announcementScopesForLecturer(member: StaffMember): AnnouncementScope[] {
  const ownModules = modulesFor(member)
    .filter((mdl) => mdl.status === "published")
    .map((mdl) => ({ id: mdl.id, label: mdl.title }));
  const ownStudents = learnersFor(member).map((student) => ({
    id: student.id,
    label: student.name,
  }));

  const scopes: AnnouncementScope[] = [{ kind: "own-students", label: "All my students" }];
  if (ownModules.length) {
    scopes.push({ kind: "module", label: "Students in one of my modules", options: ownModules });
  }
  if (ownStudents.length) {
    scopes.push({ kind: "students", label: "Specific students of mine", options: ownStudents });
  }
  return scopes;
}

/* ------------------------------------------------------ composing a message */

export type ContactOption = { id: string; label: string; group?: string };

/** An administrator may open a new conversation with any lecturer or any
 *  student. */
export function messageContactsForAdmin(): ContactOption[] {
  return [
    ...lecturerOptions().map((option) => ({ ...option, group: "Lecturers" })),
    ...studentOptions().map((option) => ({ ...option, group: "Students" })),
  ];
}

/** A lecturer may message the administrator who appointed them, or any of
 *  their own students. */
export function messageContactsForLecturer(member: StaffMember): ContactOption[] {
  const admin = adminContactFor(member);
  return [
    { id: admin.id, label: `${admin.name} (administrator)` },
    ...learnersFor(member).map((student) => ({ id: student.id, label: student.name })),
  ];
}

/** A student may message any lecturer teaching a module they are enrolled
 *  in - not the lecturer of a module they merely browsed. */
export function messageContactsForStudent(student: StudentRecord): ContactOption[] {
  return lecturersForStudent(student).map((lecturer) => ({
    id: lecturer.id,
    label: lecturer.name,
  }));
}

/* ------------------------------------------------------- the full-page view */

export type AnnouncementView = {
  id: string;
  title: string;
  body: string;
  from: string;
  audience: string;
  date: string;
  isNew: boolean;
};

export type MessageView = { thread: MessageThread; otherName: string; unread: boolean };

export type FeedView = { announcements: AnnouncementView[]; messages: MessageView[] };

/**
 * The notifications page's data, fully rendering-ready - unlike `FeedItem`,
 * which still carries the raw `Announcement`/`MessageThread`. Built here so
 * a CLIENT component (the admin area's page has to be one, to read the live
 * viewpoint - see `RoleScopedNotifications`) never has to import this file
 * or `lib/admin.ts` to turn an id into a name; it receives the name already.
 */
export function feedViewForStaff(member: StaffMember): FeedView {
  const feed = feedForStaff(member);
  return {
    announcements: feed
      .filter((item) => item.kind === "announcement")
      .map((item) => {
        const announcement = item.announcement;
        return {
          id: announcement.id,
          title: announcement.title,
          body: announcement.body,
          from: staffName(announcement.from),
          audience: audienceLabel(announcement.audience),
          date: announcement.sentOn,
          isNew: Boolean(announcement.isNew),
        };
      }),
    messages: feed
      .filter((item) => item.kind === "message")
      .map((item) => ({
        thread: item.thread,
        otherName: partyName(otherParty(item.thread, member.id)),
        unread: item.unread,
      })),
  };
}

export function feedViewForStudent(
  studentId: string,
  enrolledModuleIds: string[],
): FeedView {
  const feed = feedForStudent(studentId, enrolledModuleIds);
  return {
    announcements: feed
      .filter((item) => item.kind === "announcement")
      .map((item) => {
        const announcement = item.announcement;
        return {
          id: announcement.id,
          title: announcement.title,
          body: announcement.body,
          from: staffName(announcement.from),
          audience: audienceLabel(announcement.audience),
          date: announcement.sentOn,
          isNew: Boolean(announcement.isNew),
        };
      }),
    messages: feed
      .filter((item) => item.kind === "message")
      .map((item) => ({
        thread: item.thread,
        otherName: partyName(otherParty(item.thread, studentId)),
        unread: item.unread,
      })),
  };
}

export type SentAnnouncementView = {
  id: string;
  title: string;
  body: string;
  audience: string;
  date: string;
};

/** One account's own sent log, for the Communications page - rendering-ready,
 *  same reason as `feedViewForStaff`. */
export function sentAnnouncementViewsFor(staffId: string): SentAnnouncementView[] {
  return announcementsSentBy(staffId).map((announcement) => ({
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    audience: audienceLabel(announcement.audience),
    date: announcement.sentOn,
  }));
}

/**
 * The bell's data for every staff viewpoint at once, keyed by role - the
 * console's role switcher lives in client state and survives navigation
 * (see `role-context.tsx`), so the topbar cannot look up "the" feed on the
 * server; it has to be handed all three and pick the one for whichever
 * viewpoint is live. The lecturer area only ever renders its own slot, since
 * there is nothing to switch there.
 */
export function sessionNotifications(): Record<StaffRole, NotificationSummary[]> {
  const roles: StaffRole[] = ["super-admin", "admin", "lecturer"];
  const entries = roles.map((role) => {
    const member = sessionFor(role);
    return [role, summariseFeed(feedForStaff(member), member.id)] as const;
  });
  return Object.fromEntries(entries) as Record<StaffRole, NotificationSummary[]>;
}
