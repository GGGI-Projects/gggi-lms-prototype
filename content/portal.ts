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
    currentLectureId: "assessing-adaptive-capacity",
  },
  {
    moduleId: "bankable-climate-finance-proposals",
    enrolledOn: "2026-07-14",
    completedLectureIds: ["what-makes-a-project-bankable"],
    quizScores: {
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
  /** Shown after the attempt, whether the answer was right or wrong. */
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
