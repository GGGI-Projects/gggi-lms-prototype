/**
 * All landing-page copy and mock data lives here.
 *
 * The prototype has no backend, so this file stands in for what will later be
 * an API response. Keeping it in one place means the client can request copy
 * changes without anyone touching a component, and the real build can swap
 * these arrays for fetched data with the same shape.
 *
 * Module subjects are the client's real first curriculum: climate
 * vulnerability assessment, provincial adaptation planning, climate finance
 * proposal writing, and gender equality & social inclusion (GSI), including
 * gender-responsive budgeting.
 */

export type Module = {
  id: string;
  /** Rendered as the oversized editorial numeral. */
  number: string;
  title: string;
  summary: string;
  topics: string[];
  lectures: number;
  hours: number;
  level: "Foundation" | "Intermediate";
  /** Picks which illustrated scene renders alongside the row. */
  scene: "hills" | "waste" | "energy" | "finance" | "coast";
};

export const MODULES: Module[] = [
  {
    id: "climate-vulnerability-assessment",
    number: "01",
    title: "Climate Vulnerability Assessment",
    summary:
      "Who and what is actually exposed to a changing climate, and how well they can cope with it - the groundwork every adaptation decision depends on.",
    topics: [
      "Hazard, exposure & sensitivity",
      "Reading climate risk data",
      "Vulnerability indicators",
      "Ground-truthing an assessment",
    ],
    lectures: 8,
    hours: 5,
    level: "Foundation",
    scene: "hills",
  },
  {
    id: "provincial-adaptation-plan",
    number: "02",
    title: "Localising the Provincial Adaptation Plan",
    summary:
      "Turning a national adaptation plan into action a province can actually deliver - reading it for local relevance, costing it, and sequencing it against a real budget cycle.",
    topics: [
      "National Adaptation Plan",
      "Provincial-level translation",
      "Local government consultation",
      "Costing & sequencing",
    ],
    lectures: 7,
    hours: 5,
    level: "Intermediate",
    scene: "coast",
  },
  {
    id: "bankable-climate-finance-proposals",
    number: "03",
    title: "Developing Bankable Climate Finance Proposals",
    summary:
      "The difference between a good idea and a financeable one. Matching a project to the right source of finance, and writing a proposal that survives review.",
    topics: [
      "Climate funds & access",
      "Bankable project design",
      "Financial modelling",
      "Reporting obligations",
    ],
    lectures: 8,
    hours: 6,
    level: "Intermediate",
    scene: "finance",
  },
  {
    id: "gender-social-inclusion",
    number: "04",
    title: "Maintaining Gender Equality and Social Inclusion (GSI)",
    summary:
      "Reading a plan or a project through a GSI lens - from designing an inclusive consultation to indicators that actually measure whether anyone was left out.",
    topics: [
      "GSI as a planning discipline",
      "Inclusive consultation design",
      "GSI indicators",
      "Mainstreaming into sector plans",
    ],
    lectures: 7,
    hours: 5,
    level: "Foundation",
    scene: "waste",
  },
  {
    id: "gender-responsive-budgeting",
    number: "05",
    title: "Gender-Responsive Budgeting",
    summary:
      "Reading a budget for who it actually reaches, and building the gender budget statement, the data and the case that changes it.",
    topics: [
      "Gender budget statements",
      "Sex-disaggregated data",
      "Costing an intervention",
      "Auditing a budget circular",
    ],
    lectures: 7,
    hours: 5,
    level: "Intermediate",
    scene: "energy",
  },
];

/** Derived so the hero stats can never drift out of sync with the list above. */
export const TOTALS = {
  modules: MODULES.length,
  lectures: MODULES.reduce((sum, p) => sum + p.lectures, 0),
  hours: MODULES.reduce((sum, p) => sum + p.hours, 0),
};

/**
 * Scrolling subject strip under the hero.
 *
 * `tone` is a colour ROLE, not a colour - the five hues themselves live in the
 * `@theme` block in globals.css, same as everywhere else. So the band reads as
 * a curriculum with range, not a decorated list.
 */
export type SubjectTone = "teal" | "amber" | "clay" | "marine" | "plum";

export const SUBJECT_MARQUEE: { label: string; tone: SubjectTone }[] = [
  { label: "Climate Vulnerability", tone: "teal" },
  { label: "Adaptation Planning", tone: "clay" },
  { label: "Climate Finance", tone: "marine" },
  { label: "Gender & Social Inclusion", tone: "plum" },
  { label: "Gender-Responsive Budgeting", tone: "amber" },
  { label: "Provincial Planning", tone: "teal" },
  { label: "Climate Risk", tone: "clay" },
  { label: "Inclusive Development", tone: "marine" },
  { label: "Bankable Proposals", tone: "plum" },
  { label: "Public Finance", tone: "amber" },
];

export type JourneyStep = {
  number: string;
  title: string;
  body: string;
  detail: string;
};

export const JOURNEY: JourneyStep[] = [
  {
    number: "01",
    title: "Create your account",
    body: "Sign up with an email address. No approval queue, no departmental sponsorship, no fee at any stage.",
    detail: "Takes about a minute",
  },
  {
    number: "02",
    title: "Enrol in a module",
    body: "Choose the subject closest to your work. You can enrol in more than one, and you can leave and come back - your place is held.",
    detail: "Enrol in as many as you like",
  },
  {
    number: "03",
    title: "Work through the lectures",
    body: "Short lectures you can take at your own pace, between meetings or after hours. Progress saves as you go, on any device.",
    detail: "5–6 hours per module",
  },
  {
    number: "04",
    title: "Pass the quizzes",
    body: "A short quiz closes each lecture and confirms the ideas landed. Retake any of them as many times as you need - this is a foundation, not a filter.",
    detail: "Unlimited attempts",
  },
  {
    number: "05",
    title: "Earn your certificate",
    body: "Finish every lecture and quiz and the certificate issues immediately, carrying a unique reference anyone can check.",
    detail: "Issued the moment you finish",
  },
];

export type Audience = {
  title: string;
  body: string;
  points: string[];
};

export const AUDIENCES: Audience[] = [
  {
    title: "Corporate finance & sustainability teams",
    body: "You are being asked to deliver on sustainability commitments your finance training never covered. Start where climate finance starts.",
    points: [
      "CFOs and finance function staff",
      "ESG and sustainability teams",
      "Treasury and investment teams",
    ],
  },
  {
    title: "Practitioners & consultants",
    body: "Working alongside corporates on climate finance and sustainability reporting, and needing shared vocabulary with the people signing off.",
    points: [
      "Project and programme staff",
      "Financial and sustainability advisors",
      "Bank and DFI teams",
    ],
  },
  {
    title: "Students & the public",
    body: "Anyone can enrol. No prior qualification, no institutional affiliation, no cost - just an interest in the subject.",
    points: [
      "Undergraduates and graduates",
      "Career changers",
      "Community organisers",
    ],
  },
];

export type FaqItem = { question: string; answer: string };

export const FAQ: FaqItem[] = [
  {
    question: "Is it really free?",
    answer:
      "Yes - every module, lecture, quiz and certificate, at no cost. There is no paid tier and nothing is held back behind an upgrade. The platform exists to raise the baseline of climate and inclusion knowledge in the country, not to earn revenue.",
  },
  {
    question: "Do I need a background in climate science or gender policy?",
    answer:
      "No. The modules are written as foundations, assuming no prior technical training. If you can read a policy document, you can follow the material. Each module starts from first principles and builds up.",
  },
  {
    question: "How long does a module take?",
    answer:
      "Between five and six hours of material, which most learners spread across two to four weeks. It is entirely self-paced - there are no live sessions, no fixed start dates and no deadline to finish by.",
  },
  {
    question: "What is the certificate actually worth?",
    answer:
      "It certifies that you completed every lecture and passed every quiz in a module. Each one carries a unique reference number that can be checked, so you can attach it to a performance review, a job application or a project proposal as evidence of foundational knowledge in the subject.",
  },
  {
    question: "Can my department enrol as a group?",
    answer:
      "Individual sign-up is open to anyone right now. Group enrolment and departmental progress reporting are planned, so if you are coordinating training for a team, get in touch and we will keep you posted.",
  },
  {
    question: "Which language is the material in?",
    answer:
      "Every module is published in English.",
  },
];
