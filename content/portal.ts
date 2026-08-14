/**
 * The signed-in learner, and everything the portal shows about them.
 *
 * This is the mock account the client will be shown during the demo. It has a
 * DELIBERATE SHAPE: one programme finished (so the certificate screens have
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

import { MODULES } from "@/content/curriculum";

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
    emailNewProgrammes: true,
    emailProduct: false,
    language: "English",
    reminders: "Weekly",
  },
} as const;

/* --------------------------------------------------------------- enrolments */

export type EnrolmentStatus = "completed" | "in-progress" | "not-started";

export type Enrolment = {
  programmeId: string;
  enrolledOn: string;
  /** Module ids, in the order they were finished. */
  completedModuleIds: string[];
  /**
   * Percentage scored, keyed by module id. A module can be complete without a
   * pass here - the quiz is taken after the content - which is exactly the
   * state the quizzes page exists to surface.
   */
  quizScores: Record<string, number>;
  /** Null once every module is done. */
  currentModuleId: string | null;
};

/** The pass mark for every quiz on the platform. One number, one rule. */
export const PASS_MARK = 70;

export const ENROLMENTS: Enrolment[] = [
  {
    programmeId: "circular-economy",
    enrolledOn: "2026-05-19",
    completedModuleIds: MODULES["circular-economy"].map((m) => m.id),
    // Every score here is a multiple of 25: a quiz is four questions, so those
    // are the only results that exist. See `QUIZ_LENGTH` in `lib/portal.ts`.
    quizScores: {
      "collect-and-dump-to-recover": 100,
      "characterising-a-waste-stream": 75,
      "segregation-at-source": 100,
      "composting-and-organic-recovery": 75,
      "recyclables-markets-and-buyers": 100,
      "economics-of-a-municipal-scheme": 75,
      "contracts-tenders-service-levels": 100,
      "past-year-one": 100,
    },
    currentModuleId: null,
  },
  {
    programmeId: "climate-resilience",
    enrolledOn: "2026-06-02",
    completedModuleIds: [
      "why-climate-reaches-your-desk",
      "reading-a-climate-risk-assessment",
      "sri-lanka-exposure",
      "vulnerability-and-who-carries-it",
    ],
    quizScores: {
      "why-climate-reaches-your-desk": 100,
      // Below the 70% pass mark - the quizzes page has to show a retake as
      // well as a tick, or half of what that screen is for is invisible.
      "reading-a-climate-risk-assessment": 50,
      "sri-lanka-exposure": 100,
      // Module 04 is finished but its quiz has not been attempted - the case
      // the quizzes page is built around.
    },
    currentModuleId: "inside-the-national-adaptation-plan",
  },
  {
    programmeId: "sustainable-energy",
    enrolledOn: "2026-07-14",
    completedModuleIds: ["the-grid-you-already-have"],
    quizScores: {
      "the-grid-you-already-have": 100,
    },
    currentModuleId: "solar-wind-and-what-they-need",
  },
];

/* ------------------------------------------------------------- certificates */

export type Certificate = {
  id: string;
  programmeId: string;
  /** Printed on the certificate and checkable against the register. */
  reference: string;
  issuedOn: string;
  /** Average across the programme's module quizzes, rounded. */
  averageScore: number;
};

export const CERTIFICATES: Certificate[] = [
  {
    id: "gp-2026-ce-04817",
    programmeId: "circular-economy",
    reference: "GP-2026-CE-04817",
    issuedOn: "2026-07-28",
    averageScore: 91,
  },
];

/* ---------------------------------------------------------------- activity */

export type ActivityKind = "module" | "quiz" | "certificate" | "enrolment";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  title: string;
  /** Second line - the programme, or the score. */
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
    kind: "module",
    title: "Vulnerability and who carries it",
    detail: "Climate Resilience & Adaptation",
    on: "2026-08-11",
    href: "/programmes/climate-resilience/modules/vulnerability-and-who-carries-it",
  },
  {
    id: "a2",
    kind: "quiz",
    title: "Exposure in Sri Lanka: heat, rain, sea",
    detail: "Passed with 100%",
    on: "2026-08-09",
    href: "/programmes/climate-resilience/modules/sri-lanka-exposure/quiz",
  },
  {
    id: "a3",
    kind: "module",
    title: "The grid you already have",
    detail: "Sustainable Energy Transition",
    on: "2026-07-31",
    href: "/programmes/sustainable-energy/modules/the-grid-you-already-have",
  },
  {
    id: "a4",
    kind: "certificate",
    title: "Circular Economy & Sustainable Waste",
    detail: "Certificate GP-2026-CE-04817 issued",
    on: "2026-07-28",
    href: "/certificates/gp-2026-ce-04817",
  },
  {
    id: "a5",
    kind: "enrolment",
    title: "Sustainable Energy Transition",
    detail: "Enrolled",
    on: "2026-07-14",
    href: "/programmes/sustainable-energy",
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
 * A pool of questions per programme, not per module.
 *
 * In the real platform each module owns its own questions. Authoring five
 * genuine questions for each of the 42 modules is a content job rather than a
 * design one, so the prototype holds five per PROGRAMME and `quizFor()` in
 * `lib/portal.ts` deals a rotating three of them to each module. Every quiz a
 * client opens is therefore about the right subject and is genuinely
 * answerable; two quizzes in the same programme will share a question.
 *
 * The rotation lives in one function, so replacing this with real per-module
 * banks means changing that function and nothing else.
 */
export const QUESTION_POOL: Record<string, Question[]> = {
  "climate-resilience": [
    {
      id: "cr1",
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
      id: "cr2",
      prompt: "A projection quotes a sea-level figure with no scenario and no time horizon. What should you conclude?",
      options: [
        "It is a conservative estimate",
        "The figure cannot be interpreted as it stands",
        "It applies to the present day",
        "It is the worst case",
      ],
      answer: 1,
      explanation:
        "Every projection is conditional. Without the horizon and the scenario there is nothing to compare the number against.",
    },
    {
      id: "cr3",
      prompt: "What makes a measure a 'no-regrets' measure?",
      options: [
        "It has no maintenance cost",
        "It is funded by a grant",
        "It is worth doing under today's climate as well as tomorrow's",
        "It can be reversed at any time",
      ],
      answer: 2,
      explanation:
        "Because the case does not depend on a projection being right, a no-regrets measure is the easiest kind to defend in a budget hearing.",
    },
    {
      id: "cr4",
      prompt: "Which of these is an outcome indicator rather than an output indicator?",
      options: [
        "Kilometres of drain constructed",
        "Households not flooded in the following monsoon",
        "Value of contracts awarded",
        "Number of officers trained",
      ],
      answer: 1,
      explanation:
        "Outputs record that the work happened. Outcomes record whether it changed anything, which is what a measure is ultimately judged on.",
    },
    {
      id: "cr5",
      prompt: "Why is a composite vulnerability index a poor basis for designing an intervention?",
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
  ],

  "circular-economy": [
    {
      id: "ce1",
      prompt: "Where is most of the value in a waste stream won or lost?",
      options: [
        "At the processing facility",
        "At the household, before collection",
        "In the transfer station",
        "At the point of sale to a buyer",
      ],
      answer: 1,
      explanation:
        "Mixed waste is worth almost nothing. Keeping materials separate at the moment they are discarded decides nearly all of the economics that follow.",
    },
    {
      id: "ce2",
      prompt: "Why should a characterisation study be run locally rather than using national figures?",
      options: [
        "National figures are usually out of date",
        "Composition varies widely between towns and wards",
        "Donors require a local study",
        "National figures exclude organic waste",
      ],
      answer: 1,
      explanation:
        "Organic fractions can range from roughly forty to seventy per cent between locations, and a facility sized on the wrong figure is very expensive to correct.",
    },
    {
      id: "ce3",
      prompt: "A separation scheme is being launched. What does the evidence suggest about the number of streams?",
      options: [
        "Start with four so households learn once",
        "Start with two and split later",
        "Start with three, always",
        "The number makes no measurable difference",
      ],
      answer: 1,
      explanation:
        "Adding streams at launch raises the error rate on all of them. Two well-understood streams, held for a year, outperform four introduced at once.",
    },
    {
      id: "ce4",
      prompt: "Which figure usually contributes most to a municipal scheme's financial case?",
      options: [
        "Revenue from selling recovered material",
        "Grant funding for equipment",
        "Avoided disposal cost",
        "Household collection fees",
      ],
      answer: 2,
      explanation:
        "Material sales rarely fund a scheme. The tonnage that no longer has to be collected, hauled and buried is where the saving is.",
    },
    {
      id: "ce5",
      prompt: "A collection contract is being drafted. Which clause matters most for the authority's long-term position?",
      options: [
        "The specified vehicle type",
        "Ownership of operational data",
        "The uniform standard for crews",
        "The depot location",
      ],
      answer: 1,
      explanation:
        "Without the weighbridge records the authority cannot verify performance, retender competitively or report its own diversion rate.",
    },
  ],

  "sustainable-energy": [
    {
      id: "se1",
      prompt: "Why does Sri Lanka's evening demand peak complicate a solar-led transition?",
      options: [
        "Solar panels degrade faster in the evening",
        "Transmission losses are highest after dark",
        "Solar output is zero when demand is highest",
        "Tariffs are lower in the evening",
      ],
      answer: 2,
      explanation:
        "The mismatch between an evening peak and daytime generation drives almost every hard decision in the transition, including storage and which thermal plant retires last.",
    },
    {
      id: "se2",
      prompt: "What does a capacity factor tell you?",
      options: [
        "The share of the year a plant is available",
        "Actual output as a share of nameplate capacity",
        "The plant's efficiency at peak load",
        "How much of the grid the plant can serve",
      ],
      answer: 1,
      explanation:
        "Nameplate capacity is what a plant can do at its best moment. Capacity factor is what it actually produces across a year, and it makes two proposals comparable.",
    },
    {
      id: "se3",
      prompt: "A battery is described as 5 MW / 20 MWh. What does the second figure describe?",
      options: [
        "How hard it can push at any instant",
        "How long it can sustain that output",
        "Its total lifetime output",
        "The size of the plant it serves",
      ],
      answer: 1,
      explanation:
        "Megawatts is power, megawatt-hours is energy. Duration is where cost grows fastest, so storage should be sized against a specific duty.",
    },
    {
      id: "se4",
      prompt: "Two proposals are being evaluated. Why is capital cost alone a poor criterion?",
      options: [
        "It excludes taxes and duties",
        "It is only half to two thirds of lifetime cost",
        "It cannot be verified at bid stage",
        "It varies with exchange rates",
      ],
      answer: 1,
      explanation:
        "Scoring only the capital number reliably selects equipment that is cheap to install and expensive to keep running, and the authority carries the difference.",
    },
    {
      id: "se5",
      prompt: "Public solar installations often stop producing within a few years. What is the usual cause?",
      options: [
        "Equipment failure under tropical conditions",
        "Grid connection being withdrawn",
        "No one assigned to monitor output and maintain the plant",
        "Tariff changes making operation uneconomic",
      ],
      answer: 2,
      explanation:
        "It is nearly always a handover problem: nobody holds the monitoring access, and cleaning and maintenance were never attached to a post with a budget.",
    },
  ],

  "green-finance": [
    {
      id: "gf1",
      prompt: "What does the grant element of a loan measure?",
      options: [
        "The portion that need not be repaid",
        "How far the terms sit below market terms",
        "The share funded by a donor",
        "Interest waived during the grace period",
      ],
      answer: 1,
      explanation:
        "It combines rate, tenor, grace period and fees into a single percentage, which is what allows two offers to be compared honestly.",
    },
    {
      id: "gf2",
      prompt: "Most climate funds are accessed through which route?",
      options: [
        "Direct application by the implementing department",
        "An accredited entity",
        "The national treasury only",
        "A commercial bank acting as agent",
      ],
      answer: 1,
      explanation:
        "The choice of accredited entity shapes the proposal itself, which is why it is a decision to take early rather than an administrative step.",
    },
    {
      id: "gf3",
      prompt: "What is a green bond's use-of-proceeds framework for?",
      options: [
        "Setting the coupon rate",
        "Guaranteeing the principal",
        "Stating what the money may fund and what will be reported",
        "Certifying the issuer's credit rating",
      ],
      answer: 2,
      explanation:
        "Investors are buying the framework as much as the credit. The reporting it commits to continues for the life of the bond.",
    },
    {
      id: "gf4",
      prompt: "In project finance terms, risk should generally be allocated to:",
      options: [
        "The party best able to manage it",
        "The party with the deepest balance sheet",
        "The public sector in all cases",
        "Whichever party the funder prefers",
      ],
      answer: 0,
      explanation:
        "Demand risk placed on a contractor who cannot influence demand is priced heavily or refused; retained by the authority it may cost far less overall.",
    },
    {
      id: "gf5",
      prompt: "Why should a proposal include the case in which the project underperforms?",
      options: [
        "It is a mandatory annex",
        "It reduces the interest rate offered",
        "Appraisers will find it anyway, and naming it builds credibility",
        "It transfers liability to the funder",
      ],
      answer: 2,
      explanation:
        "Stating the point at which the project stops being viable is a signal of a model worth trusting on everything else.",
    },
  ],

  "mobility-landscapes": [
    {
      id: "ml1",
      prompt: "Where budget forces a choice, which usually carries more passengers?",
      options: [
        "Wider coverage across many routes",
        "Higher frequency on fewer corridors",
        "Newer vehicles on existing routes",
        "Lower fares across the network",
      ],
      answer: 1,
      explanation:
        "A service every ten minutes needs no timetable and no planning by its user. An hourly service loses everyone who has an alternative.",
    },
    {
      id: "ml2",
      prompt: "Where are public transport trips most often abandoned?",
      options: [
        "At the origin stop",
        "At the transfer between services",
        "At the destination end",
        "During the main line-haul",
      ],
      answer: 1,
      explanation:
        "An unsheltered wait, a road to cross or a second fare loses the trip. Fixing an interchange usually buys more ridership per rupee than new vehicles.",
    },
    {
      id: "ml3",
      prompt: "Why does mangrove restoration most often fail?",
      options: [
        "The wrong species was planted",
        "Seedlings were too young",
        "The site's hydrology was never restored",
        "Salinity was too high",
      ],
      answer: 2,
      explanation:
        "The species is frequently right and the water wrong. Restoring tidal flow, sometimes on its own, outperforms planting on a site that cannot support it.",
    },
    {
      id: "ml4",
      prompt: "What is the usual consequence of protecting one stretch of coast with a hard sea wall?",
      options: [
        "Erosion reappears beyond the end of the structure",
        "Sediment accumulates evenly along the coast",
        "Wave energy is absorbed permanently",
        "The beach in front of it widens",
      ],
      answer: 0,
      explanation:
        "Hard defences interrupt sediment movement along the shore, which is why coastal protection assessed one property at a time leaves a district worse off.",
    },
    {
      id: "ml5",
      prompt: "Why is street shade treated as infrastructure in this programme?",
      options: [
        "It reduces road maintenance costs",
        "An unshaded footpath is unusable for much of the day",
        "It is required by the planning rules",
        "It lowers vehicle emissions directly",
      ],
      answer: 1,
      explanation:
        "In this climate the surface is not what stops people walking. Trees are the cheapest intervention available and the slowest to mature, so they are planted first.",
    },
  ],
};
