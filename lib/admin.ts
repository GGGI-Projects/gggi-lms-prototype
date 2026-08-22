/**
 * Everything the console DERIVES, in one place.
 *
 * Same rule as `lib/portal.ts`: a screen never works out a total, a join or a
 * permission for itself. Three screens counting a lecturer's lectures three
 * different ways is how a console ends up with a number that is right on the
 * list and wrong on the profile, and nobody can say which one to believe.
 *
 * It also holds the PERMISSION MODEL - `can()` - because that is the one piece
 * of logic in the whole console that must not be re-expressed anywhere. A page
 * that decides for itself whether to draw a "Delete" button has decided for
 * itself what an administrator is.
 */

import { MODULES, type Module } from "@/content/site";
import { LECTURES } from "@/content/curriculum";
import { LEARNER, ENROLMENTS, CERTIFICATES } from "@/content/portal";
import { PASS_MARK, QUIZ_LENGTH, hasBlankQuestions } from "@/lib/portal";
import {
  DRAFT_LECTURES,
  MANAGED_MODULES,
  LECTURE_EDITS,
  ROLE_LABEL,
  SESSION,
  STAFF,
  type DraftLecture,
  type ManagedModule,
  type StaffMember,
  type StaffRole,
} from "@/content/staff";
import { STUDENTS, type StudentRecord } from "@/content/students";
import {
  AUDIT,
  BY_DISTRICT,
  ENROLMENT_SPLIT,
  MONTHLY,
  PLATFORM,
  QUIZ_STATS,
  REVIEWS,
  REVOCATIONS,
  BLANK_STATS,
  type QuizStats,
  type Review,
} from "@/content/operations";

export { ROLE_LABEL };

/**
 * The permission model lives in `lib/permissions.ts`, which imports no data,
 * because the checks run in the browser and this file reaches the whole
 * curriculum and every register. Re-exported so server code has one import.
 */
export { can, RESTRICTION, type Capability } from "@/lib/permissions";

/* ------------------------------------------------------------------- staff */

export function staffById(id: string): StaffMember | undefined {
  return STAFF.find((member) => member.id === id);
}

/** The name to print for an actor id, falling back to the id itself. */
export function staffName(id: string): string {
  return staffById(id)?.name ?? id;
}

/** Who you are in a given viewpoint. See `SESSION` for why this exists. */
export function sessionFor(role: StaffRole): StaffMember {
  const member = staffById(SESSION[role]);
  if (!member) throw new Error(`[admin] no session account for role: ${role}`);
  return member;
}

/**
 * The name and initials for each viewpoint, in the shape the shell wants.
 *
 * The shell is a client component and must not import this file - see the note
 * on its props - so the layout reads this once on the server and passes it
 * down. Three names is a cheap thing to send; the register behind them is not.
 */
export function consoleAccounts(): Record<
  StaffRole,
  { name: string; initials: string; avatarUrl: string }
> {
  const entry = (role: StaffRole) => {
    const member = sessionFor(role);
    return {
      name: member.name,
      initials: member.initials,
      avatarUrl: member.avatarUrl,
    };
  };

  return {
    "super-admin": entry("super-admin"),
    admin: entry("admin"),
    lecturer: entry("lecturer"),
  };
}

export function admins(): StaffMember[] {
  return STAFF.filter(
    (member) => member.role === "admin" || member.role === "super-admin",
  );
}

export function lecturers(): StaffMember[] {
  return STAFF.filter((member) => member.role === "lecturer");
}

/* -------------------------------------------------------------- modules */

export function managedModule(id: string): ManagedModule | undefined {
  return MANAGED_MODULES.find((mdl) => mdl.id === id);
}

/** The public catalogue entry, when there is one. Drafts have none. */
export function catalogueModule(id: string): Module | undefined {
  return MODULES.find((mdl) => mdl.id === id);
}

/**
 * Modules a "which module" filter should offer.
 *
 * A draft has no learners, so a certificate, learner or review register can
 * never have a row for one - listing it in that register's module filter is
 * an option that always shows "nothing here". Assignment screens (appointing
 * or reassigning a lecturer) are a different question with a different
 * answer, and keep reading `MANAGED_MODULES` directly: a draft is exactly the
 * kind of module an admin needs to assign someone to.
 */
export function publishedModules(): ManagedModule[] {
  return MANAGED_MODULES.filter((mdl) => mdl.status === "published");
}

export function modulesFor(member: StaffMember): ManagedModule[] {
  const ids = member.moduleIds ?? [];
  return MANAGED_MODULES.filter((mdl) => ids.includes(mdl.id));
}

export function lecturersFor(moduleId: string): StaffMember[] {
  const mdl = managedModule(moduleId);
  if (!mdl) return [];
  return mdl.lecturerIds
    .map(staffById)
    .filter((member): member is StaffMember => Boolean(member));
}

/**
 * A module's lectures as the console needs them - the same shape whether
 * they come from the published curriculum or from a draft's plan.
 *
 * This is the join that would otherwise be written on four screens. A
 * published lecture has real content, so its state comes from `LECTURE_EDITS`
 * and defaults to published-and-untouched; a draft's lectures are a plan and
 * carry their own state.
 */
export type ConsoleLecture = {
  id: string;
  number: string;
  title: string;
  state: DraftLecture["state"];
  updatedOn: string | null;
  /** Null when nobody has been recorded as the author. */
  author: StaffMember | null;
  /** False for a draft module's planned lectures - there is nothing to read. */
  hasContent: boolean;
};

export function consoleLectures(moduleId: string): ConsoleLecture[] {
  const drafts = DRAFT_LECTURES[moduleId];
  const mdl = managedModule(moduleId);
  const fallbackAuthor = mdl?.lecturerIds[0] ?? null;

  if (drafts) {
    return drafts.map((mod) => ({
      id: mod.id,
      number: mod.number,
      title: mod.title,
      state: mod.state,
      updatedOn: mod.updatedOn,
      author: fallbackAuthor ? (staffById(fallbackAuthor) ?? null) : null,
      hasContent: false,
    }));
  }

  return (LECTURES[moduleId] ?? []).map((mod) => {
    const edit = LECTURE_EDITS[mod.id];
    return {
      id: mod.id,
      number: mod.number,
      title: mod.title,
      state: edit?.state ?? "published",
      updatedOn: edit?.updatedOn ?? mdl?.createdOn ?? null,
      author: staffById(edit?.authorId ?? fallbackAuthor ?? "") ?? null,
      hasContent: true,
    };
  });
}

/**
 * The material touched most recently, across every module.
 *
 * The dashboard's answer to "is anyone actually writing anything". Lectures
 * with no recorded edit date sort last rather than being dropped - a lecture
 * nobody has touched since launch is a fact worth seeing.
 */
export function recentLectures(limit = 6) {
  return MANAGED_MODULES.flatMap((mdl) =>
    consoleLectures(mdl.id).map((mod) => ({ ...mod, module: mdl })),
  )
    .sort((a, b) => (b.updatedOn ?? "").localeCompare(a.updatedOn ?? ""))
    .slice(0, limit);
}

/**
 * How a lecture's quiz is going, where the prototype carries figures for it.
 *
 * Returns null rather than zeroes. A quiz with no results and a quiz everybody
 * fails are opposite facts, and a screen that renders both as "0%" is worse
 * than one that admits it does not know.
 */
export function quizStatsFor(lectureId: string): QuizStats | null {
  return QUIZ_STATS[lectureId] ?? null;
}

/** Same idea as `quizStatsFor()`, for a lecture's fill-in-the-blank questions
 *  - null both when there are none and when there are no figures for them
 *  yet, which the caller tells apart with `hasBlankQuestions()`. */
export function blankStatsFor(lectureId: string): QuizStats | null {
  return BLANK_STATS[lectureId] ?? null;
}

/**
 * When a quiz is worth a lecturer's attention.
 *
 * ONE DEFINITION, used by the dashboard queue, the quizzes list, the lecture
 * screen and the quiz itself - four places that were each about to decide this
 * for themselves, which is how a console ends up flagging a quiz on one screen
 * and calling it healthy on the next.
 *
 * TWO TESTS, because they catch different failures. A mean below the pass mark
 * says the whole quiz is too hard. A PASS RATE below three quarters catches
 * the more common and more insidious case: a mean that looks respectable
 * because most people score well, while one in four is sent back - which, with
 * unlimited retakes and a 70% mark, is a question that is ambiguous rather
 * than a cohort that is weak.
 */
export const PASS_RATE_FLOOR = 75;

export function quizNeedsAttention(stats: QuizStats | null): boolean {
  if (!stats) return false;
  return stats.passRate < PASS_RATE_FLOOR || stats.averageScore < PASS_MARK;
}

/** Every quiz on one module, with its lecture and whatever is known about it. */
export function quizzesForModule(moduleId: string) {
  return consoleLectures(moduleId).map((mod) => ({
    mod,
    module: managedModule(moduleId),
    stats: quizStatsFor(mod.id),
    questions: mod.hasContent ? QUIZ_LENGTH : 0,
    hasBlanks: mod.hasContent && hasBlankQuestions(mod.id),
    blankStats: blankStatsFor(mod.id),
  }));
}

/** Lectures a lecturer is responsible for, across every assigned module. */
export function lectureLoad(member: StaffMember) {
  const modules = modulesFor(member);
  const lectures = modules.flatMap((mdl) =>
    consoleLectures(mdl.id).map((mod) => ({ ...mod, module: mdl })),
  );

  return {
    modules,
    lectures,
    published: lectures.filter((mod) => mod.state === "published").length,
    unwritten: lectures.filter(
      (mod) => mod.state === "draft" || mod.state === "not-started",
    ).length,
    learners: modules.reduce(
      (sum, mdl) => sum + mdl.enrolments,
      0,
    ),
  };
}

/**
 * What a learner sees when they click through to a lecturer's public
 * profile: only published modules, and only that lecturer's own published
 * lectures within them - never a draft, unlike `lectureLoad()` above which
 * is the lecturer's own console view of everything including work not yet
 * public.
 *
 * The one place the student portal reads from this file rather than
 * `lib/portal.ts` - lecture authorship lives in the console's own data
 * (`LECTURE_EDITS`), and re-deriving it a second way in the portal layer is
 * exactly the kind of drift this file exists to prevent.
 */
export function publishedLecturesBy(
  lecturerId: string,
): { module: ManagedModule; lecture: ConsoleLecture }[] {
  return publishedModules().flatMap((mdl) =>
    consoleLectures(mdl.id)
      .filter((mod) => mod.state === "published" && mod.author?.id === lecturerId)
      .map((mod) => ({ module: mdl, lecture: mod })),
  );
}

/**
 * Whether the demo learner has completed at least one lecture this lecturer
 * wrote - the one thing that decides whether they may review this lecturer,
 * the same completion gate a certificate sits behind for a module review
 * (FR-STU-320).
 */
export function learnerCompletedLectureBy(lecturerId: string): boolean {
  return publishedLecturesBy(lecturerId).some((entry) =>
    ENROLMENTS.some(
      (enrolment) =>
        enrolment.moduleId === entry.module.id &&
        enrolment.completedLectureIds.includes(entry.lecture.id),
    ),
  );
}

/* ---------------------------------------------------------------- students */

/**
 * The demo learner, as a register row.
 *
 * DERIVED rather than authored, because she is the one learner who exists on
 * both sides of the platform: an administrator can open her record here, and
 * the client can then sign into the student portal as her. Two hand-written
 * copies of the same person would disagree about her progress within a week of
 * anyone editing either file.
 */
function demoLearnerRecord(): StudentRecord {
  return {
    id: LEARNER.id,
    name: LEARNER.name,
    initials: LEARNER.initials,
    avatarUrl: LEARNER.avatarUrl,
    email: LEARNER.email,
    district: LEARNER.district,
    sector: LEARNER.sector,
    organisation: LEARNER.organisation,
    joined: LEARNER.joined,
    lastActive: "2026-08-15",
    status: "active",
    enrolments: ENROLMENTS.map((enrolment) => {
      const scores = Object.values(enrolment.quizScores);
      const certificate = CERTIFICATES.find(
        (entry) => entry.moduleId === enrolment.moduleId,
      );

      return {
        moduleId: enrolment.moduleId,
        enrolledOn: enrolment.enrolledOn,
        lecturesDone: enrolment.completedLectureIds.length,
        averageScore: scores.length
          ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
          : null,
        certificateRef: certificate?.reference,
      };
    }),
  };
}

/** The register sample, newest registration first. */
export function students(): StudentRecord[] {
  return [...STUDENTS, demoLearnerRecord()].sort((a, b) =>
    b.joined.localeCompare(a.joined),
  );
}

export function studentById(id: string): StudentRecord | undefined {
  return students().find((student) => student.id === id);
}

/** The one place the portal and the console agree on what a student's row means. */
export type StudentSummary = {
  student: StudentRecord;
  enrolled: number;
  completed: number;
  lecturesDone: number;
  /** Mean of the enrolments that have a score at all. */
  averageScore: number | null;
  certificates: string[];
  /** Progress across every module they are enrolled in, 0-100. */
  percent: number;
};

export function summarise(student: StudentRecord): StudentSummary {
  const totals = student.enrolments.map((enrolment) => {
    const mdl = managedModule(enrolment.moduleId);
    return {
      done: enrolment.lecturesDone,
      of: mdl?.lectureCount ?? 0,
      score: enrolment.averageScore,
      certificate: enrolment.certificateRef,
    };
  });

  const scored = totals.filter((entry) => entry.score !== null);
  const lectureTotal = totals.reduce((sum, entry) => sum + entry.of, 0);
  const lecturesDone = totals.reduce((sum, entry) => sum + entry.done, 0);

  return {
    student,
    enrolled: student.enrolments.length,
    completed: totals.filter((entry) => entry.certificate).length,
    lecturesDone,
    averageScore: scored.length
      ? Math.round(
          scored.reduce((sum, entry) => sum + (entry.score ?? 0), 0) /
            scored.length,
        )
      : null,
    certificates: totals
      .map((entry) => entry.certificate)
      .filter((reference): reference is string => Boolean(reference)),
    percent: lectureTotal ? Math.round((lecturesDone / lectureTotal) * 100) : 0,
  };
}

/** Learners on the modules one lecturer is assigned to. */
export function learnersFor(member: StaffMember): StudentRecord[] {
  const ids = member.moduleIds ?? [];
  return students().filter((student) =>
    student.enrolments.some((enrolment) => ids.includes(enrolment.moduleId)),
  );
}

/* ------------------------------------------------------------ certificates */

export type CertificateRecord = {
  reference: string;
  studentId: string;
  studentName: string;
  moduleId: string;
  moduleTitle: string;
  issuedOn: string;
  score: number | null;
  status: "issued" | "revoked";
  revoked?: { revokedOn: string; by: string; reason: string };
};

/**
 * The register, built from the learners who finished.
 *
 * See the note on `REVOCATIONS` for why this is derived and withdrawals are
 * not. `issuedOn` is the enrolment date plus nothing - the prototype does not
 * record a completion date per enrolment, so the certificate carries the date
 * the learner's own certificate carries where there is one, and the last
 * activity date otherwise. That approximation is invisible on screen and is
 * the only one in this file.
 */
export function certificateRegister(): CertificateRecord[] {
  const issued = students().flatMap((student) =>
    student.enrolments
      .filter((enrolment) => enrolment.certificateRef)
      .map((enrolment) => {
        const reference = enrolment.certificateRef as string;
        const portalCertificate = CERTIFICATES.find(
          (entry) => entry.reference === reference,
        );
        const revoked = REVOCATIONS[reference];

        return {
          reference,
          studentId: student.id,
          // The one exception to "the register shows what the console
          // shows": a certificate carries the name on record, which for the
          // demo learner is `certificateName`, not the name she goes by -
          // see the note on `LEARNER` in `content/portal.ts`. The other 26
          // students have no such split, so `student.name` is already their
          // certificate name too.
          studentName:
            student.id === LEARNER.id ? LEARNER.certificateName : student.name,
          moduleId: enrolment.moduleId,
          moduleTitle:
            managedModule(enrolment.moduleId)?.title ??
            enrolment.moduleId,
          issuedOn: portalCertificate?.issuedOn ?? student.lastActive,
          score: enrolment.averageScore,
          status: revoked ? ("revoked" as const) : ("issued" as const),
          revoked,
        };
      }),
  );

  return issued.sort((a, b) => b.issuedOn.localeCompare(a.issuedOn));
}

/**
 * Looks a certificate up by its printed reference, for `/verify` - the
 * public page anyone a certificate is shown to can check it against.
 *
 * Same register the console reads, on purpose: a credential that verifies
 * against one list in public and a different one in the console is worse
 * than not verifying at all. The match tolerates case and stray whitespace -
 * "gp-2026-pa-04817 " typed on a phone keyboard should find the same row as
 * the reference printed on the certificate - but nothing looser than that;
 * a reference either matches exactly once normalised, or it does not exist.
 */
export function findCertificate(reference: string): CertificateRecord | undefined {
  const normalised = reference.trim().toUpperCase();
  if (!normalised) return undefined;
  return certificateRegister().find(
    (record) => record.reference.toUpperCase() === normalised,
  );
}

/* -------------------------------------------------------------- moderation */

export function reviewsByStatus(status: Review["status"]): Review[] {
  return REVIEWS.filter((review) => review.status === status);
}

export function pendingReviewCount(): number {
  return reviewsByStatus("pending").length;
}

export function reviewsForModule(moduleId: string): Review[] {
  return REVIEWS.filter(
    (review) => review.subject.kind === "module" && review.subject.moduleId === moduleId,
  );
}

/** Same idea, for a lecturer's own reviews rather than a module's. */
export function reviewsForLecturer(lecturerId: string): Review[] {
  return REVIEWS.filter(
    (review) => review.subject.kind === "lecturer" && review.subject.lecturerId === lecturerId,
  );
}

/**
 * A lecturer's published rating, out of 5 - undefined rather than 0 when
 * nobody has reviewed them yet, same reason `quizStatsFor()` returns null
 * rather than a zero: "no reviews" and "reviewed badly" must never look the
 * same on screen.
 */
export function lecturerRating(
  lecturerId: string,
): { average: number; count: number } | undefined {
  const published = reviewsForLecturer(lecturerId).filter(
    (review) => review.status === "published",
  );
  if (!published.length) return undefined;
  return {
    average:
      Math.round(
        (published.reduce((sum, review) => sum + review.rating, 0) / published.length) * 10,
      ) / 10,
    count: published.length,
  };
}

/* ------------------------------------------------------------------ audit */

/** The log, newest first, optionally narrowed to one actor. */
export function auditEntries(actorId?: string) {
  const entries = actorId
    ? AUDIT.filter((entry) => entry.actorId === actorId)
    : AUDIT;
  return [...entries].sort((a, b) => b.at.localeCompare(a.at));
}

/* --------------------------------------------------------------- analytics */

/** Percentage change between the last two whole months. */
export function monthOverMonth(key: "signups" | "enrolments" | "completions") {
  // The final entry is a part month, so comparing it to a whole one would
  // report a fall every time. The last two WHOLE months are the comparison.
  const whole = MONTHLY.slice(0, -1);
  const latest = whole[whole.length - 1][key];
  const previous = whole[whole.length - 2][key];
  if (!previous) return 0;
  return Math.round(((latest - previous) / previous) * 100);
}

/** Enrolments per module, biggest first, for the bar chart. */
export function enrolmentsByModule() {
  return [...MANAGED_MODULES]
    .filter((mdl) => mdl.status === "published")
    .sort((a, b) => b.enrolments - a.enrolments)
    .map((mdl) => ({
      id: mdl.id,
      label: mdl.title,
      value: mdl.enrolments,
      completions: mdl.completions,
    }));
}

/** The three slices of the completion donut, with their share worked out. */
export function completionSplit() {
  const total = PLATFORM.enrolments;
  return [
    {
      label: "Completed",
      value: ENROLMENT_SPLIT.completed,
      percent: Math.round((ENROLMENT_SPLIT.completed / total) * 100),
      tone: "primary" as const,
    },
    {
      label: "In progress",
      value: ENROLMENT_SPLIT.inProgress,
      percent: Math.round((ENROLMENT_SPLIT.inProgress / total) * 100),
      tone: "accent" as const,
    },
    {
      label: "Not started",
      value: ENROLMENT_SPLIT.notStarted,
      percent: Math.round((ENROLMENT_SPLIT.notStarted / total) * 100),
      tone: "muted" as const,
    },
  ];
}

/**
 * Things waiting for somebody. The dashboard's first block.
 *
 * EVERY FIGURE HERE HAS TO BE SOMETHING THE VIEWER CAN ACT ON, or the block
 * stops meaning "waiting for you" and starts meaning "here is a number".
 * That is why there is no count of unpublished lectures here: a lecture
 * belongs entirely to the lecturer writing it, who publishes it themselves
 * whenever it's ready (see `lecture-editor.tsx`) - there is no administrator
 * action to take, so it has no place in an administrator's queue. A draft
 * MODULE is different: it is genuinely waiting on an administrator, since
 * only they can publish one.
 */
export function queues() {
  const drafts = MANAGED_MODULES.filter(
    (mdl) => mdl.status === "draft",
  );
  const unassigned = lecturers().filter(
    (member) => (member.moduleIds ?? []).length === 0,
  );
  const flagged = REVIEWS.filter(
    (review) => review.status === "pending" && review.flagged,
  );

  return {
    pendingReviews: pendingReviewCount(),
    flaggedReviews: flagged.length,
    draftModules: drafts.length,
    unassignedLecturers: unassigned.length,
    suspendedLearners: students().filter(
      (student) => student.status === "suspended",
    ).length,
  };
}

/* --------------------------------------------------------------- formatting */

/** Thousands separators, one implementation. `Intl` with an explicit locale,
 *  so the server and the browser format identically and hydration is quiet. */
const NUMBER = new Intl.NumberFormat("en-GB");

export function formatNumber(value: number): string {
  return NUMBER.format(value);
}

/** "+12%" / "-4%" / "no change" - a delta always says which way it went. */
export function formatDelta(percent: number): string {
  if (percent === 0) return "no change";
  return `${percent > 0 ? "+" : ""}${percent}%`;
}

/** "15 Aug 2026, 09:12" from an ISO date-and-time. */
export function formatStamp(iso: string): string {
  const [date, time] = iso.split("T");
  const formatted = new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return time ? `${formatted}, ${time}` : formatted;
}

/* --------------------------------------------------- development-only check */

/**
 * The numbers on a dashboard have to add up, and nothing in TypeScript checks
 * that 12 authored monthly figures still sum to the platform total after
 * somebody edits one of them. This runs on the server in development only and
 * says so loudly in the terminal. Same device as `lib/portal.ts`.
 */
if (process.env.NODE_ENV !== "production") {
  const sum = (values: number[]) => values.reduce((total, n) => total + n, 0);
  const warn = (message: string) => console.warn(`[admin] ${message}`);

  const signups = sum(MONTHLY.map((point) => point.signups));
  if (signups !== PLATFORM.learners) {
    warn(`monthly signups sum to ${signups}, PLATFORM.learners is ${PLATFORM.learners}`);
  }

  const enrolments = sum(MONTHLY.map((point) => point.enrolments));
  if (enrolments !== PLATFORM.enrolments) {
    warn(
      `monthly enrolments sum to ${enrolments}, PLATFORM.enrolments is ${PLATFORM.enrolments}`,
    );
  }

  const completions = sum(MONTHLY.map((point) => point.completions));
  if (completions !== PLATFORM.certificates) {
    warn(
      `monthly completions sum to ${completions}, PLATFORM.certificates is ${PLATFORM.certificates}`,
    );
  }

  const districts = sum(BY_DISTRICT.map((entry) => entry.value));
  if (districts !== PLATFORM.learners) {
    warn(`district totals sum to ${districts}, PLATFORM.learners is ${PLATFORM.learners}`);
  }

  const split =
    ENROLMENT_SPLIT.completed +
    ENROLMENT_SPLIT.inProgress +
    ENROLMENT_SPLIT.notStarted;
  if (split !== PLATFORM.enrolments) {
    warn(`enrolment split sums to ${split}, PLATFORM.enrolments is ${PLATFORM.enrolments}`);
  }

  const moduleEnrolments = sum(
    MANAGED_MODULES.map((mdl) => mdl.enrolments),
  );
  if (moduleEnrolments !== PLATFORM.enrolments) {
    warn(
      `module enrolments sum to ${moduleEnrolments}, PLATFORM.enrolments is ${PLATFORM.enrolments}`,
    );
  }

  const moduleCompletions = sum(
    MANAGED_MODULES.map((mdl) => mdl.completions),
  );
  if (moduleCompletions !== PLATFORM.certificates) {
    warn(
      `module completions sum to ${moduleCompletions}, PLATFORM.certificates is ${PLATFORM.certificates}`,
    );
  }

  for (const mdl of MANAGED_MODULES) {
    const lectures = consoleLectures(mdl.id);
    if (lectures.length !== mdl.lectureCount) {
      warn(
        `${mdl.id} declares ${mdl.lectureCount} lectures, ${lectures.length} exist`,
      );
    }
    const published = lectures.filter((mod) => mod.state === "published").length;
    if (published !== mdl.publishedLectures) {
      warn(
        `${mdl.id} declares ${mdl.publishedLectures} published lectures, ${published} are`,
      );
    }
  }

  // The attempt-weighted mean of the per-lecture quiz averages has to match
  // what the module declares, or the lecturer console and the admin
  // console disagree about the same module.
  const statLectures = Object.keys(QUIZ_STATS);
  if (statLectures.length) {
    const owner = MANAGED_MODULES.find((mdl) =>
      consoleLectures(mdl.id).some((mod) => QUIZ_STATS[mod.id]),
    );
    const attempts = sum(statLectures.map((id) => QUIZ_STATS[id].attempts));
    const weighted = sum(
      statLectures.map((id) => QUIZ_STATS[id].attempts * QUIZ_STATS[id].averageScore),
    );
    const mean = Math.round(weighted / attempts);
    if (owner && mean !== owner.averageScore) {
      warn(
        `lecture quiz averages weight to ${mean}%, ${owner.id} declares ${owner.averageScore}%`,
      );
    }
  }

  for (const student of students()) {
    for (const enrolment of student.enrolments) {
      const mdl = managedModule(enrolment.moduleId);
      if (!mdl) {
        warn(`${student.id} is enrolled in unknown module ${enrolment.moduleId}`);
        continue;
      }
      if (enrolment.lecturesDone > mdl.lectureCount) {
        warn(
          `${student.id} has ${enrolment.lecturesDone} of ${mdl.lectureCount} lectures in ${mdl.id}`,
        );
      }
      if (
        enrolment.certificateRef &&
        enrolment.lecturesDone !== mdl.lectureCount
      ) {
        warn(
          `${student.id} holds a certificate for ${mdl.id} without finishing it`,
        );
      }
    }
  }
}
