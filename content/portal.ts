/**
 * The signed-in learner, and everything the portal shows about them.
 *
 * This is the mock account the client will be shown during the demo. It has a
 * DELIBERATE SHAPE: one module finished (so the certificate screens have
 * something in them), one part-way through (so the dashboard has something to
 * resume), one barely started (so progress bars are not all at the same
 * position), and two never enrolled (so the catalogue has an empty state to
 * show as well as a full one). A demo account where everything is at 60% shows
 * one screen five times.
 *
 * Nothing here is computed - `lib/portal.ts` does that, so a component never
 * has to derive a percentage twice and get it slightly different the second
 * time.
 */

import { LECTURES } from "@/content/curriculum";

/* ------------------------------------------------------------------ learner */

export const LEARNER = {
  name: "Nadeesha Perera",
  /** Shown on the certificate. Kept separate: a certificate carries the legal
   *  name, and the portal greets you by the name you go by. */
  certificateName: "K. A. Nadeesha Perera",
  email: "nadeesha.perera@example.lk",
  /** Two letters, for the avatar. Drawn rather than uploaded - the prototype
   *  ships no images. */
  initials: "NP",
  role: "Assistant Director (Planning)",
  organisation: "District Secretariat, Galle",
  sector: "Government or public sector",
  district: "Galle",
  joined: "2026-05-18",
  /** Used by the settings page. No preference is persisted anywhere. */
  preferences: {
    emailProgress: true,
    emailNewModules: true,
    emailProduct: false,
    language: "English",
    reminders: "Weekly",
  },
} as const;

/* --------------------------------------------------------------- enrolments */

export type EnrolmentStatus = "completed" | "in-progress" | "not-started";

export type Enrolment = {
  moduleId: string;
  enrolledOn: string;
  /** Lecture ids, in the order they were finished. */
  completedLectureIds: string[];
  /**
   * Percentage scored, keyed by lecture id. A lecture can be complete without a
   * pass here - the quiz is taken after the content - which is exactly the
   * state the quizzes page exists to surface.
   */
  quizScores: Record<string, number>;
  /**
   * Percentage of a lecture's written questions answered well enough to pass,
   * keyed by lecture id. Only lectures an instructor actually wrote written
   * questions for appear here - see `WRITTEN_QUESTIONS` below. A lecture with
   * no entry and no written questions is not outstanding; a lecture with no
   * entry that DOES have written questions is - same shape as `quizScores`,
   * same reason.
   */
  writtenScores: Record<string, number>;
  /** Null once every lecture is done. */
  currentLectureId: string | null;
};

/** The pass mark for every quiz on the platform. One number, one rule. */
export const PASS_MARK = 70;

export const ENROLMENTS: Enrolment[] = [
  {
    moduleId: "provincial-adaptation-plan",
    enrolledOn: "2026-05-19",
    completedLectureIds: LECTURES["provincial-adaptation-plan"].map((m) => m.id),
    // Every score here is a multiple of 25: a quiz is four questions, so those
    // are the only results that exist. See `QUIZ_LENGTH` in `lib/portal.ts`.
    quizScores: {
      "what-the-nap-asks-of-a-province": 100,
      "reading-the-naps-sector-chapters": 100,
      "translating-priorities-into-provincial-action": 75,
      "consulting-divisional-secretariats": 100,
      "costing-a-localised-adaptation-action": 75,
      "sequencing-across-the-budget-cycle": 100,
      "monitoring-a-localised-plan": 100,
    },
    // This module is fully finished and its certificate already issued, so
    // every lecture's written questions are shown passed too - a module with
    // a certificate cannot show a locked "next lecture" behind it.
    writtenScores: {
      "what-the-nap-asks-of-a-province": 100,
      "reading-the-naps-sector-chapters": 100,
      "translating-priorities-into-provincial-action": 100,
      "consulting-divisional-secretariats": 100,
      "costing-a-localised-adaptation-action": 100,
      "sequencing-across-the-budget-cycle": 100,
      "monitoring-a-localised-plan": 100,
    },
    currentLectureId: null,
  },
  {
    moduleId: "climate-vulnerability-assessment",
    enrolledOn: "2026-06-02",
    completedLectureIds: [
      "why-vulnerability-is-not-risk",
      "hazard-exposure-sensitivity",
      "reading-sri-lankas-climate-hazard-data",
      "building-a-vulnerability-index",
    ],
    quizScores: {
      "why-vulnerability-is-not-risk": 100,
      // Below the 70% pass mark - the quizzes page has to show a retake as
      // well as a tick, or half of what that screen is for is invisible.
      "hazard-exposure-sensitivity": 50,
      "reading-sri-lankas-climate-hazard-data": 100,
      // Lecture 04 is finished but its quiz has not been attempted - the case
      // the quizzes page is built around.
    },
    // "reading-sri-lankas-climate-hazard-data" has written questions (see
    // `WRITTEN_QUESTIONS`) and its quiz was passed, but no entry exists here -
    // that lecture's gate is deliberately left uncleared, to show that a
    // passed quiz alone is no longer enough where written questions exist.
    writtenScores: {},
    currentLectureId: "assessing-adaptive-capacity",
  },
  {
    moduleId: "bankable-climate-finance-proposals",
    enrolledOn: "2026-07-14",
    completedLectureIds: ["what-makes-a-project-bankable"],
    quizScores: {
      "what-makes-a-project-bankable": 100,
    },
    // This lecture's written questions were also passed, so its gate is fully
    // cleared and "Next lecture" is unlocked - the positive case alongside
    // "climate-vulnerability-assessment" above, which shows the blocked one.
    writtenScores: {
      "what-makes-a-project-bankable": 100,
    },
    currentLectureId: "matching-a-project-to-a-source-of-finance",
  },
];

/* ------------------------------------------------------------- certificates */

export type Certificate = {
  id: string;
  moduleId: string;
  /** Printed on the certificate and checkable against the register. */
  reference: string;
  issuedOn: string;
  /** Average across the module's lecture quizzes, rounded. */
  averageScore: number;
};

export const CERTIFICATES: Certificate[] = [
  {
    id: "gp-2026-pa-04817",
    moduleId: "provincial-adaptation-plan",
    reference: "GP-2026-PA-04817",
    issuedOn: "2026-07-28",
    averageScore: 93,
  },
];

/* ---------------------------------------------------------------- activity */

export type ActivityKind = "lecture" | "quiz" | "certificate" | "enrolment";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  title: string;
  /** Second line - the module, or the score. */
  detail: string;
  /** ISO date. Rendered through one formatter so the whole portal agrees. */
  on: string;
  href: string;
};

/**
 * Newest first, and kept short. A feed is a reassurance that the platform
 * remembers what you did, not a log - eight entries is already more than
 * anyone reads.
 */
export const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    kind: "lecture",
    title: "Building a vulnerability index",
    detail: "Climate Vulnerability Assessment",
    on: "2026-08-11",
    href: "/modules/climate-vulnerability-assessment/lectures/building-a-vulnerability-index",
  },
  {
    id: "a2",
    kind: "quiz",
    title: "Reading Sri Lanka's climate hazard data",
    detail: "Passed with 100%",
    on: "2026-08-09",
    href: "/modules/climate-vulnerability-assessment/lectures/reading-sri-lankas-climate-hazard-data/quiz",
  },
  {
    id: "a3",
    kind: "lecture",
    title: "What makes a project bankable",
    detail: "Developing Bankable Climate Finance Proposals",
    on: "2026-07-31",
    href: "/modules/bankable-climate-finance-proposals/lectures/what-makes-a-project-bankable",
  },
  {
    id: "a4",
    kind: "certificate",
    title: "Localising the Provincial Adaptation Plan",
    detail: "Certificate GP-2026-PA-04817 issued",
    on: "2026-07-28",
    href: "/certificates/gp-2026-pa-04817",
  },
  {
    id: "a5",
    kind: "enrolment",
    title: "Developing Bankable Climate Finance Proposals",
    detail: "Enrolled",
    on: "2026-07-14",
    href: "/modules/bankable-climate-finance-proposals",
  },
];

/* ------------------------------------------------------------------ quizzes */

export type Question = {
  id: string;
  prompt: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  /**
   * Staff-facing only. Read by `<QuizManager>` in the instructor and admin
   * consoles, alongside `answer` - never by anything in the student portal.
   * The question pool here is reused across lectures and across every
   * retake (see the note below), so a learner shown this once would have it
   * for good; `<QuizRunner>` in the student portal reports only a score.
   */
  explanation: string;
};

/**
 * A pool of questions per module, not per lecture.
 *
 * In the real platform each lecture owns its own questions. Authoring five
 * genuine questions for each of the 37 lectures is a content job rather than a
 * design one, so the prototype holds five per MODULE and `quizFor()` in
 * `lib/portal.ts` deals a rotating three of them to each lecture. Every quiz a
 * client opens is therefore about the right subject and is genuinely
 * answerable; two quizzes in the same module will share a question.
 *
 * The rotation lives in one function, so replacing this with real per-lecture
 * banks means changing that function and nothing else.
 */
export const QUESTION_POOL: Record<string, Question[]> = {
  "climate-vulnerability-assessment": [
    {
      id: "cva1",
      prompt: "Risk is usually described as the combination of three things. Which set is it?",
      options: [
        "Hazard, exposure and vulnerability",
        "Temperature, rainfall and sea level",
        "Probability, cost and time",
        "Mitigation, adaptation and finance",
      ],
      answer: 0,
      explanation:
        "A hazard on its own creates no risk. Risk appears when something is exposed to it and is unable to absorb the effect.",
    },
    {
      id: "cva2",
      prompt: "What does exposure measure that vulnerability does not?",
      options: [
        "How much damage an event causes",
        "Where something sits relative to a hazard",
        "How quickly a community recovers",
        "The cost of an adaptation measure",
      ],
      answer: 1,
      explanation:
        "Exposure is a location question - what sits in the hazard's path - independent of how well that thing can absorb the impact, which is what vulnerability measures.",
    },
    {
      id: "cva3",
      prompt: "Why is a composite vulnerability index dangerous to use alone?",
      options: [
        "It is usually out of date",
        "It cannot be compared between districts",
        "It compresses different conditions into one number",
        "It excludes economic factors",
      ],
      answer: 2,
      explanation:
        "Two districts can score identically for opposite reasons. Use the index to decide where to look and the underlying indicators to decide what to do.",
    },
    {
      id: "cva4",
      prompt: "Why does a national hazard dataset need care when used at divisional scale?",
      options: [
        "It is usually inaccurate",
        "Its resolution was built for a coarser comparison",
        "It excludes rainfall data",
        "It is updated too rarely to use",
      ],
      answer: 1,
      explanation:
        "A national map is built to compare provinces, not to site a specific culvert. Using it at finer scale borrows a precision the data never had.",
    },
    {
      id: "cva5",
      prompt: "What is the purpose of a field verification visit?",
      options: [
        "To collect data for the first time",
        "To check a desk-based assessment against reality",
        "To replace the vulnerability index entirely",
        "To satisfy a funder's reporting requirement",
      ],
      answer: 1,
      explanation:
        "A desk-based index is a hypothesis about a place. A short, structured field visit is what turns that hypothesis into an assessment somebody can act on.",
    },
  ],

  "provincial-adaptation-plan": [
    {
      id: "pap1",
      prompt: "What is the most common reason a NAP action fails to reach the province responsible for it?",
      options: [
        "The action is technically infeasible",
        "Nobody at the provincial level was told it exists",
        "The province lacks any relevant staff",
        "The action was written for a different country",
      ],
      answer: 1,
      explanation:
        "Most localisation failures are administrative, not technical - the action simply was never routed to a named owner.",
    },
    {
      id: "pap2",
      prompt: "Which of these is a well-localised version of a national priority?",
      options: [
        "Strengthen drainage resilience in flood-prone areas",
        "Improve infrastructure nationwide",
        "A costed culvert upgrade on a named road, sized to a stated rainfall figure",
        "Support climate adaptation in general",
      ],
      answer: 2,
      explanation:
        "Specificity is what makes an action fundable. A named site with an estimated cost is something a budget officer can act on.",
    },
    {
      id: "pap3",
      prompt: "Why should a localisation exercise consult divisional secretariats directly?",
      options: [
        "It is a legal requirement",
        "They hold local knowledge no national dataset carries",
        "It reduces the cost of the exercise",
        "It replaces the need for hazard data",
      ],
      answer: 1,
      explanation:
        "Divisional secretariats know which roads actually flood and which measures were already tried - knowledge a desk exercise cannot recover on its own.",
    },
    {
      id: "pap4",
      prompt: "Why present a localised action's cost as a range rather than a single figure?",
      options: [
        "Ranges are required by the treasury",
        "A single figure invites challenge the moment ground conditions differ from its assumption",
        "Ranges are easier to calculate",
        "Single figures cannot be audited",
      ],
      answer: 1,
      explanation:
        "A cost presented as a bounded range, with its assumptions stated, survives scrutiny because it has already admitted where it could be wrong.",
    },
    {
      id: "pap5",
      prompt: "What usually happens to an adaptation submission asking for every action in one budget year?",
      options: [
        "It is approved in full more often",
        "It is the easiest one to cut in full",
        "It automatically rolls over to next year",
        "It receives priority processing",
      ],
      answer: 1,
      explanation:
        "A sequenced submission - a smaller first-year ask that unlocks a larger second one - survives a tight budget round better than an ambitious one submitted whole.",
    },
  ],

  "bankable-climate-finance-proposals": [
    {
      id: "bcf1",
      prompt: "What makes a project 'bankable' rather than simply worthwhile?",
      options: [
        "It has government backing",
        "It produces a measurable return or saving a funder can point to",
        "It is technically innovative",
        "It has no environmental impact",
      ],
      answer: 1,
      explanation:
        "A project can be entirely worth doing and still not be bankable if nothing about it produces a measurable return a funder can point to.",
    },
    {
      id: "bcf2",
      prompt: "A revenue-generating project pitched only for grant funding is making what mistake?",
      options: [
        "Asking for too much money",
        "Wasting the strongest thing the project has",
        "Underestimating construction costs",
        "Ignoring the climate rationale",
      ],
      answer: 1,
      explanation:
        "Matching the finance type to a project's actual cash flow is decided before the proposal is drafted - a revenue-generating project belongs with a different source.",
    },
    {
      id: "bcf3",
      prompt: "What does a strong climate rationale have to do?",
      options: [
        "Cite as many co-benefits as possible",
        "Connect the intervention to a climate outcome by steps someone can check",
        "Avoid mentioning cost",
        "Focus only on emissions reduced",
      ],
      answer: 1,
      explanation:
        "A rationale that asserts a benefit without a checkable chain of steps does not survive review; each link has to be something a reader can follow and dispute.",
    },
    {
      id: "bcf4",
      prompt: "In project finance terms, where should risk generally sit?",
      options: [
        "With the party that has the deepest balance sheet",
        "With the party best able to manage it",
        "Always with the public sector",
        "Wherever the funder prefers",
      ],
      answer: 1,
      explanation:
        "Demand risk placed on a contractor who cannot influence demand is priced heavily or refused; retained by the party that can manage it, it often costs far less.",
    },
    {
      id: "bcf5",
      prompt: "Why include a downside case in a financial model?",
      options: [
        "It is a mandatory annex in every template",
        "Appraisers will find it anyway, and naming it builds credibility",
        "It lowers the interest rate offered",
        "It transfers liability to the funder",
      ],
      answer: 1,
      explanation:
        "Stating the point at which a project stops being viable is a signal of a model worth trusting on everything else.",
    },
  ],

  "gender-social-inclusion": [
    {
      id: "gsi1",
      prompt: "Why does a GSI lens have to be applied from the first consultation, not added afterward?",
      options: [
        "It is a legal requirement",
        "A GSI annex added after a plan is written rarely changes what the plan does",
        "It reduces the cost of the plan",
        "It is faster to do afterward",
      ],
      answer: 1,
      explanation:
        "Mainstreaming succeeds or fails at specific decision points made early on; adding a review chapter at the end changes very little about what the plan actually does.",
    },
    {
      id: "gsi2",
      prompt: "Which of these is a meaningful GSI indicator?",
      options: [
        "Number of women who attended a meeting",
        "Change in who holds a decision-making role after an intervention",
        "Number of leaflets distributed",
        "Number of consultations held",
      ],
      answer: 1,
      explanation:
        "Attendance measures who showed up, not whether anything changed. A meaningful indicator tracks a real shift - access, role or resource control.",
    },
    {
      id: "gsi3",
      prompt: "Why is a single, centrally held public meeting often exclusionary?",
      options: [
        "It is too expensive to organise",
        "It assumes the attendee is free at that time and place",
        "It requires too much paperwork",
        "It reduces attendance overall",
      ],
      answer: 1,
      explanation:
        "A weekday afternoon meeting at a district office assumes the attendee does not have paid or unpaid care responsibilities at that hour - an unexamined assumption, not a deliberate exclusion.",
    },
    {
      id: "gsi4",
      prompt: "What makes a GSI requirement operationally meaningful, rather than a wish?",
      options: [
        "It uses the word 'inclusive'",
        "It is attached to a specific, checkable decision point",
        "It appears in the plan's introduction",
        "It is signed by a senior official",
      ],
      answer: 1,
      explanation:
        "'Gender considerations will be taken into account' commits nobody to anything; a checkable requirement attached to a specific decision - like a panel composition rule - actually changes what happens.",
    },
    {
      id: "gsi5",
      prompt: "What should happen after a consultation surfaces an exclusion finding?",
      options: [
        "Nothing, until the next full review",
        "A visible response, even if partial",
        "The finding should be removed from the report",
        "A new consultation should be held immediately",
      ],
      answer: 1,
      explanation:
        "A community that raises an issue and sees no visible response learns not to raise it again. The response does not need to be complete, but it needs to be visible.",
    },
  ],

  "gender-responsive-budgeting": [
    {
      id: "grb1",
      prompt: "What is the most common misunderstanding about gender-responsive budgeting?",
      options: [
        "That it requires new legislation",
        "That it means setting aside a separate fund for women",
        "That it only applies to health and education",
        "That it cannot be audited",
      ],
      answer: 1,
      explanation:
        "GRB is a method for examining and adjusting the whole budget for who it reaches - it does not create a separate, earmarked fund.",
    },
    {
      id: "grb2",
      prompt: "Why can a budget line written in gender-neutral language still be gender-unequal in effect?",
      options: [
        "Because budgets are always biased",
        "Because who actually uses a service can differ sharply even when the line's wording does not name any group",
        "Because gender-neutral language is illegal",
        "Because it is never checked",
      ],
      answer: 1,
      explanation:
        "'Agricultural extension services' sounds neutral, but if officers visit only during hours or channels one group can access, the line reaches groups very unevenly in practice.",
    },
    {
      id: "grb3",
      prompt: "What is the main weakness of a gender budget statement that lists spending by ministry with no further comment?",
      options: [
        "It is too long",
        "It restates the budget without analysing who it reaches",
        "It omits the treasury's letterhead",
        "It uses too many numbers",
      ],
      answer: 1,
      explanation:
        "A statement that lists figures without analysis is rejected as often as it is approved - reviewers are checking for analysis, not a restated budget.",
    },
    {
      id: "grb4",
      prompt: "Where does most sex-disaggregated administrative data actually come from?",
      options: [
        "A dedicated national household survey",
        "Existing beneficiary registers and attendance records not yet analysed by sex",
        "Data purchased from a private vendor",
        "It generally does not exist anywhere",
      ],
      answer: 1,
      explanation:
        "Beneficiary registers and attendance sheets are frequently already collected by sex, even where nobody has analysed them that way yet.",
    },
    {
      id: "grb5",
      prompt: "Why does uncounted gender-responsive spending weaken an institution's next budget request?",
      options: [
        "It has no effect on future requests",
        "A completed, evidenced report is the strongest argument for the next allocation, and uncounted spending provides none",
        "It triggers an automatic audit",
        "It reduces the pass mark for future submissions",
      ],
      answer: 1,
      explanation:
        "A well-evidenced report is proof the previous investment worked. Spending that was never tagged and reported cannot be used to make that case.",
    },
  ],
};

/* --------------------------------------------------------- written questions */

export type WrittenQuestion = {
  id: string;
  /** Asks for two or three sentences, never an essay - see the drawer copy in
   *  `<AddWrittenQuestionAction>`. */
  prompt: string;
  /**
   * The words and phrases an answer is checked for. Matching is a simple,
   * case-insensitive "does this phrase appear" test against the learner's
   * text - not a language model and not spelling-tolerant, which is exactly
   * why an instructor is shown the checked words on the authoring page next
   * to the answer, rather than only a pass/fail mark. Staff-facing only -
   * see `modelAnswer` below.
   */
  keywords: string[];
  /** How many of `keywords` have to appear for the answer to pass. Never all
   *  of them - a real answer paraphrases, and requiring every listed word
   *  back verbatim would fail an answer that a person reading it would pass. */
  minMatches: number;
  /**
   * Staff-facing only, same rule as `Question.explanation`: read by
   * `<WrittenQuestionsManager>` in the instructor and admin consoles, never
   * by anything in the student portal. A learner is told only whether their
   * own answer passed, never what a correct one would have said.
   */
  modelAnswer: string;
};

/**
 * Written questions, per LECTURE rather than per module.
 *
 * Unlike `QUESTION_POOL`, there is no rotation trick here: an instructor
 * writes them one lecture at a time, and a lecture id with no entry below
 * simply has none - `hasWrittenQuestions()` in `lib/portal.ts` is the one
 * place that fact is read from. Written questions are a genuinely OPTIONAL
 * feature (see FR-INS-121 in the SRS) and most real lectures are expected to
 * have none, the same way most quizzes will not need a rewrite.
 *
 * EVERY LECTURE CARRIES A SET HERE, which is a demo decision, not the
 * intended steady state: it means a client clicking into any lecture's quiz
 * sees the written-questions feature working, rather than having to be
 * pointed at the one lecture that has it. The four lectures written first -
 * `hazard-exposure-sensitivity`, `reading-sri-lankas-climate-hazard-data`,
 * `what-makes-a-project-bankable`, `designing-an-inclusive-consultation` -
 * still carry the three outcomes the feature needs to demonstrate (a failed
 * quiz, a passed quiz blocked by unattempted written questions, and a fully
 * cleared gate); every lecture after them carries two questions each, mainly
 * so the coverage is complete rather than to add a fourth outcome.
 */
export const WRITTEN_QUESTIONS: Record<string, WrittenQuestion[]> = {
  "hazard-exposure-sensitivity": [
    {
      id: "hes-w1",
      prompt:
        "In two or three sentences: why can the same flood affect two equally exposed households very differently?",
      keywords: ["sensitiv", "cope", "resource", "absorb"],
      minMatches: 2,
      modelAnswer:
        "Exposure only says both households sit in the flood's path - it says nothing about their capacity to cope with it. Sensitivity, and the resources each household can call on, decide how much the same flood actually costs them.",
    },
    {
      id: "hes-w2",
      prompt:
        "In two or three sentences: what is the difference between a hazard and a risk?",
      keywords: ["expos", "vulnerab", "combin", "harm"],
      minMatches: 2,
      modelAnswer:
        "A hazard is the event itself, such as a flood or a heatwave. Risk only exists once that hazard is combined with exposure and vulnerability - a hazard nothing is exposed to, or that nothing is vulnerable to, creates no risk at all.",
    },
    {
      id: "hes-w3",
      prompt:
        "In two or three sentences: why does adaptive capacity change how much a hazard actually costs a community?",
      keywords: ["adapt", "recover", "resource", "reduce"],
      minMatches: 2,
      modelAnswer:
        "Adaptive capacity is what a community can draw on to reduce a hazard's impact or recover from it quickly - savings, infrastructure, institutions. Two communities facing an identical hazard end up with very different costs depending on how much of this capacity each one has.",
    },
  ],

  "reading-sri-lankas-climate-hazard-data": [
    {
      id: "rshd-w1",
      prompt:
        "In two or three sentences: why does a national hazard dataset need care when used at divisional scale?",
      keywords: ["resolution", "scale", "compar", "precision"],
      minMatches: 2,
      modelAnswer:
        "A national map is built to compare provinces at a coarse resolution, not to site a specific culvert. Using it at divisional or finer scale borrows a precision the data never had.",
    },
    {
      id: "rshd-w2",
      prompt:
        "In two or three sentences: what is the purpose of a field verification visit, if the dataset has already been read?",
      keywords: ["check", "reality", "desk", "hypothesis"],
      minMatches: 2,
      modelAnswer:
        "A desk-based reading of the dataset is a hypothesis about a place, not a confirmed fact. A short, structured field visit checks that hypothesis against reality before anyone acts on it.",
    },
    {
      id: "rshd-w3",
      prompt:
        "In two or three sentences: what should you do when a hazard layer disagrees with what local knowledge says about a specific site?",
      keywords: ["local", "verify", "resolution", "trust"],
      minMatches: 2,
      modelAnswer:
        "Treat the disagreement as a resolution problem before assuming either source is wrong, and verify on the ground where practical. Local knowledge often reflects site detail a coarse national layer was never built to capture.",
    },
  ],

  "what-makes-a-project-bankable": [
    {
      id: "wmpb-w1",
      prompt:
        "In two or three sentences: what makes a project 'bankable' rather than simply worthwhile?",
      keywords: ["measurable", "return", "cash flow", "fund"],
      minMatches: 2,
      modelAnswer:
        "A worthwhile project is one that is worth doing on its merits. A bankable one goes further - it produces a measurable return, saving, or cash flow that a funder can point to and underwrite, not just a good outcome.",
    },
    {
      id: "wmpb-w2",
      prompt:
        "In two or three sentences: why does matching the finance type to the project matter before a proposal is drafted?",
      keywords: ["revenue", "grant", "match", "cash flow"],
      minMatches: 2,
      modelAnswer:
        "A revenue-generating project pitched only for grant funding wastes the strongest thing it has - a repayable cash flow that could unlock a loan or blended finance instead. Getting this match wrong before drafting means rewriting the whole proposal later.",
    },
    {
      id: "wmpb-w3",
      prompt:
        "In two or three sentences: what does a strong climate rationale have to do that a list of co-benefits does not?",
      keywords: ["connect", "step", "check", "outcome"],
      minMatches: 2,
      modelAnswer:
        "A strong rationale connects the intervention to a climate outcome through steps a reader can follow and check, not just a list of claimed co-benefits. A rationale that asserts a benefit without a checkable chain of steps does not survive review.",
    },
  ],

  // The instructor console's demo account is assigned to
  // "gender-social-inclusion" (see `SESSION.instructor` in `content/staff.ts`),
  // so this lecture is what a signed-in instructor sees when authoring written
  // questions of their own, rather than only ever reading someone else's.
  "designing-an-inclusive-consultation": [
    {
      id: "diac-w1",
      prompt:
        "In two or three sentences: why is a single, centrally held public meeting often exclusionary?",
      keywords: ["assum", "time", "access", "care"],
      minMatches: 2,
      modelAnswer:
        "A single meeting at a fixed time and place assumes the attendee is free then and can travel there, which is an unexamined assumption rather than a deliberate choice. It quietly excludes anyone with paid or unpaid care responsibilities, or without transport, at that hour.",
    },
    {
      id: "diac-w2",
      prompt:
        "In two or three sentences: what makes a consultation format genuinely inclusive rather than just larger?",
      keywords: ["barrier", "format", "different", "reach"],
      minMatches: 2,
      modelAnswer:
        "A genuinely inclusive consultation removes the specific barriers - time, place, language, format - that stop a particular group from taking part, rather than simply inviting more people to the same format. Reaching a wider group usually means running more than one format, not one bigger meeting.",
    },
    {
      id: "diac-w3",
      prompt:
        "In two or three sentences: why should a consultation plan name who is expected NOT to attend before it is run?",
      keywords: ["identify", "before", "design", "exclude"],
      minMatches: 2,
      modelAnswer:
        "Naming who is likely to be missed before the consultation is designed turns exclusion into something the plan can address - a different time, a home visit, a translated format. Discovering it afterwards only explains a result that could have been prevented.",
    },
  ],

  // Every remaining lecture below carries two written questions, so every
  // quiz on the platform demonstrates the feature - useful for a client demo,
  // where the alternative is hunting for the one lecture that has any. In a
  // real deployment this is still expected to be the exception rather than
  // the rule; see the note at the top of this const.

  "why-vulnerability-is-not-risk": [
    {
      id: "wvnr-w1",
      prompt:
        "In two or three sentences: why is a hazard alone not enough to create risk?",
      keywords: ["hazard", "exposure", "vulnerab", "absorb"],
      minMatches: 2,
      modelAnswer:
        "A hazard on its own creates no risk. Risk only appears once something is exposed to that hazard and unable to absorb its effect - the combination of hazard, exposure and vulnerability together, not any one term alone.",
    },
    {
      id: "wvnr-w2",
      prompt:
        "In two or three sentences: why is vulnerability the part of the risk equation policy can change fastest?",
      keywords: ["policy", "intervention", "given", "fastest"],
      minMatches: 2,
      modelAnswer:
        "Hazard and exposure are largely given - a department cannot move a coastline or cancel a monsoon. Vulnerability is where an assessment earns its budget fastest, because it is the part most open to a policy intervention such as a title deed or an early-warning system.",
    },
  ],

  "building-a-vulnerability-index": [
    {
      id: "bavi-w1",
      prompt:
        "In two or three sentences: why is a composite vulnerability index a compression rather than a discovery?",
      keywords: ["compress", "indicator", "rank", "honestly"],
      minMatches: 2,
      modelAnswer:
        "A composite index compresses information on purpose, in exchange for something that can rank places against each other. Whether that compression was done honestly depends on indicators that do not double-count the same condition, and weights that are stated rather than hidden.",
    },
    {
      id: "bavi-w2",
      prompt:
        "In two or three sentences: why should an index always be published alongside its component indicators?",
      keywords: ["component", "opposite", "driving", "publish"],
      minMatches: 2,
      modelAnswer:
        "Two districts can score identically on an index for opposite reasons - one driven by income, the other by distance from a hospital. Publishing the components alongside the score lets a planner see which condition is actually driving the number.",
    },
  ],

  "assessing-adaptive-capacity": [
    {
      id: "aac-w1",
      prompt:
        "In two or three sentences: why is income alone a weak proxy for adaptive capacity?",
      keywords: ["information", "institution", "access", "savings"],
      minMatches: 2,
      modelAnswer:
        "A household with savings can still fail to adapt if it has no information about the hazard or no access to the institutions that could help it. Adaptive capacity depends on these non-financial factors as much as income.",
    },
    {
      id: "aac-w2",
      prompt:
        "In two or three sentences: why does an assessment need to measure institutional capacity, not just household capacity?",
      keywords: ["institution", "secretariat", "staffing", "boundary"],
      minMatches: 2,
      modelAnswer:
        "A divisional secretariat's own capacity - its staffing, its early-warning links, its access to contingency funds - shapes every household's outcome inside its boundary. An assessment that measures only households and never the institution around them misses half the picture.",
    },
  ],

  "ground-truthing-a-desk-assessment": [
    {
      id: "gtda-w1",
      prompt:
        "In two or three sentences: why is desk-based vulnerability data described as a hypothesis rather than a description of a place?",
      keywords: ["hypothesis", "field visit", "reality", "desk"],
      minMatches: 2,
      modelAnswer:
        "A desk-based vulnerability index is a hypothesis about a place, not a description of it. A short field visit - a walk-through, a few household conversations, a look at what has already flooded - turns that hypothesis into something checked against reality.",
    },
    {
      id: "gtda-w2",
      prompt:
        "In two or three sentences: why can a short, structured field visit be enough, rather than a full re-survey?",
      keywords: ["structured", "half-day", "confident", "divergence"],
      minMatches: 2,
      modelAnswer:
        "A verification visit does not need to be exhaustive to be useful. A structured half-day per ward, checking the indicators the desk data was least confident about, catches most of the divergence a full re-survey would find.",
    },
  ],

  "presenting-findings-to-decision-makers": [
    {
      id: "pftdm-w1",
      prompt:
        "In two or three sentences: why should a briefing lead with the decision, not the method?",
      keywords: ["map", "appendix", "decision", "four minutes"],
      minMatches: 2,
      modelAnswer:
        "Most vulnerability assessments are read by exactly one person, once, for about four minutes. Leading a briefing with the map and the decision it supports, and holding the method to an appendix, is what gets it actually read.",
    },
    {
      id: "pftdm-w2",
      prompt:
        "In two or three sentences: why does stating a confidence level plainly make a briefing more trusted, not less?",
      keywords: ["confidence", "measured", "modelled", "trusted"],
      minMatches: 2,
      modelAnswer:
        "A briefing that states plainly which figures are measured and which are modelled is trusted more than one presenting everything with equal confidence. Decision-makers have usually seen at least one report that overclaimed, and they read for the tell.",
    },
  ],

  "from-assessment-to-action": [
    {
      id: "fata-w1",
      prompt:
        "In two or three sentences: why is an assessment commissioned with no named receiving process considered wasted?",
      keywords: ["receiving process", "named", "planning", "wasted"],
      minMatches: 2,
      modelAnswer:
        "A vulnerability assessment commissioned without a named planning process to feed - a provincial plan, a budget cycle, a zoning review - is written once and read never, which wastes the whole exercise. Naming the receiving process should happen before the fieldwork even starts.",
    },
    {
      id: "fata-w2",
      prompt:
        "In two or three sentences: why does an assessment need a stated review date?",
      keywords: ["review date", "horizon", "living", "snapshot"],
      minMatches: 2,
      modelAnswer:
        "Conditions the index measures move over a three-to-five-year horizon. An assessment with a stated review date stays a living input to planning; one without it becomes a snapshot nobody remembers to retake.",
    },
  ],

  "what-the-nap-asks-of-a-province": [
    {
      id: "wtnaop-w1",
      prompt:
        "In two or three sentences: why is the gap between a national NAP commitment and provincial delivery usually administrative rather than technical?",
      keywords: ["administrative", "told", "owner", "technical"],
      minMatches: 2,
      modelAnswer:
        "Most localisation failures are administrative rather than technical - the action simply was never routed to a province and nobody there was told it exists. Fixing that starts with finding the action and naming an owner.",
    },
    {
      id: "wtnaop-w2",
      prompt:
        "In two or three sentences: why is almost every NAP action actually delivered at provincial or divisional level, even though the plan is written nationally?",
      keywords: ["national scale", "delivered", "provincial", "divisional"],
      minMatches: 2,
      modelAnswer:
        "The NAP sets direction at a national scale, but almost every action inside it is actually delivered by a provincial or divisional office. A province can be responsible for a national action without realising it until someone traces it down.",
    },
  ],

  "reading-the-naps-sector-chapters": [
    {
      id: "rtnsc-w1",
      prompt:
        "In two or three sentences: why does a NAP sector chapter need a provincial reading before it can be acted on?",
      keywords: ["translat", "province", "dry zone", "reads differently"],
      minMatches: 2,
      modelAnswer:
        "A sector chapter written for a national ministry still needs translating to a specific province - an irrigation action reads differently in the dry zone than on the wet southwest coast. The chapter itself rarely makes that translation.",
    },
    {
      id: "rtnsc-w2",
      prompt:
        "In two or three sentences: what is the most common finding of a first localisation read-through of a NAP chapter?",
      keywords: ["ownership", "department", "budget line", "attached"],
      minMatches: 2,
      modelAnswer:
        "The most common finding of a first localisation read-through is not a ready list of actions - it is a list of actions with no province, department or budget line clearly attached yet. Naming that unclear ownership is itself useful work.",
    },
  ],

  "translating-priorities-into-provincial-action": [
    {
      id: "tpipa-w1",
      prompt:
        "In two or three sentences: why does specificity matter when translating a national priority into a provincial action?",
      keywords: ["specific", "fundable", "cost", "budget officer"],
      minMatches: 2,
      modelAnswer:
        "A vague provincial action attracts no budget because nobody can cost it. Made specific - a named site with an estimated cost - the same priority becomes fundable, something a budget officer can act on.",
    },
    {
      id: "tpipa-w2",
      prompt:
        "In two or three sentences: what does 'translating a priority into action' actually mean, using the culvert example?",
      keywords: ["named", "rainfall", "deliverable", "strengthen"],
      minMatches: 2,
      modelAnswer:
        "A priority stated as 'strengthen drainage resilience' means nothing until it becomes a named culvert on a named road, sized against a stated rainfall figure. That translation from priority to deliverable action is the step most exercises skip.",
    },
  ],

  "consulting-divisional-secretariats": [
    {
      id: "cds-w1",
      prompt:
        "In two or three sentences: why does a localisation exercise need to consult divisional secretariats directly?",
      keywords: ["local knowledge", "flood", "tried", "dataset"],
      minMatches: 2,
      modelAnswer:
        "Divisional secretariats hold local knowledge no national dataset carries - which roads actually flood, which measures were tried and abandoned. Skipping this consultation means rediscovering slowly what a two-hour meeting would have surfaced.",
    },
    {
      id: "cds-w2",
      prompt:
        "In two or three sentences: why does one well-prepared consultation session beat several token ones?",
      keywords: ["fatigue", "fourth", "prepared", "follow-through"],
      minMatches: 2,
      modelAnswer:
        "Local officials asked to attend a fourth consultation on the same plan give a fourth-rate answer, a sign of consultation fatigue. One well-prepared session with clear follow-through earns better input than several token visits.",
    },
  ],

  "costing-a-localised-adaptation-action": [
    {
      id: "claa-w1",
      prompt:
        "In two or three sentences: why should a localised action's cost include operation and maintenance, not just construction?",
      keywords: ["maintenance", "bottom-up", "leave out", "operation"],
      minMatches: 2,
      modelAnswer:
        "National plans frequently cost a priority at a national scale or not at all, and provincial submissions often leave out the operation and maintenance line. A bottom-up cost that includes maintenance is far more defensible.",
    },
    {
      id: "claa-w2",
      prompt:
        "In two or three sentences: why does presenting a cost as a range, rather than a single figure, help it survive review?",
      keywords: ["range", "assumption", "bounded", "survives"],
      minMatches: 2,
      modelAnswer:
        "A single costed figure invites challenge the moment ground conditions differ from its assumption. A cost presented as a bounded range survives review because it has already admitted where it could be wrong.",
    },
  ],

  "sequencing-across-the-budget-cycle": [
    {
      id: "satbc-w1",
      prompt:
        "In two or three sentences: why does sequencing start with knowing the budget calendar rather than the actions themselves?",
      keywords: ["calendar", "call for bids", "timing", "waits"],
      minMatches: 2,
      modelAnswer:
        "A provincial budget cycle runs on its own calendar, and an action submitted after the relevant call for bids waits a full year for nothing but timing. Sequencing starts with knowing the calendar, not the actions.",
    },
    {
      id: "satbc-w2",
      prompt:
        "In two or three sentences: why does a smaller, sequenced submission survive a tight budget round better than an ambitious one submitted whole?",
      keywords: ["sequenced", "cut", "unlock", "ambitious"],
      minMatches: 2,
      modelAnswer:
        "A submission asking for every action in one year is the easiest one to cut in full. A sequenced submission - a smaller first-year ask that unlocks a larger second one - survives better than an ambitious one submitted whole.",
    },
  ],

  "monitoring-a-localised-plan": [
    {
      id: "malp-w1",
      prompt:
        "In two or three sentences: why does a localised plan need to report upward to the national NAP cycle, not just outward to the province it serves?",
      keywords: ["upward", "disconnect", "visibility", "national"],
      minMatches: 2,
      modelAnswer:
        "A localised plan that only reports outward to its own province quietly disconnects from the national NAP cycle. Reporting upward too keeps the national plan's visibility of the delivery it depends on.",
    },
    {
      id: "malp-w2",
      prompt:
        "In two or three sentences: why does an indicator need to be assigned to a named post rather than a target alone?",
      keywords: ["named post", "turnover", "target", "responsible"],
      minMatches: 2,
      modelAnswer:
        "A target with nobody named to report against it drifts unmeasured within a year. Monitoring survives staff turnover only when a specific named post, not a person, is made responsible for it.",
    },
  ],

  "matching-a-project-to-a-source-of-finance": [
    {
      id: "mapsf-w1",
      prompt:
        "In two or three sentences: why does every source of climate finance need to be read for the objective it is accountable for?",
      keywords: ["objective", "accountable", "lead with", "fund"],
      minMatches: 2,
      modelAnswer:
        "A climate fund is not a bank and is accountable for its own objective - emissions avoided, adaptation benefit, private capital mobilised. Reading that objective tells you which parts of a project to lead with.",
    },
    {
      id: "mapsf-w2",
      prompt:
        "In two or three sentences: why is matching a project's finance type to its cash flow decided before the proposal is drafted, not during review?",
      keywords: ["grant", "commercial", "cash flow", "wastes"],
      minMatches: 2,
      modelAnswer:
        "A grant-appropriate project pitched to a commercial lender reads as unbankable, and a revenue-generating project pitched only for grant funding wastes its strongest asset. Matching finance type to cash flow is decided before the proposal is drafted.",
    },
  ],

  "building-the-climate-rationale": [
    {
      id: "btcr-w1",
      prompt:
        "In two or three sentences: what does a climate rationale have to do that a bare assertion of benefit does not?",
      keywords: ["chain", "steps", "check", "assert"],
      minMatches: 2,
      modelAnswer:
        "A climate rationale has to connect an intervention to a climate outcome through a chain of steps someone else can check, not simply assert. A claimed benefit with no checkable chain does not survive review.",
    },
    {
      id: "btcr-w2",
      prompt:
        "In two or three sentences: what is the 'increment' a climate rationale actually has to defend, for a project that would have happened anyway?",
      keywords: ["increment", "beyond", "regardless", "specifically"],
      minMatches: 2,
      modelAnswer:
        "A project is not disqualified for being worth doing on its own merits. The rationale has to defend the increment - what the finance specifically buys beyond what would have happened regardless.",
    },
  ],

  "structuring-a-concept-note": [
    {
      id: "scn-w1",
      prompt:
        "In two or three sentences: why does following the expected structure of a concept note help it, rather than restrict it?",
      keywords: ["compare", "expected order", "fairly", "locate"],
      minMatches: 2,
      modelAnswer:
        "A reviewer compares dozens of concept notes against each other, and a note in the expected order is compared fairly. A note that reorders itself for effect makes the reviewer work to locate what they need.",
    },
    {
      id: "scn-w2",
      prompt:
        "In two or three sentences: why should the funding ask be stated early rather than in a final paragraph?",
      keywords: ["ask", "early", "unsure", "first page"],
      minMatches: 2,
      modelAnswer:
        "A concept note that buries its funding ask in a final paragraph reads as unsure of itself. Stating the ask early, on the first page, and justifying it afterward, reads with far more confidence.",
    },
  ],

  "modelling-the-financial-case": [
    {
      id: "mtfc-w1",
      prompt:
        "In two or three sentences: why is a financial model only useful if someone else can follow it?",
      keywords: ["follow", "assumption", "visible", "check"],
      minMatches: 2,
      modelAnswer:
        "A financial model's purpose is to let someone else follow and check the reasoning behind it. Keeping every assumption visible on one sheet, rather than buried in a formula, is what makes a model evidence.",
    },
    {
      id: "mtfc-w2",
      prompt:
        "In two or three sentences: why does showing a project's downside case build trust rather than weaken the proposal?",
      keywords: ["downside", "fails", "viable", "trust"],
      minMatches: 2,
      modelAnswer:
        "Appraisers trust a proposal that names the conditions under which it fails. Stating the point a project stops being viable earns more trust than withholding the downside case, because an appraiser will find it anyway.",
    },
  ],

  "allocating-risk-correctly": [
    {
      id: "arc-w1",
      prompt:
        "In two or three sentences: why should a project risk be allocated to whoever can manage it, rather than to whoever has the deepest balance sheet?",
      keywords: ["manage", "priced heavily", "control", "refused"],
      minMatches: 2,
      modelAnswer:
        "Risk should sit with whoever is best able to manage it. Demand risk placed on a contractor who cannot control demand is priced heavily or refused outright, while the party that can manage it may price it far lower.",
    },
    {
      id: "arc-w2",
      prompt:
        "In two or three sentences: why should some risks, like land acquisition delay, deliberately stay with government?",
      keywords: ["land acquisition", "resolve", "cheaper", "transfer"],
      minMatches: 2,
      modelAnswer:
        "Land acquisition delay and permitting risk are usually cheaper for government to hold than to transfer, because government is the party that can actually resolve them. Transferring them anyway is an expensive way to look prudent.",
    },
  ],

  "writing-the-proposal-that-survives-review": [
    {
      id: "wtptsr-w1",
      prompt:
        "In two or three sentences: why do the first two pages of a proposal matter so much to a reviewer?",
      keywords: ["early", "confirm", "overturn", "opening"],
      minMatches: 2,
      modelAnswer:
        "Reviewers form a view early and read the rest of a proposal to confirm or overturn it. The opening pages - problem, rationale, intervention - carry more weight than their length suggests.",
    },
    {
      id: "wtptsr-w2",
      prompt:
        "In two or three sentences: what is the sustainability question actually asking a proposal to answer?",
      keywords: ["after funding", "institution", "revenue stream", "continues"],
      minMatches: 2,
      modelAnswer:
        "The sustainability question asks what happens after the funded period ends. A vague answer is one of the most common reasons a note is not advanced; naming a specific institution or revenue stream that continues the work is what it wants.",
    },
  ],

  "reporting-once-finance-is-approved": [
    {
      id: "rofia-w1",
      prompt:
        "In two or three sentences: why should compliance and verification be budgeted as a line item rather than treated as an afterthought?",
      keywords: ["verification", "budget", "obligations", "line item"],
      minMatches: 2,
      modelAnswer:
        "Monitoring, verification and annual reporting consume a real share of a facility's budget, and a proposal that omits this cost funds the project but not its obligations. Costing compliance as a line item is expected, not optional.",
    },
    {
      id: "rofia-w2",
      prompt:
        "In two or three sentences: why does data collection need to start on the day an agreement is signed?",
      keywords: ["baseline", "day one", "reconstructed", "estimate"],
      minMatches: 2,
      modelAnswer:
        "Impact reporting asks for baselines that cannot be reconstructed later. Setting up data collection on day one, rather than when the first report is due, avoids handing over an estimate instead of real data.",
    },
  ],

  "gsi-as-a-planning-discipline": [
    {
      id: "gapd-w1",
      prompt:
        "In two or three sentences: why does a GSI annex added after a plan is written change so little?",
      keywords: ["annex", "after", "consultation", "decisions"],
      minMatches: 2,
      modelAnswer:
        "A GSI annex added after a plan is written rarely changes what the plan actually does, because the decisions that mattered were made already. Applying the same lens from the first consultation changes what the plan does, not just what it says.",
    },
    {
      id: "gapd-w2",
      prompt:
        "In two or three sentences: why is GSI wider than a focus on gender alone?",
      keywords: ["disability", "ethnicity", "axis", "exclusion"],
      minMatches: 2,
      modelAnswer:
        "Gender is the most visible axis of exclusion, but disability, age, ethnicity, language and poverty routinely decide who benefits from a plan just as much. An approach that only asks about women misses most of who GSI is meant to include.",
    },
  ],

  "reading-a-situation-through-a-gsi-lens": [
    {
      id: "rastgl-w1",
      prompt:
        "In two or three sentences: why are 'who is affected' and 'who had a say' two different questions a GSI reading has to ask separately?",
      keywords: ["affected", "voice", "diverge", "separately"],
      minMatches: 2,
      modelAnswer:
        "Who is affected by a decision and who had a voice in it are two separate questions, and a plan can score well on one while failing the other. Reading a plan through a GSI lens means asking both and naming where they diverge.",
    },
    {
      id: "rastgl-w2",
      prompt:
        "In two or three sentences: why is an unstated assumption often the real cause of exclusion in planning?",
      keywords: ["assumption", "weekday", "typical", "unexamined"],
      minMatches: 2,
      modelAnswer:
        "A consultation scheduled for a weekday afternoon assumes the attendee has no paid or unpaid care work at that hour. Most exclusion is not a deliberate decision, it is an unexamined assumption about who the typical participant is.",
    },
  ],

  "setting-gsi-indicators-that-mean-something": [
    {
      id: "sgitms-w1",
      prompt:
        "In two or three sentences: why is 'number of women attending' a weak GSI indicator even though it is easy to measure?",
      keywords: ["attend", "showed up", "access", "decision-making"],
      minMatches: 2,
      modelAnswer:
        "'Number of women who attend' is easy to count and measures almost nothing about whether anything changed for them. A meaningful indicator tracks access, decision-making role or resource control, not who simply showed up.",
    },
    {
      id: "sgitms-w2",
      prompt:
        "In two or three sentences: why is setting a baseline before an intervention starts the most important and most skipped step?",
      keywords: ["baseline", "before", "defensible", "skipped"],
      minMatches: 2,
      modelAnswer:
        "An indicator without a baseline can only ever report a number, never a change. Setting the baseline before the intervention starts is the most commonly skipped step, and the one that makes every later report defensible.",
    },
  ],

  "mainstreaming-gsi-into-a-sector-plan": [
    {
      id: "mgisp-w1",
      prompt:
        "In two or three sentences: why does mainstreaming succeed or fail at specific decision points rather than in a plan's introduction?",
      keywords: ["decision points", "subsidy", "procurement", "panel"],
      minMatches: 2,
      modelAnswer:
        "Mainstreaming succeeds or fails at specific decision points - who qualifies for a subsidy, what a procurement scores on, who sits on a panel - not in a plan's introductory language. Finding those points is what makes GSI operational.",
    },
    {
      id: "mgisp-w2",
      prompt:
        "In two or three sentences: what turns a GSI requirement from a wish into something that actually changes a plan?",
      keywords: ["checkable", "commits", "consequence", "wish"],
      minMatches: 2,
      modelAnswer:
        "'Gender considerations will be taken into account' commits nobody to anything - it is a wish, not a requirement. A checkable statement attached to a specific decision is what actually changes what a plan does.",
    },
  ],

  "handling-exclusion-when-you-find-it": [
    {
      id: "hewyfi-w1",
      prompt:
        "In two or three sentences: why does a finding without a response train people not to speak up again?",
      keywords: ["visible response", "trains", "raises", "waste"],
      minMatches: 2,
      modelAnswer:
        "A community that raises an exclusion finding and sees no visible response learns that raising it again is a waste of their time. The response does not need to be complete, but it has to be visible.",
    },
    {
      id: "hewyfi-w2",
      prompt:
        "In two or three sentences: why is closing the loop with even a partial answer important?",
      keywords: ["close the loop", "partial", "silence", "next round"],
      minMatches: 2,
      modelAnswer:
        "Reporting back, even to explain that an issue could not be funded this cycle, closes the loop and keeps the consultation channel usable. Silence after a finding, not the budget itself, is what ends participation.",
    },
  ],

  "reporting-on-gsi-without-tokenism": [
    {
      id: "rogwt-w1",
      prompt:
        "In two or three sentences: why is a page of photographs captioned 'women participants' considered a weak form of GSI reporting?",
      keywords: ["photograph", "optics", "outcome", "informative"],
      minMatches: 2,
      modelAnswer:
        "A page of photographs captioned 'women participants' is the most common and least informative form GSI reporting takes, because it shows optics rather than outcome. Reporting built around outcome indicators actually says whether anything worked.",
    },
    {
      id: "rogwt-w2",
      prompt:
        "In two or three sentences: why should a GSI report sit inside a sector's main results rather than beside them?",
      keywords: ["inside", "compliance exercise", "sector result", "judging"],
      minMatches: 2,
      modelAnswer:
        "A GSI report filed separately from a sector's main results reads as a compliance exercise. Presented inside the same report, it becomes part of judging whether the scheme worked at all, which is the point of collecting it.",
    },
  ],

  "what-grb-actually-changes": [
    {
      id: "wgac-w1",
      prompt:
        "In two or three sentences: what is the most common misunderstanding about gender-responsive budgeting?",
      keywords: ["separate fund", "misconception", "earmarked", "whole budget"],
      minMatches: 2,
      modelAnswer:
        "The most persistent misconception about GRB is that it means setting aside a fund earmarked for women. It is instead a method for examining and adjusting the whole budget - every vote, not a new one - for who it reaches.",
    },
    {
      id: "wgac-w2",
      prompt:
        "In two or three sentences: how can a gender-neutral-looking budget line, like road maintenance, still have an unequal effect?",
      keywords: ["footpath", "carriageway", "unpaid care", "reads differently"],
      minMatches: 2,
      modelAnswer:
        "A road maintenance line looks gender-neutral until read against who walks, who drives, and whose unpaid care journeys depend on the footpath rather than the carriageway - the same rupee reads differently depending who is asking.",
    },
  ],

  "reading-a-budget-for-who-it-reaches": [
    {
      id: "rabfwir-w1",
      prompt:
        "In two or three sentences: why can a budget line written in gender-neutral language still reach men and women very unevenly?",
      keywords: ["neutral in wording", "hours", "channels", "proportions"],
      minMatches: 2,
      modelAnswer:
        "A line like 'agricultural extension services' is neutral in wording, but if officers visit during hours or channels only one group can access, it reaches men and women in very different proportions.",
    },
    {
      id: "rabfwir-w2",
      prompt:
        "In two or three sentences: why is checking who used a line last year better than assuming neutrality from its wording?",
      keywords: ["check", "disaggregated", "assuming", "common error"],
      minMatches: 2,
      modelAnswer:
        "The only way to know whether a line is genuinely neutral in effect is to check who used it last year, disaggregated by sex. Assuming neutrality from the wording alone is the single most common error in a first read-through.",
    },
  ],

  "gender-budget-statements": [
    {
      id: "gbs-w1",
      prompt:
        "In two or three sentences: why is a gender budget statement that only lists spending by ministry likely to be rejected?",
      keywords: ["restates", "analysis", "rejected", "list"],
      minMatches: 2,
      modelAnswer:
        "A gender budget statement that only lists spending by ministry without analysing who it reaches is rejected as often as it is approved. Reviewers check for analysis, not a restated budget.",
    },
    {
      id: "gbs-w2",
      prompt:
        "In two or three sentences: why does every claim in a gender budget statement need a number behind it?",
      keywords: ["number", "evidence", "target", "checked"],
      minMatches: 2,
      modelAnswer:
        "'This programme benefits women and men equally' is a claim, not evidence. A statement giving a specific number against a stated target gives a reviewer something checked, and something that survives scrutiny.",
    },
  ],

  "sex-disaggregated-data": [
    {
      id: "sdd-w1",
      prompt:
        "In two or three sentences: why is commissioning new data collection rarely the right first step for sex-disaggregated data?",
      keywords: ["already collected", "registers", "attendance", "existing"],
      minMatches: 2,
      modelAnswer:
        "Beneficiary registers and attendance sheets are frequently already collected by sex, even where nobody has analysed them that way. The first step is rarely new data collection - it is checking what already exists in an existing register.",
    },
    {
      id: "sdd-w2",
      prompt:
        "In two or three sentences: why is a partial dataset, used honestly, more credible than waiting for a complete one?",
      keywords: ["coverage", "limitation", "stated", "credible"],
      minMatches: 2,
      modelAnswer:
        "Where disaggregated data covers only part of a programme, using it with the coverage and its limitation clearly stated is more credible than waiting for a complete dataset that may never arrive.",
    },
  ],

  "costing-a-gender-responsive-intervention": [
    {
      id: "cgri-w1",
      prompt:
        "In two or three sentences: why are gender-responsive adjustments usually marginal design changes rather than new spending?",
      keywords: ["marginal", "design change", "schedule", "budget line"],
      minMatches: 2,
      modelAnswer:
        "Shifting a visit schedule or adding a second consultation time are typically marginal design changes rather than new budget lines. Costing them against a real programme usually shows the increment is far smaller than expected.",
    },
    {
      id: "cgri-w2",
      prompt:
        "In two or three sentences: why should a costed adjustment be presented beside the participation gap it targets?",
      keywords: ["participation gap", "return", "approve", "spend"],
      minMatches: 2,
      modelAnswer:
        "A costed adjustment presented beside the participation gap it is meant to close, rather than as an abstract inclusion cost, is easier for a budget officer to approve, because the return on the spend is stated alongside the spend itself.",
    },
  ],

  "auditing-a-budget-circular-for-gsi-compliance": [
    {
      id: "abcfgc-w1",
      prompt:
        "In two or three sentences: why is missing a stated GSI requirement in a budget circular an avoidable rejection?",
      keywords: ["stated requirement", "avoidable", "checklist", "directly"],
      minMatches: 2,
      modelAnswer:
        "Budget circulars increasingly state their gender-responsive requirements directly - a disaggregation requirement, a mandatory statement, a specific annex. Missing a stated requirement is an avoidable rejection, not a judgment call.",
    },
    {
      id: "abcfgc-w2",
      prompt:
        "In two or three sentences: what are the three most common reasons a GRB submission is returned?",
      keywords: ["no baseline", "no evidence", "restates", "three reasons"],
      minMatches: 2,
      modelAnswer:
        "Most GRB submissions are returned for one of three reasons: no baseline data, a claim with no evidence, or a statement that restates the budget without analysis. Checking a draft against these three clears most review cycles.",
    },
  ],

  "reporting-gender-responsive-spending-upward": [
    {
      id: "rgrsu-w1",
      prompt:
        "In two or three sentences: why can spending that is not tagged and reported as gender-responsive not be counted at the national level?",
      keywords: ["tagged", "counted", "national level", "weak position"],
      minMatches: 2,
      modelAnswer:
        "Spending that is not tagged and reported as gender-responsive cannot be counted at the national level. An institution that cannot demonstrate its own record is in a weak position at the next budget negotiation.",
    },
    {
      id: "rgrsu-w2",
      prompt:
        "In two or three sentences: why is last year's completed report the strongest argument for next year's allocation?",
      keywords: ["evidence", "proof", "previous investment", "trusted"],
      minMatches: 2,
      modelAnswer:
        "A completed, well-evidenced report is proof the previous investment worked, not just a promise the next one will. Institutions that report consistently tend to be trusted with larger allocations over time.",
    },
  ],
};
