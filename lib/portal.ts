/**
 * Everything the portal DERIVES from the mock data.
 *
 * The rule this file exists to enforce: a component may read a fact, but never
 * compute one. Progress percentages, "next lecture", quiz status and the pass
 * rule appear on the dashboard, the module page, the lecture page, the
 * quizzes page and the certificate - five screens, and five slightly different
 * roundings if each of them does its own arithmetic.
 *
 * All of it is synchronous and pure, over the arrays in `content/`. When a
 * backend arrives these become the shape of the API response and the call
 * sites do not move.
 */

import { LECTURES, type Lecture } from "@/content/curriculum";
import {
  ACTIVITY,
  CERTIFICATES,
  ENROLMENTS,
  PASS_MARK,
  QUESTION_POOL,
  type Certificate,
  type Enrolment,
  type EnrolmentStatus,
  type Question,
} from "@/content/portal";
import { MODULES, type Module } from "@/content/site";

/* ---------------------------------------------------------------- lookups */

export function getModule(moduleId: string): Module | undefined {
  return MODULES.find((mdl) => mdl.id === moduleId);
}

export function getLectures(moduleId: string): Lecture[] {
  return LECTURES[moduleId] ?? [];
}

export function getLecture(
  moduleId: string,
  lectureId: string,
): Lecture | undefined {
  return getLectures(moduleId).find((lecture) => lecture.id === lectureId);
}

export function getEnrolment(moduleId: string): Enrolment | undefined {
  return ENROLMENTS.find((enrolment) => enrolment.moduleId === moduleId);
}

export function getCertificate(certificateId: string): Certificate | undefined {
  return CERTIFICATES.find((certificate) => certificate.id === certificateId);
}

export function getCertificateFor(
  moduleId: string,
): Certificate | undefined {
  return CERTIFICATES.find(
    (certificate) => certificate.moduleId === moduleId,
  );
}

/* --------------------------------------------------------------- progress */

/**
 * One module, as the portal talks about it.
 *
 * Every screen that shows a module shows some subset of this, which is why
 * it is one object rather than six loose helpers - a card that shows a
 * percentage and a "next lecture" from two different calls can show 100% next
 * to a lecture still to do.
 */
export type ModuleProgress = {
  module: Module;
  lectures: Lecture[];
  enrolment?: Enrolment;
  status: EnrolmentStatus;
  enrolled: boolean;
  completedCount: number;
  lectureCount: number;
  /** 0-100, rounded. Zero when not enrolled. */
  percent: number;
  /** Where "Resume" goes: the current lecture, or the first if untouched. */
  nextLecture?: Lecture;
  minutesDone: number;
  minutesTotal: number;
  certificate?: Certificate;
  /** Quizzes passed against quizzes available to take. */
  quizzesPassed: number;
  /** Lectures finished whose quiz has not been passed yet. */
  quizzesOutstanding: number;
};

export function progressFor(moduleId: string): ModuleProgress | undefined {
  const mdl = getModule(moduleId);
  if (!mdl) return undefined;

  const lectures = getLectures(moduleId);
  const enrolment = getEnrolment(moduleId);
  const completed = new Set(enrolment?.completedLectureIds ?? []);
  const completedCount = lectures.filter((lecture) =>
    completed.has(lecture.id),
  ).length;

  const status: EnrolmentStatus = !enrolment
    ? "not-started"
    : completedCount === lectures.length
      ? "completed"
      : "in-progress";

  // `currentLectureId` is where the learner stopped. Falling back to the first
  // unfinished lecture means a resume link is never dead, even if the mock data
  // is edited into an inconsistent state.
  const nextLecture =
    lectures.find((lecture) => lecture.id === enrolment?.currentLectureId) ??
    lectures.find((lecture) => !completed.has(lecture.id)) ??
    undefined;

  const scores = enrolment?.quizScores ?? {};
  const quizzesPassed = lectures.filter(
    (lecture) => (scores[lecture.id] ?? 0) >= PASS_MARK,
  ).length;

  return {
    module: mdl,
    lectures,
    enrolment,
    status,
    enrolled: Boolean(enrolment),
    completedCount,
    lectureCount: lectures.length,
    percent: lectures.length
      ? Math.round((completedCount / lectures.length) * 100)
      : 0,
    nextLecture,
    minutesDone: lectures
      .filter((lecture) => completed.has(lecture.id))
      .reduce((sum, lecture) => sum + lecture.minutes, 0),
    minutesTotal: lectures.reduce((sum, lecture) => sum + lecture.minutes, 0),
    certificate: getCertificateFor(moduleId),
    quizzesPassed,
    quizzesOutstanding: completedCount - quizzesPassed,
  };
}

/** Every module, enrolled or not, in catalogue order. */
export function allProgress(): ModuleProgress[] {
  return MODULES.map((mdl) => progressFor(mdl.id)!).filter(
    Boolean,
  );
}

/** Only the ones the learner is in, most recently enrolled first. */
export function enrolledProgress(): ModuleProgress[] {
  return allProgress()
    .filter((entry) => entry.enrolled)
    .sort((a, b) =>
      (b.enrolment?.enrolledOn ?? "").localeCompare(a.enrolment?.enrolledOn ?? ""),
    );
}

/**
 * What the dashboard's "continue" card points at: the module in progress
 * that was enrolled in most recently. Undefined once everything is finished,
 * which the dashboard renders as its own state rather than as an empty card.
 */
export function resumePoint(): ModuleProgress | undefined {
  return enrolledProgress().find((entry) => entry.status === "in-progress");
}

/* ----------------------------------------------------------- lecture state */

export type LectureState = "completed" | "current" | "available";

/**
 * Nothing is LOCKED.
 *
 * Lectures can be taken in any order and a learner can look at lecture nine on
 * their first day - the landing page says the modules are self-paced with
 * nothing held back, and a padlock on row four contradicts it. The three
 * states below are about where you are, not about permission.
 */
export function lectureState(
  progress: ModuleProgress,
  lectureId: string,
): LectureState {
  if (progress.enrolment?.completedLectureIds.includes(lectureId)) {
    return "completed";
  }
  return progress.nextLecture?.id === lectureId ? "current" : "available";
}

/** Previous and next in the module, for the lecture page's footer. */
export function lectureNeighbours(moduleId: string, lectureId: string) {
  const lectures = getLectures(moduleId);
  const index = lectures.findIndex((lecture) => lecture.id === lectureId);
  return {
    index,
    previous: index > 0 ? lectures[index - 1] : undefined,
    next: index >= 0 && index < lectures.length - 1 ? lectures[index + 1] : undefined,
  };
}

/* ------------------------------------------------------------------ quizzes */

export type QuizStatus = "passed" | "failed" | "not-attempted";

export type QuizSummary = {
  module: Module;
  lecture: Lecture;
  status: QuizStatus;
  /** Undefined when never attempted. */
  score?: number;
  /** A quiz sits behind its lecture - taking it first would give the answers away. */
  lectureCompleted: boolean;
  href: string;
};

/**
 * The three questions a given lecture's quiz asks.
 *
 * The pool is per module (see the note in `content/portal.ts`), so the deal
 * rotates by lecture index to keep two consecutive quizzes from being identical.
 * Replacing the pools with real per-lecture banks means changing this function
 * and nothing that calls it.
 */
/**
 * FOUR, and the number is not arbitrary. The pass mark is 70%, so the quiz
 * length decides which scores are even reachable: at three questions the only
 * passing score is 100% and "67%" is the best a near miss can look, which
 * makes every result read as all-or-nothing. Four gives 75% and 100% as passes
 * and 50% as an honest near miss.
 */
export const QUIZ_LENGTH = 4;

export function quizFor(moduleId: string, lectureId: string): Question[] {
  const pool = QUESTION_POOL[moduleId] ?? [];
  if (!pool.length) return [];

  const index = getLectures(moduleId).findIndex(
    (lecture) => lecture.id === lectureId,
  );
  const offset = ((index < 0 ? 0 : index) * 2) % pool.length;

  return Array.from(
    { length: Math.min(QUIZ_LENGTH, pool.length) },
    (_, i) => pool[(offset + i) % pool.length],
  );
}

export function quizStatus(moduleId: string, lectureId: string): QuizStatus {
  const score = getEnrolment(moduleId)?.quizScores[lectureId];
  if (score === undefined) return "not-attempted";
  return score >= PASS_MARK ? "passed" : "failed";
}

/** Every quiz in every enrolled module, for the quizzes page. */
export function allQuizzes(): QuizSummary[] {
  return enrolledProgress().flatMap((progress) =>
    progress.lectures.map((lecture) => ({
      module: progress.module,
      lecture,
      status: quizStatus(progress.module.id, lecture.id),
      score: progress.enrolment?.quizScores[lecture.id],
      lectureCompleted: Boolean(
        progress.enrolment?.completedLectureIds.includes(lecture.id),
      ),
      href: `/modules/${progress.module.id}/lectures/${lecture.id}/quiz`,
    })),
  );
}

/* -------------------------------------------------------------- dashboard */

/** The four figures across the top of the dashboard. */
export function learnerTotals() {
  const entries = enrolledProgress();
  return {
    modules: entries.length,
    lecturesCompleted: entries.reduce(
      (sum, entry) => sum + entry.completedCount,
      0,
    ),
    /** One decimal, because whole hours would read as 1h for most of a month. */
    hours:
      Math.round(
        (entries.reduce((sum, entry) => sum + entry.minutesDone, 0) / 60) * 10,
      ) / 10,
    certificates: CERTIFICATES.length,
  };
}

export function recentActivity(limit = 5) {
  return ACTIVITY.slice(0, limit);
}

/* ------------------------------------------------------------ formatting */

/**
 * One date format for the whole portal.
 *
 * `en-GB` explicitly rather than the visitor's locale: the format has to be
 * identical on the server and the client or React reports a hydration
 * mismatch, and the audience is one country.
 */
const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(iso: string): string {
  return DATE.format(new Date(`${iso}T00:00:00`));
}

/** Long form, for the certificate. */
const DATE_LONG = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDateLong(iso: string): string {
  return DATE_LONG.format(new Date(`${iso}T00:00:00`));
}

/** `95` -> `1h 35m`, `40` -> `40 min`. Used wherever a duration is shown. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export { PASS_MARK };

/* -------------------------------------------------------------- consistency */

/**
 * The landing page promises a lecture count and an hours figure per module,
 * and the curriculum has to deliver both. Checked once at lecture load, in
 * development only.
 *
 * This is the kind of drift nobody sees in review and a client sees
 * immediately - they read "9 lectures, 6 hours" on the landing page and then
 * count eight rows on the module page during the demo.
 */
if (process.env.NODE_ENV !== "production") {
  for (const mdl of MODULES) {
    const lectures = getLectures(mdl.id);
    const hours = lectures.reduce((sum, lecture) => sum + lecture.minutes, 0) / 60;

    if (lectures.length !== mdl.lectures) {
      console.warn(
        `[portal] ${mdl.id}: site.ts promises ${mdl.lectures} lectures, curriculum.ts has ${lectures.length}.`,
      );
    }
    if (Math.abs(hours - mdl.hours) > 0.5) {
      console.warn(
        `[portal] ${mdl.id}: site.ts promises ${mdl.hours}h, curriculum.ts sums to ${hours.toFixed(1)}h.`,
      );
    }
  }
}
