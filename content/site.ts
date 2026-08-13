/**
 * All landing-page copy and mock data lives here.
 *
 * The prototype has no backend, so this file stands in for what will later be
 * an API response. Keeping it in one place means the client can request copy
 * changes without anyone touching a component, and the real build can swap
 * these arrays for fetched data with the same shape.
 *
 * Programme subjects are drawn from the green-growth priorities that actually
 * apply to Sri Lankan ministries: adaptation, circular economy and waste,
 * renewable energy, green finance, and sustainable mobility and landscapes.
 */

export type Programme = {
  id: string;
  /** Rendered as the oversized editorial numeral. */
  number: string;
  title: string;
  summary: string;
  topics: string[];
  modules: number;
  hours: number;
  level: "Foundation" | "Intermediate";
  /** Picks which illustrated scene renders alongside the row. */
  scene: "hills" | "waste" | "energy" | "finance" | "coast";
};

export const PROGRAMMES: Programme[] = [
  {
    id: "climate-resilience",
    number: "01",
    title: "Climate Resilience & Adaptation",
    summary:
      "How a warming climate reaches your desk - and what an adaptation plan actually asks a department to do. Built around Sri Lanka's own adaptation priorities.",
    topics: [
      "Reading climate risk data",
      "National Adaptation Plan",
      "Vulnerability assessment",
      "Adaptation budgeting",
    ],
    modules: 9,
    hours: 6,
    level: "Foundation",
    scene: "hills",
  },
  {
    id: "circular-economy",
    number: "02",
    title: "Circular Economy & Sustainable Waste",
    summary:
      "Moving a district from collect-and-dump to recover-and-reuse. Waste streams, segregation systems, and the economics that decide whether a scheme survives its first year.",
    topics: [
      "Waste characterisation",
      "Segregation at source",
      "Recovery & composting",
      "Municipal cost models",
    ],
    modules: 8,
    hours: 5,
    level: "Foundation",
    scene: "waste",
  },
  {
    id: "sustainable-energy",
    number: "03",
    title: "Sustainable Energy Transition",
    summary:
      "Where the grid is going and how projects get built. Solar, wind and efficiency measures explained for the people who have to evaluate, approve and maintain them.",
    topics: [
      "Renewable technologies",
      "Grid integration basics",
      "Energy efficiency audits",
      "Procurement & tariffs",
    ],
    modules: 10,
    hours: 7,
    level: "Foundation",
    scene: "energy",
  },
  {
    id: "green-finance",
    number: "04",
    title: "Green & Climate Finance",
    summary:
      "Where the money comes from and what it demands in return. Concessional finance, green bonds and climate funds - and how to write a proposal that survives review.",
    topics: [
      "Climate funds & access",
      "Green bond frameworks",
      "Bankable project design",
      "Reporting obligations",
    ],
    modules: 8,
    hours: 6,
    level: "Intermediate",
    scene: "finance",
  },
  {
    id: "mobility-landscapes",
    number: "05",
    title: "Sustainable Mobility & Landscapes",
    summary:
      "Low-carbon transport and living ecosystems as one system. Public transport planning, restoration of forests and mangroves, and the coastal buffers that protect both.",
    topics: [
      "Low-carbon transport",
      "Forest & mangrove restoration",
      "Coastal resilience",
      "Land-use planning",
    ],
    modules: 7,
    hours: 5,
    level: "Foundation",
    scene: "coast",
  },
];

/** Derived so the hero stats can never drift out of sync with the list above. */
export const TOTALS = {
  programmes: PROGRAMMES.length,
  modules: PROGRAMMES.reduce((sum, p) => sum + p.modules, 0),
  hours: PROGRAMMES.reduce((sum, p) => sum + p.hours, 0),
};

/**
 * Scrolling subject strip under the hero.
 *
 * `tone` is a colour ROLE, not a colour - the five hues themselves live in the
 * `@theme` block in globals.css, same as everywhere else. The assignment is by
 * subject rather than by position: water and coasts are marine, waste and
 * materials are clay, energy is amber, money is plum. So the band reads as a
 * curriculum with range, not a decorated list.
 */
export type SubjectTone = "teal" | "amber" | "clay" | "marine" | "plum";

export const SUBJECT_MARQUEE: { label: string; tone: SubjectTone }[] = [
  { label: "Climate Adaptation", tone: "teal" },
  { label: "Circular Economy", tone: "clay" },
  { label: "Sustainable Energy", tone: "amber" },
  { label: "Green Finance", tone: "plum" },
  { label: "Waste Management", tone: "clay" },
  { label: "Coastal Resilience", tone: "marine" },
  { label: "Low-Carbon Transport", tone: "plum" },
  { label: "Sustainable Landscapes", tone: "teal" },
  { label: "Green Buildings", tone: "marine" },
  { label: "Climate-Smart Agriculture", tone: "amber" },
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
    title: "Enrol in a programme",
    body: "Choose the subject closest to your work. You can enrol in more than one, and you can leave and come back - your place is held.",
    detail: "Enrol in as many as you like",
  },
  {
    number: "03",
    title: "Work through the modules",
    body: "Short lectures you can take at your own pace, between meetings or after hours. Progress saves as you go, on any device.",
    detail: "5–7 hours per programme",
  },
  {
    number: "04",
    title: "Pass the quizzes",
    body: "A short quiz closes each module and confirms the ideas landed. Retake any of them as many times as you need - this is a foundation, not a filter.",
    detail: "Unlimited attempts",
  },
  {
    number: "05",
    title: "Earn your certificate",
    body: "Finish every module and quiz and the certificate issues immediately, carrying a unique reference anyone can check.",
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
    title: "Public sector officers",
    body: "You are being asked to deliver on climate commitments your training never covered. Start where the policy starts.",
    points: [
      "Ministry & departmental staff",
      "Provincial and local authority officers",
      "Planning and procurement teams",
    ],
  },
  {
    title: "Practitioners & consultants",
    body: "Working alongside government on green projects, and needing shared vocabulary with the people signing off.",
    points: [
      "Project and programme staff",
      "Engineers and technical advisors",
      "NGO and development teams",
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
      "Yes - every programme, module, quiz and certificate, at no cost. There is no paid tier and nothing is held back behind an upgrade. The platform exists to raise the baseline of green-growth knowledge in the country, not to earn revenue.",
  },
  {
    question: "Do I need a background in environmental science?",
    answer:
      "No. The programmes are written as foundations, assuming no prior technical training. If you can read a policy document, you can follow the material. Each programme starts from first principles and builds up.",
  },
  {
    question: "How long does a programme take?",
    answer:
      "Between five and seven hours of material, which most learners spread across two to four weeks. It is entirely self-paced - there are no live sessions, no fixed start dates and no deadline to finish by.",
  },
  {
    question: "What is the certificate actually worth?",
    answer:
      "It certifies that you completed every module and passed every quiz in a programme. Each one carries a unique reference number that can be checked, so you can attach it to a performance review, a job application or a project proposal as evidence of foundational knowledge in the subject.",
  },
  {
    question: "Can my department enrol as a group?",
    answer:
      "Individual sign-up is open to anyone right now. Group enrolment and departmental progress reporting are planned, so if you are coordinating training for a team, get in touch and we will keep you posted.",
  },
  {
    question: "Which language is the material in?",
    answer:
      "The first programmes are published in English. Sinhala and Tamil versions are on the roadmap, and the platform is built to carry all three side by side.",
  },
];
