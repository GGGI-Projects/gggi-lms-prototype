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
  ROLE_LABEL,
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

/** `Avatar`'s `src` for either kind of party - `undefined` falls back to the
 *  initials it already knows how to draw. */
export function partyAvatarUrl(party: Party): string | undefined {
  if (party.kind === "staff") return staffById(party.id)?.avatarUrl;
  return studentById(party.id)?.avatarUrl;
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

/** The bell panel and the Communications page both read this - one list,
 *  sorted newest first, announcements and messages interleaved. Includes
 *  what this account has SENT as well as what it has received - an
 *  administrator never receives an announcement (see `announcementsForStaff`)
 *  so without this their feed would only ever show messages; a lecturer's
 *  own sent announcements were previously kept in a page-only "sent log"
 *  (see `sentByMe` on `AnnouncementView`, and the merge decision that
 *  replaced it). */
export function feedForStaff(member: StaffMember): FeedItem[] {
  const announcementItems: FeedItem[] = [
    ...announcementsForStaff(member),
    ...announcementsSentBy(member.id),
  ].map((announcement) => ({ kind: "announcement", date: announcement.sentOn, announcement }));
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

/** One selectable person - a lecturer or a student - on an audience or
 *  contact picker. Carries the same face `PersonTag` draws everywhere else a
 *  name shows, so a picker chip is never just a bare label. */
export type PersonOption = {
  id: string;
  label: string;
  avatarUrl?: string;
  initials: string;
};

/** Every lecturer, for an administrator's audience picker. */
export function lecturerOptions(): PersonOption[] {
  return lecturers().map((member) => ({
    id: member.id,
    label: member.name,
    avatarUrl: member.avatarUrl,
    initials: member.initials,
  }));
}

/** Every student in the register sample, for an administrator's picker. */
export function studentOptions(): PersonOption[] {
  return students().map((student) => ({
    id: student.id,
    label: student.name,
    avatarUrl: student.avatarUrl,
    initials: student.initials,
  }));
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
 * Who a lecturer's "Message admin" goes to - whoever appointed them (now,
 * per §4.29, most often a Module Administrator rather than the Super
 * Administrator - see FR-MODADM-050), the same account their profile page
 * already points to for "who to ask" about an assignment. Falls back to the
 * Super Administrator, in case a lecturer was ever seeded without one.
 */
export function adminContactFor(member: StaffMember): StaffMember {
  const appointedBy = member.createdBy ? staffById(member.createdBy) : undefined;
  return appointedBy ?? staffById(SESSION["super-admin"])!;
}

/**
 * Who a learner's official "Contact GreenFin admin" channel reaches. Always
 * the Super Administrator - the platform-wide, no-particular-Module channel
 * stays pointed there since it is not asking about any one Module (see the
 * ministry-pivot SRS's note extending §4.24 to the scoped roles). A learner
 * has no "who enrolled me" relationship to derive a more specific contact
 * from anyway - there is just the one, a deliberate, named channel to the
 * administration, separate from `messageContactsForStudent` (lecturers only,
 * for a different button).
 */
export function adminContactForStudent(): StaffMember {
  return staffById(SESSION["super-admin"])!;
}

/* ----------------------------------------------------------- the bell panel */

export type NotificationSummary = {
  id: string;
  kind: "announcement" | "message";
  from: string;
  /** The sender's (announcement) or other party's (message) face - the bell
   *  preview shows this instead of a generic kind icon, same rule as every
   *  other place a name shows. */
  fromAvatarUrl?: string;
  fromInitials: string;
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
      const sender = staffById(item.announcement.from);
      return {
        id: item.announcement.id,
        kind: "announcement" as const,
        from: sender?.name ?? item.announcement.from,
        fromAvatarUrl: sender?.avatarUrl,
        fromInitials: sender?.initials ?? "?",
        headline: item.announcement.title,
        snippet: truncate(item.announcement.body),
        date: item.date,
        // Never "new" to the account that sent it - `isNew` is authored for
        // recipients, and a self-sent announcement now rides in the same
        // feed as what this account received (see `feedForStaff`).
        unread: Boolean(item.announcement.isNew) && item.announcement.from !== viewerId,
      };
    }
    const other = otherParty(item.thread, viewerId);
    const last = lastMessage(item.thread);
    return {
      id: item.thread.id,
      kind: "message" as const,
      from: partyName(other),
      fromAvatarUrl: partyAvatarUrl(other),
      fromInitials: partyInitials(other),
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
  | { kind: "lecturers"; label: string; options: PersonOption[] }
  | { kind: "all-students"; label: string }
  | { kind: "own-students"; label: string }
  | { kind: "students"; label: string; options: PersonOption[] }
  // A module isn't a person - no avatar on this one's options.
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
    avatarUrl: student.avatarUrl,
    initials: student.initials,
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

export type ContactOption = PersonOption & { group?: string };

/** An administrator may open a new conversation with any lecturer or any
 *  student. */
export function messageContactsForAdmin(): ContactOption[] {
  return [
    ...lecturerOptions().map((option) => ({ ...option, group: "Lecturers" })),
    ...studentOptions().map((option) => ({ ...option, group: "Students" })),
  ];
}

/** A lecturer may message whoever appointed them, or any of their own
 *  students. The parenthetical names whichever role that actually is now
 *  (most often a Module Administrator, see FR-MODADM-050) rather than
 *  assuming "administrator", since the flat role no longer exists. */
export function messageContactsForLecturer(member: StaffMember): ContactOption[] {
  const admin = adminContactFor(member);
  return [
    {
      id: admin.id,
      label: `${admin.name} (${ROLE_LABEL[admin.role]})`,
      avatarUrl: admin.avatarUrl,
      initials: admin.initials,
    },
    ...learnersFor(member).map((student) => ({
      id: student.id,
      label: student.name,
      avatarUrl: student.avatarUrl,
      initials: student.initials,
    })),
  ];
}

/** A student may message any lecturer teaching a module they are enrolled
 *  in - not the lecturer of a module they merely browsed. */
export function messageContactsForStudent(student: StudentRecord): ContactOption[] {
  return lecturersForStudent(student).map((lecturer) => ({
    id: lecturer.id,
    label: lecturer.name,
    avatarUrl: lecturer.avatarUrl,
    initials: lecturer.initials,
  }));
}

/* ------------------------------------------------------- the full-page view */

export type AnnouncementView = {
  id: string;
  title: string;
  body: string;
  from: string;
  /** `Avatar`'s `src`/`initials` for the sender - an announcement is always
   *  from a staff member, so this is never the "unknown learner" fallback
   *  `partyAvatarUrl`/`partyInitials` carry for a party of unknown kind. */
  fromAvatarUrl?: string;
  fromInitials: string;
  audience: string;
  date: string;
  isNew: boolean;
  /** This account is `from` - the identifier the Communications page badges
   *  an announcement with, now that sent and received share one list. */
  sentByMe: boolean;
};

export type MessageView = {
  thread: MessageThread;
  otherName: string;
  otherAvatarUrl?: string;
  otherInitials: string;
  unread: boolean;
};

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
        const sentByMe = announcement.from === member.id;
        const sender = staffById(announcement.from);
        return {
          id: announcement.id,
          title: announcement.title,
          body: announcement.body,
          from: sender?.name ?? announcement.from,
          fromAvatarUrl: sender?.avatarUrl,
          fromInitials: sender?.initials ?? "?",
          audience: audienceLabel(announcement.audience),
          date: announcement.sentOn,
          // Never "new" to the account that sent it - same reasoning as
          // `summariseFeed`.
          isNew: Boolean(announcement.isNew) && !sentByMe,
          sentByMe,
        };
      }),
    messages: feed
      .filter((item) => item.kind === "message")
      .map((item) => {
        const other = otherParty(item.thread, member.id);
        return {
          thread: item.thread,
          otherName: partyName(other),
          otherAvatarUrl: partyAvatarUrl(other),
          otherInitials: partyInitials(other),
          unread: item.unread,
        };
      }),
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
        const sender = staffById(announcement.from);
        return {
          id: announcement.id,
          title: announcement.title,
          body: announcement.body,
          from: sender?.name ?? announcement.from,
          fromAvatarUrl: sender?.avatarUrl,
          fromInitials: sender?.initials ?? "?",
          audience: audienceLabel(announcement.audience),
          date: announcement.sentOn,
          isNew: Boolean(announcement.isNew),
          // A student never sends an announcement.
          sentByMe: false,
        };
      }),
    messages: feed
      .filter((item) => item.kind === "message")
      .map((item) => {
        const other = otherParty(item.thread, studentId);
        return {
          thread: item.thread,
          otherName: partyName(other),
          otherAvatarUrl: partyAvatarUrl(other),
          otherInitials: partyInitials(other),
          unread: item.unread,
        };
      }),
  };
}

/**
 * The bell's data for every staff viewpoint at once, keyed by role - the
 * console's role switcher lives in client state and survives navigation
 * (see `role-context.tsx`), so the topbar cannot look up "the" feed on the
 * server; it has to be handed every role's own feed and pick the one for
 * whichever viewpoint is live. Every area but `admin` only ever renders its
 * own slot, since there is nothing to switch there - and four of those slots
 * (registrar, module administrator, laws/tools administrator, list manager)
 * are always empty, since `feedForStaff` never assigns any of those roles an
 * announcement or a message (see the note on `REGISTRAR_NAV` in
 * `components/console/nav.tsx`, and the same reasoning applied again for the
 * ministry-pivot's other scoped roles) - none of their bells are even
 * rendered, but this record is still complete because `ConsoleShell`'s prop
 * type demands an entry for every role, not only the ones with something in
 * it.
 */
export function sessionNotifications(): Record<StaffRole, NotificationSummary[]> {
  const roles: StaffRole[] = [
    "super-admin",
    "module-admin",
    "laws-admin",
    "tools-admin",
    "list-manager",
    "provincial-registrar",
    "lecturer",
  ];
  const entries = roles.map((role) => {
    const member = sessionFor(role);
    return [role, summariseFeed(feedForStaff(member), member.id)] as const;
  });
  return Object.fromEntries(entries) as Record<StaffRole, NotificationSummary[]>;
}
