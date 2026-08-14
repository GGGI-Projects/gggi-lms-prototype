/**
 * Everything the portal DERIVES from the mock data.
 *
 * The rule this file exists to enforce: a component may read a fact, but never
 * compute one. Progress percentages, "next module", quiz status and the pass
 * rule appear on the dashboard, the programme page, the module page, the
 * quizzes page and the certificate - five screens, and five slightly different
 * roundings if each of them does its own arithmetic.
 *
 * All of it is synchronous and pure, over the arrays in `content/`. When a
 * backend arrives these become the shape of the API response and the call
 * sites do not move.
 */

import { MODULES, type Module } from "@/content/curriculum";
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
import { PROGRAMMES, type Programme } from "@/content/site";

/* ---------------------------------------------------------------- lookups */

export function getProgramme(programmeId: string): Programme | undefined {
  return PROGRAMMES.find((programme) => programme.id === programmeId);
}

export function getModules(programmeId: string): Module[] {
  return MODULES[programmeId] ?? [];
}

export function getModule(
  programmeId: string,
  moduleId: string,
): Module | undefined {
  return getModules(programmeId).find((module) => module.id === moduleId);
}

export function getEnrolment(programmeId: string): Enrolment | undefined {
  return ENROLMENTS.find((enrolment) => enrolment.programmeId === programmeId);
}

export function getCertificate(certificateId: string): Certificate | undefined {
  return CERTIFICATES.find((certificate) => certificate.id === certificateId);
}

export function getCertificateFor(
  programmeId: string,
): Certificate | undefined {
  return CERTIFICATES.find(
    (certificate) => certificate.programmeId === programmeId,
  );
}

/* --------------------------------------------------------------- progress */

/**
 * One programme, as the portal talks about it.
 *
 * Every screen that shows a programme shows some subset of this, which is why
 * it is one object rather than six loose helpers - a card that shows a
 * percentage and a "next module" from two different calls can show 100% next
 * to a module still to do.
 */
export type ProgrammeProgress = {
  programme: Programme;
  modules: Module[];
  enrolment?: Enrolment;
  status: EnrolmentStatus;
  enrolled: boolean;
  completedCount: number;
  moduleCount: number;
  /** 0-100, rounded. Zero when not enrolled. */
  percent: number;
  /** Where "Resume" goes: the current module, or the first if untouched. */
  nextModule?: Module;
  minutesDone: number;
  minutesTotal: number;
  certificate?: Certificate;
  /** Quizzes passed against quizzes available to take. */
  quizzesPassed: number;
  /** Modules finished whose quiz has not been passed yet. */
  quizzesOutstanding: number;
};

export function progressFor(programmeId: string): ProgrammeProgress | undefined {
  const programme = getProgramme(programmeId);
  if (!programme) return undefined;

  const modules = getModules(programmeId);
  const enrolment = getEnrolment(programmeId);
  const completed = new Set(enrolment?.completedModuleIds ?? []);
  const completedCount = modules.filter((module) =>
    completed.has(module.id),
  ).length;

  const status: EnrolmentStatus = !enrolment
    ? "not-started"
    : completedCount === modules.length
      ? "completed"
      : "in-progress";

  // `currentModuleId` is where the learner stopped. Falling back to the first
  // unfinished module means a resume link is never dead, even if the mock data
  // is edited into an inconsistent state.
  const nextModule =
    modules.find((module) => module.id === enrolment?.currentModuleId) ??
    modules.find((module) => !completed.has(module.id)) ??
    undefined;

  const scores = enrolment?.quizScores ?? {};
  const quizzesPassed = modules.filter(
    (module) => (scores[module.id] ?? 0) >= PASS_MARK,
  ).length;

  return {
    programme,
    modules,
    enrolment,
    status,
    enrolled: Boolean(enrolment),
    completedCount,
    moduleCount: modules.length,
    percent: modules.length
      ? Math.round((completedCount / modules.length) * 100)
      : 0,
    nextModule,
    minutesDone: modules
      .filter((module) => completed.has(module.id))
      .reduce((sum, module) => sum + module.minutes, 0),
    minutesTotal: modules.reduce((sum, module) => sum + module.minutes, 0),
    certificate: getCertificateFor(programmeId),
    quizzesPassed,
    quizzesOutstanding: completedCount - quizzesPassed,
  };
}

/** Every programme, enrolled or not, in catalogue order. */
export function allProgress(): ProgrammeProgress[] {
  return PROGRAMMES.map((programme) => progressFor(programme.id)!).filter(
    Boolean,
  );
}

/** Only the ones the learner is in, most recently enrolled first. */
export function enrolledProgress(): ProgrammeProgress[] {
  return allProgress()
    .filter((entry) => entry.enrolled)
    .sort((a, b) =>
      (b.enrolment?.enrolledOn ?? "").localeCompare(a.enrolment?.enrolledOn ?? ""),
    );
}

/**
 * What the dashboard's "continue" card points at: the programme in progress
 * that was enrolled in most recently. Undefined once everything is finished,
 * which the dashboard renders as its own state rather than as an empty card.
 */
export function resumePoint(): ProgrammeProgress | undefined {
  return enrolledProgress().find((entry) => entry.status === "in-progress");
}

/* ----------------------------------------------------------- module state */

export type ModuleState = "completed" | "current" | "available";

/**
 * Nothing is LOCKED.
 *
 * Modules can be taken in any order and a learner can look at module nine on
 * their first day - the landing page says the programmes are self-paced with
 * nothing held back, and a padlock on row four contradicts it. The three
 * states below are about where you are, not about permission.
 */
export function moduleState(
  progress: ProgrammeProgress,
  moduleId: string,
): ModuleState {
  if (progress.enrolment?.completedModuleIds.includes(moduleId)) {
    return "completed";
  }
  return progress.nextModule?.id === moduleId ? "current" : "available";
}

/** Previous and next in the programme, for the module page's footer. */
export function moduleNeighbours(programmeId: string, moduleId: string) {
  const modules = getModules(programmeId);
  const index = modules.findIndex((module) => module.id === moduleId);
  return {
    index,
    previous: index > 0 ? modules[index - 1] : undefined,
    next: index >= 0 && index < modules.length - 1 ? modules[index + 1] : undefined,
  };
}

/* ------------------------------------------------------------------ quizzes */

export type QuizStatus = "passed" | "failed" | "not-attempted";

export type QuizSummary = {
  programme: Programme;
  module: Module;
  status: QuizStatus;
  /** Undefined when never attempted. */
  score?: number;
  /** A quiz sits behind its module - taking it first would give the answers away. */
  moduleCompleted: boolean;
  href: string;
};

/**
 * The three questions a given module's quiz asks.
 *
 * The pool is per programme (see the note in `content/portal.ts`), so the deal
 * rotates by module index to keep two consecutive quizzes from being identical.
 * Replacing the pools with real per-module banks means changing this function
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

export function quizFor(programmeId: string, moduleId: string): Question[] {
  const pool = QUESTION_POOL[programmeId] ?? [];
  if (!pool.length) return [];

  const index = getModules(programmeId).findIndex(
    (module) => module.id === moduleId,
  );
  const offset = ((index < 0 ? 0 : index) * 2) % pool.length;

  return Array.from(
    { length: Math.min(QUIZ_LENGTH, pool.length) },
    (_, i) => pool[(offset + i) % pool.length],
  );
}

export function quizStatus(programmeId: string, moduleId: string): QuizStatus {
  const score = getEnrolment(programmeId)?.quizScores[moduleId];
  if (score === undefined) return "not-attempted";
  return score >= PASS_MARK ? "passed" : "failed";
}

/** Every quiz in every enrolled programme, for the quizzes page. */
export function allQuizzes(): QuizSummary[] {
  return enrolledProgress().flatMap((progress) =>
    progress.modules.map((module) => ({
      programme: progress.programme,
      module,
      status: quizStatus(progress.programme.id, module.id),
      score: progress.enrolment?.quizScores[module.id],
      moduleCompleted: Boolean(
        progress.enrolment?.completedModuleIds.includes(module.id),
      ),
      href: `/programmes/${progress.programme.id}/modules/${module.id}/quiz`,
    })),
  );
}

/* -------------------------------------------------------------- dashboard */

/** The four figures across the top of the dashboard. */
export function learnerTotals() {
  const entries = enrolledProgress();
  return {
    programmes: entries.length,
    modulesCompleted: entries.reduce(
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
 * The landing page promises a module count and an hours figure per programme,
 * and the curriculum has to deliver both. Checked once at module load, in
 * development only.
 *
 * This is the kind of drift nobody sees in review and a client sees
 * immediately - they read "9 modules, 6 hours" on the landing page and then
 * count eight rows on the programme page during the demo.
 */
if (process.env.NODE_ENV !== "production") {
  for (const programme of PROGRAMMES) {
    const modules = getModules(programme.id);
    const hours = modules.reduce((sum, module) => sum + module.minutes, 0) / 60;

    if (modules.length !== programme.modules) {
      console.warn(
        `[portal] ${programme.id}: site.ts promises ${programme.modules} modules, curriculum.ts has ${modules.length}.`,
      );
    }
    if (Math.abs(hours - programme.hours) > 0.5) {
      console.warn(
        `[portal] ${programme.id}: site.ts promises ${programme.hours}h, curriculum.ts sums to ${hours.toFixed(1)}h.`,
      );
    }
  }
}
