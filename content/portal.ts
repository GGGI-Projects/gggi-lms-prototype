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
  /** Matches the record `lib/admin.ts` derives for her - one id, so the
   *  portal has an identity to message staff from without reaching into
   *  console-only data for it. */
  id: "stu-1904",
  name: "Nadeesha Perera",
  /** Shown on the certificate. Kept separate: a certificate carries the legal
   *  name, and the portal greets you by the name you go by. */
  certificateName: "K. A. Nadeesha Perera",
  email: "nadeesha.perera@example.lk",
  /** Two letters - the avatar's fallback if `avatarUrl` is ever missing. */
  initials: "NP",
  /** A public headshot photo, sourced from Unsplash for this prototype - see
   *  the note in `components/student-portal/ui.tsx`'s `Avatar`. */
  avatarUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
   * Percentage of a lecture's fill-in-the-blank questions answered well
   * enough to pass, keyed by lecture id. Only lectures a lecturer actually
   * wrote fill-in-the-blank questions for appear here - see
   * `FILL_IN_THE_BLANK_QUESTIONS` below. A lecture with no entry and no
   * fill-in-the-blank questions is not outstanding; a lecture with no entry
   * that DOES have them is - same shape as `quizScores`, same reason.
   */
  blankScores: Record<string, number>;
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
    // every lecture's fill-in-the-blank questions are shown passed too - a
    // module with a certificate cannot show a locked "next lecture" behind it.
    blankScores: {
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
    // "reading-sri-lankas-climate-hazard-data" has fill-in-the-blank
    // questions (see `FILL_IN_THE_BLANK_QUESTIONS`) and its quiz was passed,
    // but no entry exists here - that lecture's gate is deliberately left
    // uncleared, to show that a passed quiz alone is no longer enough where
    // fill-in-the-blank questions exist.
    blankScores: {},
    currentLectureId: "assessing-adaptive-capacity",
  },
  {
    moduleId: "bankable-climate-finance-proposals",
    enrolledOn: "2026-07-14",
    completedLectureIds: ["what-makes-a-project-bankable"],
    quizScores: {
      "what-makes-a-project-bankable": 100,
    },
    // This lecture's fill-in-the-blank questions were also passed, so its
    // gate is fully cleared and "Next lecture" is unlocked - the positive
    // case alongside "climate-vulnerability-assessment" above, which shows
    // the blocked one.
    blankScores: {
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
   * Staff-facing only. Read by `<QuizManager>` in the lecturer and admin
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

/* ----------------------------------------------------- fill-in-the-blanks */

export type Blank = {
  id: string;
  /** The word or phrase removed from the passage at this blank - the exact
   *  text a learner has to pick from the option bank to fill it. Matching is
   *  case-insensitive (see `checkBlankAnswers()` in `lib/portal.ts`), so this
   *  is written however it reads best in the passage, not in any canonical
   *  case. */
  answer: string;
};

export type FillInTheBlankQuestion = {
  id: string;
  /**
   * The passage with each blank marked inline as `{{blankId}}`, split apart
   * by `passageSegments()` in `lib/portal.ts` for both the authoring screen
   * and the learner's runner - one parser, so the two never disagree about
   * where a blank sits.
   */
  passage: string;
  /** In passage order. */
  blanks: Blank[];
  /**
   * Extra wrong options shown in the word bank alongside every blank's own
   * answer - see `optionBankFor()` in `lib/portal.ts`. Without at least a
   * couple of these the correct pick is just "whichever option is left",
   * which is not really an exercise.
   */
  distractors: string[];
};

/**
 * A lecture's fill-in-the-blank questions, per LECTURE rather than per
 * module.
 *
 * Unlike `QUESTION_POOL`, there is no rotation trick here: a lecturer writes
 * a passage and marks its blanks one lecture at a time, and a lecture id with
 * no entry below simply has none - `hasBlankQuestions()` in `lib/portal.ts`
 * is the one place that fact is read from. Fill-in-the-blank questions are a
 * genuinely OPTIONAL feature (see FR-INS-121 in the SRS) and most real
 * lectures are expected to have none, the same way most quizzes will not
 * need a rewrite.
 *
 * EVERY LECTURE CARRIES ONE HERE, which is a demo decision, not the intended
 * steady state: it means a client clicking into any lecture's quiz sees the
 * feature working, rather than having to be pointed at the one lecture that
 * has it. `hazard-exposure-sensitivity`, `reading-sri-lankas-climate-hazard-
 * data`, `what-makes-a-project-bankable` and `designing-an-inclusive-
 * consultation` still carry the three outcomes the feature needs to
 * demonstrate (a failed quiz, a passed quiz blocked by an unattempted
 * fill-in-the-blank question, and a fully cleared gate) - see `blankScores`
 * on `ENROLMENTS` above.
 *
 * Every passage below is generated from the same subject-matter prose the
 * old written-question model answers used, with three on-topic terms blanked
 * out of each one and a couple of plausible wrong options added to the bank -
 * a genuine lecturer would write these by hand and can vary blank count and
 * distractor count freely; the shape here is simply what the generator was
 * consistent about.
 */
export const FILL_IN_THE_BLANK_QUESTIONS: Record<string, FillInTheBlankQuestion[]> = {
  "hazard-exposure-sensitivity": [
    {
      id: "hes-fb1",
      passage:
        "Exposure only says both {{hes-b1}} sit in the flood's path, it says nothing about their capacity to cope with it. {{hes-b2}}, and the {{hes-b3}} each household can call on, decide how much the same flood actually costs them.",
      blanks: [
        { id: "hes-b1", answer: "households" },
        { id: "hes-b2", answer: "Sensitivity" },
        { id: "hes-b3", answer: "resources" },
      ],
      distractors: ["upward", "avoided"],
    },
  ],

  "reading-sri-lankas-climate-hazard-data": [
    {
      id: "rshd-fb1",
      passage:
        "A national map is built to compare {{rshd-b1}} at a coarse {{rshd-b2}}, not to site a specific culvert. Using it at {{rshd-b3}} or finer scale borrows a precision the data never had.",
      blanks: [
        { id: "rshd-b1", answer: "provinces" },
        { id: "rshd-b2", answer: "resolution" },
        { id: "rshd-b3", answer: "divisional" },
      ],
      distractors: ["places", "savings"],
    },
  ],

  "what-makes-a-project-bankable": [
    {
      id: "wmpb-fb1",
      passage:
        "A {{wmpb-b1}} project is one that is worth doing on its merits. A bankable one goes further, it produces a {{wmpb-b2}} return, saving, or cash flow that a funder can point to and {{wmpb-b3}}, not just a good outcome.",
      blanks: [
        { id: "wmpb-b1", answer: "worthwhile" },
        { id: "wmpb-b2", answer: "measurable" },
        { id: "wmpb-b3", answer: "underwrite" },
      ],
      distractors: ["examining", "wording"],
    },
  ],

  "designing-an-inclusive-consultation": [
    {
      id: "diac-fb1",
      passage:
        "A single meeting at a fixed time and place assumes the attendee is free then and can travel there, which is an {{diac-b1}} {{diac-b2}} rather than a deliberate choice. It quietly excludes anyone with care {{diac-b3}}, or without transport, at that hour.",
      blanks: [
        { id: "diac-b1", answer: "unexamined" },
        { id: "diac-b2", answer: "assumption" },
        { id: "diac-b3", answer: "responsibilities" },
      ],
      distractors: ["changes", "requirements"],
    },
  ],

  "why-vulnerability-is-not-risk": [
    {
      id: "wvnr-fb1",
      passage:
        "A hazard on its own creates no risk. Risk only appears once something is exposed to that hazard and unable to absorb its effect, the {{wvnr-b1}} of hazard, {{wvnr-b2}} and {{wvnr-b3}} together, not any one term alone.",
      blanks: [
        { id: "wvnr-b1", answer: "combination" },
        { id: "wvnr-b2", answer: "exposure" },
        { id: "wvnr-b3", answer: "vulnerability" },
      ],
      distractors: ["captioned", "misconception"],
    },
  ],

  "building-a-vulnerability-index": [
    {
      id: "bavi-fb1",
      passage:
        "A composite index compresses {{bavi-b1}} on purpose, in exchange for something that can rank places against each other. Whether that {{bavi-b2}} was done honestly depends on indicators that do not {{bavi-b3}} the same condition.",
      blanks: [
        { id: "bavi-b1", answer: "information" },
        { id: "bavi-b2", answer: "compression" },
        { id: "bavi-b3", answer: "double-count" },
      ],
      distractors: ["unexamined", "transport"],
    },
  ],

  "assessing-adaptive-capacity": [
    {
      id: "aac-fb1",
      passage:
        "A household with savings can still fail to adapt if it has no {{aac-b1}} about the hazard or no access to the {{aac-b2}} that could help it. Adaptive capacity depends on these {{aac-b3}} factors as much as income.",
      blanks: [
        { id: "aac-b1", answer: "information" },
        { id: "aac-b2", answer: "institutions" },
        { id: "aac-b3", answer: "non-financial" },
      ],
      distractors: ["disaggregation", "tagged"],
    },
  ],

  "ground-truthing-a-desk-assessment": [
    {
      id: "gtda-fb1",
      passage:
        "A desk-based {{gtda-b1}} index is a hypothesis about a place, not a description of it. A short field visit, a {{gtda-b2}}, a few household {{gtda-b3}}, a look at what has already flooded, turns that hypothesis into something checked against reality.",
      blanks: [
        { id: "gtda-b1", answer: "vulnerability" },
        { id: "gtda-b2", answer: "walk-through" },
        { id: "gtda-b3", answer: "conversations" },
      ],
      distractors: ["capital", "claimed"],
    },
  ],

  "presenting-findings-to-decision-makers": [
    {
      id: "pftdm-fb1",
      passage:
        "Most {{pftdm-b1}} {{pftdm-b2}} are read by exactly one person, once, for about four minutes. Leading a {{pftdm-b3}} with the map and the decision it supports, and holding the method to an appendix, is what gets it actually read.",
      blanks: [
        { id: "pftdm-b1", answer: "vulnerability" },
        { id: "pftdm-b2", answer: "assessments" },
        { id: "pftdm-b3", answer: "briefing" },
      ],
      distractors: ["photographs", "persistent"],
    },
  ],

  "from-assessment-to-action": [
    {
      id: "fata-fb1",
      passage:
        "A {{fata-b1}} {{fata-b2}} {{fata-b3}} without a named planning process to feed, a provincial plan, a budget cycle, a zoning review, is written once and read never, which wastes the whole exercise.",
      blanks: [
        { id: "fata-b1", answer: "vulnerability" },
        { id: "fata-b2", answer: "assessment" },
        { id: "fata-b3", answer: "commissioned" },
      ],
      distractors: ["defensible", "localised"],
    },
  ],

  "what-the-nap-asks-of-a-province": [
    {
      id: "wtnaop-fb1",
      passage:
        "Most {{wtnaop-b1}} failures are {{wtnaop-b2}} rather than {{wtnaop-b3}}, the action simply was never routed to a province and nobody there was told it exists. Fixing that starts with finding the action and naming an owner.",
      blanks: [
        { id: "wtnaop-b1", answer: "localisation" },
        { id: "wtnaop-b2", answer: "administrative" },
        { id: "wtnaop-b3", answer: "technical" },
      ],
      distractors: ["missing", "counted"],
    },
  ],

  "reading-the-naps-sector-chapters": [
    {
      id: "rtnsc-fb1",
      passage:
        "A sector chapter written for a national ministry still needs {{rtnsc-b1}} to a specific province, an irrigation action reads {{rtnsc-b2}} in the dry zone than on the wet southwest coast. The chapter itself rarely makes that {{rtnsc-b3}}.",
      blanks: [
        { id: "rtnsc-b1", answer: "translating" },
        { id: "rtnsc-b2", answer: "differently" },
        { id: "rtnsc-b3", answer: "translation" },
      ],
      distractors: ["costing", "questions"],
    },
  ],

  "translating-priorities-into-provincial-action": [
    {
      id: "tpipa-fb1",
      passage:
        "A vague {{tpipa-b1}} action {{tpipa-b2}} no budget because nobody can cost it. Made specific, a named site with an {{tpipa-b3}} cost, the same priority becomes fundable, something a budget officer can act on.",
      blanks: [
        { id: "tpipa-b1", answer: "provincial" },
        { id: "tpipa-b2", answer: "attracts" },
        { id: "tpipa-b3", answer: "estimated" },
      ],
      distractors: ["spending", "registers"],
    },
  ],

  "consulting-divisional-secretariats": [
    {
      id: "cds-fb1",
      passage:
        "Divisional {{cds-b1}} hold local knowledge no national dataset carries, which roads actually flood, which measures were tried and abandoned. Skipping this {{cds-b2}} means {{cds-b3}} slowly what a meeting would have surfaced.",
      blanks: [
        { id: "cds-b1", answer: "secretariats" },
        { id: "cds-b2", answer: "consultation" },
        { id: "cds-b3", answer: "rediscovering" },
      ],
      distractors: ["technical", "finding"],
    },
  ],

  "costing-a-localised-adaptation-action": [
    {
      id: "claa-fb1",
      passage:
        "National plans frequently cost a priority at a national scale or not at all, and {{claa-b1}} {{claa-b2}} often leave out the operation and maintenance line. A bottom-up cost that includes maintenance is far more {{claa-b3}}.",
      blanks: [
        { id: "claa-b1", answer: "provincial" },
        { id: "claa-b2", answer: "submissions" },
        { id: "claa-b3", answer: "defensible" },
      ],
      distractors: ["locate", "visible"],
    },
  ],

  "sequencing-across-the-budget-cycle": [
    {
      id: "satbc-fb1",
      passage:
        "A {{satbc-b1}} budget cycle runs on its own calendar, and an action {{satbc-b2}} after the relevant call for bids waits a full year for nothing but timing. {{satbc-b3}} starts with knowing the calendar, not the actions.",
      blanks: [
        { id: "satbc-b1", answer: "provincial" },
        { id: "satbc-b2", answer: "submitted" },
        { id: "satbc-b3", answer: "Sequencing" },
      ],
      distractors: ["community", "captioned"],
    },
  ],

  "monitoring-a-localised-plan": [
    {
      id: "malp-fb1",
      passage:
        "A {{malp-b1}} plan that only reports outward to its own province quietly {{malp-b2}} from the national NAP cycle. Reporting upward too keeps the national plan's {{malp-b3}} of the delivery it depends on.",
      blanks: [
        { id: "malp-b1", answer: "localised" },
        { id: "malp-b2", answer: "disconnects" },
        { id: "malp-b3", answer: "visibility" },
      ],
      distractors: ["operation", "sequencing"],
    },
  ],

  "matching-a-project-to-a-source-of-finance": [
    {
      id: "mapsf-fb1",
      passage:
        "A climate fund is not a bank and is {{mapsf-b1}} for its own objective, {{mapsf-b2}} avoided, {{mapsf-b3}} benefit, private capital mobilised. Reading that objective tells you which parts of a project to lead with.",
      blanks: [
        { id: "mapsf-b1", answer: "accountable" },
        { id: "mapsf-b2", answer: "emissions" },
        { id: "mapsf-b3", answer: "adaptation" },
      ],
      distractors: ["measurable", "meeting"],
    },
  ],

  "building-the-climate-rationale": [
    {
      id: "btcr-fb1",
      passage:
        "A climate {{btcr-b1}} has to connect an {{btcr-b2}} to a climate outcome through a chain of steps someone else can check, not simply assert. A claimed benefit with no {{btcr-b3}} chain does not survive review.",
      blanks: [
        { id: "btcr-b1", answer: "rationale" },
        { id: "btcr-b2", answer: "intervention" },
        { id: "btcr-b3", answer: "checkable" },
      ],
      distractors: ["connect", "dozens"],
    },
  ],

  "structuring-a-concept-note": [
    {
      id: "scn-fb1",
      passage:
        "A reviewer {{scn-b1}} dozens of concept notes against each other, and a note in the {{scn-b2}} order is {{scn-b3}} fairly. A note that reorders itself for effect makes the reviewer work to locate what they need.",
      blanks: [
        { id: "scn-b1", answer: "compares" },
        { id: "scn-b2", answer: "expected" },
        { id: "scn-b3", answer: "compared" },
      ],
      distractors: ["measures", "submissions"],
    },
  ],

  "modelling-the-financial-case": [
    {
      id: "mtfc-fb1",
      passage:
        "A {{mtfc-b1}} model's purpose is to let someone else follow and check the {{mtfc-b2}} behind it. Keeping every {{mtfc-b3}} visible on one sheet, rather than buried in a formula, is what makes a model evidence.",
      blanks: [
        { id: "mtfc-b1", answer: "financial" },
        { id: "mtfc-b2", answer: "reasoning" },
        { id: "mtfc-b3", answer: "assumption" },
      ],
      distractors: ["borrows", "produces"],
    },
  ],

  "allocating-risk-correctly": [
    {
      id: "arc-fb1",
      passage:
        "Risk should sit with {{arc-b1}} is best able to manage it. Demand risk placed on a {{arc-b2}} who cannot control demand is priced heavily or refused {{arc-b3}}, while the party that can manage it may price it far lower.",
      blanks: [
        { id: "arc-b1", answer: "whoever" },
        { id: "arc-b2", answer: "contractor" },
        { id: "arc-b3", answer: "outright" },
      ],
      distractors: ["placed", "reviewers"],
    },
  ],

  "writing-the-proposal-that-survives-review": [
    {
      id: "wtptsr-fb1",
      passage:
        "{{wtptsr-b1}} form a view early and read the rest of a proposal to confirm or overturn it. The opening pages, problem, {{wtptsr-b2}}, {{wtptsr-b3}}, carry more weight than their length suggests.",
      blanks: [
        { id: "wtptsr-b1", answer: "Reviewers" },
        { id: "wtptsr-b2", answer: "rationale" },
        { id: "wtptsr-b3", answer: "intervention" },
      ],
      distractors: ["rarely", "officer"],
    },
  ],

  "reporting-once-finance-is-approved": [
    {
      id: "rofia-fb1",
      passage:
        "{{rofia-b1}}, {{rofia-b2}} and annual reporting consume a real share of a facility's budget, and a proposal that omits this cost funds the project but not its {{rofia-b3}}. Costing compliance as a line item is expected.",
      blanks: [
        { id: "rofia-b1", answer: "Monitoring" },
        { id: "rofia-b2", answer: "verification" },
        { id: "rofia-b3", answer: "obligations" },
      ],
      distractors: ["suggests", "costing"],
    },
  ],

  "gsi-as-a-planning-discipline": [
    {
      id: "gapd-fb1",
      passage:
        "A GSI annex added after a plan is written rarely changes what the plan actually does, because the {{gapd-b1}} that {{gapd-b2}} were made already. Applying the same lens from the first {{gapd-b3}} changes what the plan does.",
      blanks: [
        { id: "gapd-b1", answer: "decisions" },
        { id: "gapd-b2", answer: "mattered" },
        { id: "gapd-b3", answer: "consultation" },
      ],
      distractors: ["timing", "disconnects"],
    },
  ],

  "reading-a-situation-through-a-gsi-lens": [
    {
      id: "rastgl-fb1",
      passage:
        "Who is {{rastgl-b1}} by a {{rastgl-b2}} and who had a voice in it are two separate {{rastgl-b3}}, and a plan can score well on one while failing the other. Reading a plan through a GSI lens means asking both.",
      blanks: [
        { id: "rastgl-b1", answer: "affected" },
        { id: "rastgl-b2", answer: "decision" },
        { id: "rastgl-b3", answer: "questions" },
      ],
      distractors: ["outright", "weight"],
    },
  ],

  "setting-gsi-indicators-that-mean-something": [
    {
      id: "sgitms-fb1",
      passage:
        "Number of women who attend is easy to count and measures almost nothing about whether anything changed for them. A {{sgitms-b1}} {{sgitms-b2}} tracks access, {{sgitms-b3}} role or resource control, not who simply showed up.",
      blanks: [
        { id: "sgitms-b1", answer: "meaningful" },
        { id: "sgitms-b2", answer: "indicator" },
        { id: "sgitms-b3", answer: "decision-making" },
      ],
      distractors: ["savings", "income"],
    },
  ],

  "mainstreaming-gsi-into-a-sector-plan": [
    {
      id: "mgisp-fb1",
      passage:
        "{{mgisp-b1}} succeeds or fails at specific decision points, who qualifies for a subsidy, what a {{mgisp-b2}} scores on, who sits on a panel, not in a plan's {{mgisp-b3}} language. Finding those points is what makes GSI operational.",
      blanks: [
        { id: "mgisp-b1", answer: "Mainstreaming" },
        { id: "mgisp-b2", answer: "procurement" },
        { id: "mgisp-b3", answer: "introductory" },
      ],
      distractors: ["sector", "rarely"],
    },
  ],

  "handling-exclusion-when-you-find-it": [
    {
      id: "hewyfi-fb1",
      passage:
        "A {{hewyfi-b1}} that raises an {{hewyfi-b2}} finding and sees no visible response learns that raising it again is a waste of their time. The response does not need to be {{hewyfi-b3}}, but it has to be visible.",
      blanks: [
        { id: "hewyfi-b1", answer: "community" },
        { id: "hewyfi-b2", answer: "exclusion" },
        { id: "hewyfi-b3", answer: "complete" },
      ],
      distractors: ["participants", "setting"],
    },
  ],

  "reporting-on-gsi-without-tokenism": [
    {
      id: "rogwt-fb1",
      passage:
        "A page of {{rogwt-b1}} captioned women {{rogwt-b2}} is the most common and least {{rogwt-b3}} form GSI reporting takes, because it shows optics rather than outcome. Reporting built around outcome indicators actually says whether anything worked.",
      blanks: [
        { id: "rogwt-b1", answer: "photographs" },
        { id: "rogwt-b2", answer: "participants" },
        { id: "rogwt-b3", answer: "informative" },
      ],
      distractors: ["underwrite", "unexamined"],
    },
  ],

  "what-grb-actually-changes": [
    {
      id: "wgac-fb1",
      passage:
        "The most {{wgac-b1}} {{wgac-b2}} about GRB is that it means setting aside a fund {{wgac-b3}} for women. It is instead a method for examining and adjusting the whole budget, every vote, not a new one, for who it reaches.",
      blanks: [
        { id: "wgac-b1", answer: "persistent" },
        { id: "wgac-b2", answer: "misconception" },
        { id: "wgac-b3", answer: "earmarked" },
      ],
      distractors: ["process", "exercise"],
    },
  ],

  "reading-a-budget-for-who-it-reaches": [
    {
      id: "rabfwir-fb1",
      passage:
        "A line like {{rabfwir-b1}} {{rabfwir-b2}} services is neutral in wording, but if officers visit during hours or channels only one group can access, it reaches men and women in very different {{rabfwir-b3}}.",
      blanks: [
        { id: "rabfwir-b1", answer: "agricultural" },
        { id: "rabfwir-b2", answer: "extension" },
        { id: "rabfwir-b3", answer: "proportions" },
      ],
      distractors: ["fairly", "behind"],
    },
  ],

  "gender-budget-statements": [
    {
      id: "gbs-fb1",
      passage:
        "A gender budget {{gbs-b1}} that only lists spending by ministry without {{gbs-b2}} who it reaches is rejected as often as it is approved. {{gbs-b3}} check for analysis, not a restated budget.",
      blanks: [
        { id: "gbs-b1", answer: "statement" },
        { id: "gbs-b2", answer: "analysing" },
        { id: "gbs-b3", answer: "Reviewers" },
      ],
      distractors: ["places", "savings"],
    },
  ],

  "sex-disaggregated-data": [
    {
      id: "sdd-fb1",
      passage:
        "{{sdd-b1}} registers and {{sdd-b2}} sheets are frequently already collected by sex, even where nobody has analysed them that way. The first step is rarely new data {{sdd-b3}}, it is checking what already exists.",
      blanks: [
        { id: "sdd-b1", answer: "Beneficiary" },
        { id: "sdd-b2", answer: "attendance" },
        { id: "sdd-b3", answer: "collection" },
      ],
      distractors: ["disconnects", "accountable"],
    },
  ],

  "costing-a-gender-responsive-intervention": [
    {
      id: "cgri-fb1",
      passage:
        "Shifting a visit schedule or adding a second {{cgri-b1}} time are {{cgri-b2}} marginal design changes rather than new budget lines. Costing them against a real {{cgri-b3}} usually shows the increment is far smaller than expected.",
      blanks: [
        { id: "cgri-b1", answer: "consultation" },
        { id: "cgri-b2", answer: "typically" },
        { id: "cgri-b3", answer: "programme" },
      ],
      distractors: ["honestly", "access"],
    },
  ],

  "auditing-a-budget-circular-for-gsi-compliance": [
    {
      id: "abcfgc-fb1",
      passage:
        "Budget circulars {{abcfgc-b1}} state their {{abcfgc-b2}} requirements directly, a {{abcfgc-b3}} requirement, a mandatory statement, a specific annex. Missing a stated requirement is an avoidable rejection, not a judgment call.",
      blanks: [
        { id: "abcfgc-b1", answer: "increasingly" },
        { id: "abcfgc-b2", answer: "gender-responsive" },
        { id: "abcfgc-b3", answer: "disaggregation" },
      ],
      distractors: ["adjusting", "officers"],
    },
  ],

  "reporting-gender-responsive-spending-upward": [
    {
      id: "rgrsu-fb1",
      passage:
        "Spending that is not tagged and reported as {{rgrsu-b1}} cannot be counted at the national level. An {{rgrsu-b2}} that cannot {{rgrsu-b3}} its own record is in a weak position at the next budget negotiation.",
      blanks: [
        { id: "rgrsu-b1", answer: "gender-responsive" },
        { id: "rgrsu-b2", answer: "institution" },
        { id: "rgrsu-b3", answer: "demonstrate" },
      ],
      distractors: ["resource", "scores"],
    },
  ],

};
