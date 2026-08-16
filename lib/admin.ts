/**
 * Everything the console DERIVES, in one place.
 *
 * Same rule as `lib/portal.ts`: a screen never works out a total, a join or a
 * permission for itself. Three screens counting an instructor's lectures three
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
import { PASS_MARK, QUIZ_LENGTH } from "@/lib/portal";
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
  { name: string; initials: string }
> {
  const entry = (role: StaffRole) => {
    const member = sessionFor(role);
    return { name: member.name, initials: member.initials };
  };

  return {
    "super-admin": entry("super-admin"),
    admin: entry("admin"),
    instructor: entry("instructor"),
  };
}

export function admins(): StaffMember[] {
  return STAFF.filter(
    (member) => member.role === "admin" || member.role === "super-admin",
  );
}

export function instructors(): StaffMember[] {
  return STAFF.filter((member) => member.role === "instructor");
}

/* -------------------------------------------------------------- modules */

export function managedModule(id: string): ManagedModule | undefined {
  return MANAGED_MODULES.find((mdl) => mdl.id === id);
}

/** The public catalogue entry, when there is one. Drafts have none. */
export function catalogueModule(id: string): Module | undefined {
  return MODULES.find((mdl) => mdl.id === id);
}

export function modulesFor(member: StaffMember): ManagedModule[] {
  const ids = member.moduleIds ?? [];
  return MANAGED_MODULES.filter((mdl) => ids.includes(mdl.id));
}

export function instructorsFor(moduleId: string): StaffMember[] {
  const mdl = managedModule(moduleId);
  if (!mdl) return [];
  return mdl.instructorIds
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
  const fallbackAuthor = mdl?.instructorIds[0] ?? null;

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

/**
 * When a quiz is worth an instructor's attention.
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
  }));
}

/** Lectures an instructor is responsible for, across every assigned module. */
export function lectureLoad(member: StaffMember) {
  const modules = modulesFor(member);
  const lectures = modules.flatMap((mdl) =>
    consoleLectures(mdl.id).map((mod) => ({ ...mod, module: mdl })),
  );

  return {
    modules,
    lectures,
    published: lectures.filter((mod) => mod.state === "published").length,
    inReview: lectures.filter((mod) => mod.state === "in-review").length,
    unwritten: lectures.filter(
      (mod) => mod.state === "draft" || mod.state === "not-started",
    ).length,
    learners: modules.reduce(
      (sum, mdl) => sum + mdl.enrolments,
      0,
    ),
  };
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
    id: "stu-1904",
    name: LEARNER.name,
    initials: LEARNER.initials,
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

/** Learners on the modules one instructor is assigned to. */
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
          studentName: student.name,
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

/* -------------------------------------------------------------- moderation */

export function reviewsByStatus(status: Review["status"]): Review[] {
  return REVIEWS.filter((review) => review.status === status);
}

export function pendingReviewCount(): number {
  return reviewsByStatus("pending").length;
}

export function reviewsForModule(moduleId: string): Review[] {
  return REVIEWS.filter((review) => review.moduleId === moduleId);
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

/** Things waiting for somebody. The dashboard's first block. */
export function queues() {
  const drafts = MANAGED_MODULES.filter(
    (mdl) => mdl.status === "draft",
  );
  const unassigned = instructors().filter(
    (member) => (member.moduleIds ?? []).length === 0,
  );
  const lecturesInReview = MANAGED_MODULES.flatMap((mdl) =>
    consoleLectures(mdl.id).filter((mod) => mod.state === "in-review"),
  );
  const flagged = REVIEWS.filter(
    (review) => review.status === "pending" && review.flagged,
  );

  return {
    pendingReviews: pendingReviewCount(),
    flaggedReviews: flagged.length,
    lecturesInReview: lecturesInReview.length,
    draftModules: drafts.length,
    unassignedInstructors: unassigned.length,
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
  // what the module declares, or the instructor console and the admin
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
