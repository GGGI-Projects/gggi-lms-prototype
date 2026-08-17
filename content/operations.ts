/**
 * Everything the console reports on that is not a person or a module:
 * platform totals, the analytics series behind the charts, the moderation
 * queue, revoked certificates, the audit log, and the platform's own settings.
 *
 * THE TOTALS ARE THE SOURCE OF TRUTH, not the sampled lists. The register in
 * `content/students.ts` is one page of 1,247 learners, and the charts here
 * describe all of them. Deriving the charts from 27 authored records would
 * draw a truthful picture of a sample and a false one of the platform, and the
 * screens that matter - a dashboard someone makes decisions from - are about
 * the platform. `lib/admin.ts` checks in development that every series still
 * adds up to the totals below.
 *
 * The platform opened in September 2025 and today is 15 August 2026, so the
 * last month in every series is a PART MONTH. Charts that quietly show a
 * collapse in the final column, because the month is half over, are how a
 * dashboard gets someone to panic about nothing.
 */

/* ------------------------------------------------------------------ totals */

export const PLATFORM = {
  learners: 1247,
  /** Signed in at least once in the last 30 days. */
  activeLearners: 486,
  enrolments: 2113,
  certificates: 314,
  /** Of `certificates`, how many were withdrawn afterwards. */
  revoked: 3,
  /** Mean quiz score across every attempt on the platform. */
  averageScore: 83,
  /** Enrolments that reached a certificate, as a percentage. */
  completionRate: 15,
  launchedOn: "2025-09-08",
} as const;

/* ---------------------------------------------------------------- analytics */

export type MonthPoint = {
  /** Three letters, as drawn on the axis. */
  label: string;
  /** First of the month, for the tooltip and the sr-only table. */
  month: string;
  signups: number;
  enrolments: number;
  completions: number;
};

/**
 * Twelve months to the day. `signups` across the series sums to
 * `PLATFORM.learners` and `enrolments` to `PLATFORM.enrolments` - the dev-time
 * check in `lib/admin.ts` fails the build's console if either drifts.
 */
export const MONTHLY: MonthPoint[] = [
  { label: "Sep", month: "2025-09-01", signups: 38, enrolments: 41, completions: 0 },
  { label: "Oct", month: "2025-10-01", signups: 52, enrolments: 68, completions: 2 },
  { label: "Nov", month: "2025-11-01", signups: 61, enrolments: 89, completions: 7 },
  { label: "Dec", month: "2025-12-01", signups: 74, enrolments: 106, completions: 11 },
  { label: "Jan", month: "2026-01-01", signups: 88, enrolments: 140, completions: 18 },
  { label: "Feb", month: "2026-02-01", signups: 96, enrolments: 165, completions: 23 },
  { label: "Mar", month: "2026-03-01", signups: 112, enrolments: 195, completions: 29 },
  { label: "Apr", month: "2026-04-01", signups: 128, enrolments: 232, completions: 34 },
  { label: "May", month: "2026-05-01", signups: 141, enrolments: 268, completions: 38 },
  { label: "Jun", month: "2026-06-01", signups: 156, enrolments: 302, completions: 45 },
  { label: "Jul", month: "2026-07-01", signups: 168, enrolments: 328, completions: 61 },
  // Part month - 15 days of it. Labelled as such wherever it is drawn.
  { label: "Aug", month: "2026-08-01", signups: 133, enrolments: 179, completions: 46 },
];

/** Learners by district, biggest first. Sums to `PLATFORM.learners`. */
export const BY_DISTRICT: { label: string; value: number }[] = [
  { label: "Colombo", value: 268 },
  { label: "Gampaha", value: 174 },
  { label: "Galle", value: 121 },
  { label: "Kandy", value: 118 },
  { label: "Kurunegala", value: 96 },
  { label: "Jaffna", value: 84 },
  { label: "Batticaloa", value: 71 },
  { label: "Matara", value: 63 },
  { label: "Other districts", value: 252 },
];

/** Where learners work, as a share of `PLATFORM.learners`. Sums to 100. */
export const BY_SECTOR: { label: string; percent: number }[] = [
  { label: "Government or public sector", percent: 41 },
  { label: "Provincial or local authority", percent: 18 },
  { label: "Private sector", percent: 16 },
  { label: "NGO or development organisation", percent: 12 },
  { label: "University or school", percent: 9 },
  { label: "Something else", percent: 4 },
];

/**
 * Where the platform's 2,113 enrolments stand right now. Sums to
 * `PLATFORM.enrolments`, and `completed` equals `PLATFORM.certificates` -
 * a finished enrolment IS a certificate, and the two numbers being allowed to
 * differ is how a dashboard starts lying quietly.
 */
export const ENROLMENT_SPLIT = {
  completed: 314,
  inProgress: 902,
  notStarted: 897,
} as const;

/** Learners signed in per week, most recent last. Drawn as a sparkline. */
export const WEEKLY_ACTIVE = [
  312, 341, 358, 336, 372, 401, 388, 419, 447, 462, 458, 486,
];

/* ----------------------------------------------------------- quiz results */

export type QuizStats = {
  /** How many learners have submitted this quiz at least once. */
  attempts: number;
  /** Percentage of those who reached the pass mark. */
  passRate: number;
  /** Mean score across every attempt, including retakes. */
  averageScore: number;
};

/**
 * Per-lecture quiz results, for the module the demo instructor teaches.
 *
 * ONE MODULE ONLY, and that is honest rather than lazy: the console screens
 * that need lecture-level figures are the instructor's, and inventing 37 sets
 * of plausible numbers would make every one of them equally unfalsifiable.
 * Everywhere else the interface says there is not enough data yet, which is
 * also what a real platform says about a module nobody has finished.
 *
 * The attempt-weighted mean of `averageScore` below is 81%, which is what
 * `MANAGED_MODULES` declares for Maintaining Gender Equality and Social
 * Inclusion (GSI). The check in `lib/admin.ts` fails the development console
 * if that stops being true.
 *
 * The shape is a funnel, because that is what quizzes on a self-paced course
 * look like: 340 people take the first one and 118 take the last. The two low
 * pass rates are deliberate - they are what an instructor is supposed to
 * notice, and a screen where every lecture reads 90% teaches nobody anything.
 */
export const QUIZ_STATS: Record<string, QuizStats> = {
  "gsi-as-a-planning-discipline": { attempts: 340, passRate: 92, averageScore: 87 },
  "reading-a-situation-through-a-gsi-lens": {
    attempts: 298,
    passRate: 88,
    averageScore: 84,
  },
  // Below the pass mark on average. The lecture before it is fine and the one
  // after it is fine, which usually means the question is wrong.
  "designing-an-inclusive-consultation": {
    attempts: 261,
    passRate: 66,
    averageScore: 72,
  },
  "setting-gsi-indicators-that-mean-something": {
    attempts: 224,
    passRate: 81,
    averageScore: 79,
  },
  "mainstreaming-gsi-into-a-sector-plan": {
    attempts: 189,
    passRate: 85,
    averageScore: 82,
  },
  "handling-exclusion-when-you-find-it": {
    attempts: 156,
    passRate: 69,
    averageScore: 73,
  },
  "reporting-on-gsi-without-tokenism": {
    attempts: 118,
    passRate: 90,
    averageScore: 85,
  },
};

/* -------------------------------------------------------------- moderation */

export type ReviewStatus = "pending" | "published" | "rejected";

export type Review = {
  id: string;
  studentId: string;
  /** Kept on the record so a rejected review still says what it was about. */
  studentName: string;
  moduleId: string;
  rating: number;
  body: string;
  submittedOn: string;
  status: ReviewStatus;
  /** Staff id, once someone has decided. */
  decidedBy?: string;
  decidedOn?: string;
  /** Why it was rejected. Required by the moderation screen for a rejection. */
  reason?: string;
  /** Set when a learner or an automated check flagged the text. */
  flagged?: boolean;
};

/**
 * The queue, newest first.
 *
 * Deliberately mixed: four waiting, six already published, two rejected for
 * different reasons, and one of the waiting ones flagged. A moderation screen
 * that only ever shows polite five-star reviews is a screen nobody can judge.
 */
export const REVIEWS: Review[] = [
  {
    id: "rev-118",
    studentId: "stu-2037",
    studentName: "Sanduni Alwis",
    moduleId: "bankable-climate-finance-proposals",
    rating: 5,
    body: "The concept note structure lecture is the first thing I've read that explains why our last two submissions were returned without a second look. Rewrote our draft the same week using the template.",
    submittedOn: "2026-08-14",
    status: "pending",
  },
  {
    id: "rev-117",
    studentId: "stu-2023",
    studentName: "Sajith Weerakoon",
    moduleId: "bankable-climate-finance-proposals",
    rating: 1,
    body: "Useless. Whoever wrote this has never worked in this country. Contact me on 07X XXX XXXX if you want to argue about it.",
    submittedOn: "2026-08-13",
    status: "pending",
    flagged: true,
  },
  {
    id: "rev-116",
    studentId: "stu-2028",
    studentName: "Shanika Rodrigo",
    moduleId: "provincial-adaptation-plan",
    rating: 4,
    body: "Strong on reading the NAP chapters, thinner on what happens when the divisional secretariat disagrees with the province. One more worked example of that would help.",
    submittedOn: "2026-08-12",
    status: "pending",
  },
  {
    id: "rev-115",
    studentId: "stu-2019",
    studentName: "Aravinth Thevarajah",
    moduleId: "gender-social-inclusion",
    rating: 5,
    body: "We used the stakeholder mapping worksheet in a project meeting and it settled an argument about who we'd actually consulted. Wish I'd had this two projects ago.",
    submittedOn: "2026-08-10",
    status: "pending",
  },
  {
    id: "rev-114",
    studentId: "stu-2020",
    studentName: "Dulmini Herath",
    moduleId: "bankable-climate-finance-proposals",
    rating: 5,
    body: "Clear, and mercifully free of jargon. The bankability lecture alone is worth the whole module.",
    submittedOn: "2026-08-07",
    status: "published",
    decidedBy: "staff-admin-1",
    decidedOn: "2026-08-08",
  },
  {
    id: "rev-113",
    studentId: "stu-2018",
    studentName: "Menaka Liyanage",
    moduleId: "gender-responsive-budgeting",
    rating: 5,
    body: "I review budget circulars for a living and I still learned how to read a gender budget statement properly.",
    submittedOn: "2026-08-05",
    status: "published",
    decidedBy: "staff-admin-1",
    decidedOn: "2026-08-06",
  },
  {
    id: "rev-112",
    studentId: "stu-2022",
    studentName: "Hasini Abeywardena",
    moduleId: "climate-vulnerability-assessment",
    rating: 4,
    body: "Strong on building the index. The ground-truthing lecture moves fast if you've never run a field verification before.",
    submittedOn: "2026-08-01",
    status: "published",
    decidedBy: "staff-admin-2",
    decidedOn: "2026-08-02",
  },
  {
    id: "rev-111",
    studentId: "stu-2016",
    studentName: "Iresha Kumari",
    moduleId: "provincial-adaptation-plan",
    rating: 5,
    body: "Watched most of it on a phone between field visits. It held up, which I did not expect.",
    submittedOn: "2026-07-28",
    status: "published",
    decidedBy: "staff-admin-2",
    decidedOn: "2026-07-29",
  },
  {
    id: "rev-110",
    studentId: "stu-2025",
    studentName: "Roshan Peiris",
    moduleId: "gender-social-inclusion",
    rating: 4,
    body: "The mainstreaming lecture changed how I read our own sector plan's procurement criteria. More case studies from smaller departments, please.",
    submittedOn: "2026-07-24",
    status: "published",
    decidedBy: "staff-admin-1",
    decidedOn: "2026-07-25",
  },
  {
    id: "rev-109",
    studentId: "stu-2029",
    studentName: "Buddhika Senanayake",
    moduleId: "gender-responsive-budgeting",
    rating: 3,
    body: "Solid material, but the sex-disaggregated data lecture assumes registers exist that nobody in a rural office actually keeps.",
    submittedOn: "2026-07-20",
    status: "published",
    decidedBy: "staff-admin-2",
    decidedOn: "2026-07-21",
  },
  {
    id: "rev-108",
    studentId: "stu-2021",
    studentName: "Nimal Karunaratne",
    moduleId: "climate-vulnerability-assessment",
    rating: 2,
    body: "Sharing my login with three colleagues since the department will not pay for separate accounts. Works fine.",
    submittedOn: "2026-07-16",
    status: "rejected",
    decidedBy: "staff-admin-1",
    decidedOn: "2026-07-17",
    reason: "Describes account sharing - handled as a support case instead.",
  },
  {
    id: "rev-107",
    studentId: "stu-2017",
    studentName: "Chathura Ranasinghe",
    moduleId: "gender-responsive-budgeting",
    rating: 5,
    body: "Best courses in Sri Lanka!! Visit my site for cheap certificates and training discounts - link in my profile.",
    submittedOn: "2026-07-09",
    status: "rejected",
    decidedBy: "staff-admin-2",
    decidedOn: "2026-07-09",
    reason: "Advertising.",
  },
];

/* ------------------------------------------------------------ certificates */

/**
 * Certificates that were issued and later withdrawn, keyed by reference.
 *
 * The register itself is DERIVED in `lib/admin.ts` from the learners who
 * finished - a certificate is not a separate thing an administrator creates,
 * it is what completing a module produces, and a register kept by hand
 * beside the enrolments is a register that will disagree with them. What
 * cannot be derived is a withdrawal, because nothing in the learning data
 * records one. That is this.
 */
export const REVOCATIONS: Record<
  string,
  { revokedOn: string; by: string; reason: string }
> = {
  "GP-2026-GB-05771": {
    revokedOn: "2026-08-06",
    by: "staff-admin-1",
    reason:
      "Issued against a duplicate account. Reissued on the learner's original record.",
  },
};

/* -------------------------------------------------------------- audit log */

export type AuditAction =
  | "account.created"
  | "account.suspended"
  | "account.restored"
  | "role.changed"
  | "module.created"
  | "module.published"
  | "module.updated"
  | "lecture.published"
  | "assignment.changed"
  | "review.published"
  | "review.rejected"
  | "certificate.revoked"
  | "settings.updated"
  | "export.generated";

export type AuditEntry = {
  id: string;
  /** Staff id. Every entry has an actor - the platform never acts on its own. */
  actorId: string;
  action: AuditAction;
  /** What was acted on, in words rather than ids. */
  target: string;
  /** Optional second line: what changed, from what to what. */
  detail?: string;
  /** ISO date and time, to the minute. */
  at: string;
};

/**
 * Newest first. Twenty entries, which is one screen - the log's job on this
 * prototype is to prove the trail exists and is readable, not to be complete.
 */
export const AUDIT: AuditEntry[] = [
  {
    id: "log-220",
    actorId: "staff-inst-3",
    action: "lecture.published",
    target: "Designing an inclusive consultation",
    detail: "Maintaining Gender Equality and Social Inclusion (GSI) · lecture 03",
    at: "2026-08-15T09:12",
  },
  {
    id: "log-219",
    actorId: "staff-admin-1",
    action: "review.published",
    target: "Review rev-114 by Dulmini Herath",
    detail: "Developing Bankable Climate Finance Proposals · 5 stars",
    at: "2026-08-14T16:41",
  },
  {
    id: "log-218",
    actorId: "staff-super",
    action: "account.created",
    target: "Ayesha Nazeer",
    detail: "Administrator · invitation sent to ayesha.nazeer@example.lk",
    at: "2026-08-11T11:05",
  },
  {
    id: "log-217",
    actorId: "staff-admin-1",
    action: "account.created",
    target: "Fathima Rizwan",
    detail: "Lecture instructor · no modules assigned yet",
    at: "2026-08-12T10:22",
  },
  {
    id: "log-216",
    actorId: "staff-admin-1",
    action: "certificate.revoked",
    target: "GP-2026-GB-05771",
    detail: "Duplicate account · reissued on the original record",
    at: "2026-08-06T14:58",
  },
  {
    id: "log-215",
    actorId: "staff-inst-5",
    action: "module.updated",
    target: "Gender-Responsive Budgeting",
    detail: "Lecture 03 rewritten after learner feedback",
    at: "2026-08-13T08:37",
  },
  {
    id: "log-214",
    actorId: "staff-admin-2",
    action: "account.suspended",
    target: "Sajith Weerakoon",
    detail: "Repeated abusive submissions to moderation",
    at: "2026-08-13T15:19",
  },
  {
    id: "log-213",
    actorId: "staff-super",
    action: "settings.updated",
    target: "Certificates",
    detail: "Pass mark held at 70% · issue on completion left on",
    at: "2026-08-09T09:44",
  },
  {
    id: "log-212",
    actorId: "staff-admin-1",
    action: "assignment.changed",
    target: "Anoma Herath",
    detail: "Assigned to Green Buildings & Efficient Cooling",
    at: "2026-07-06T13:02",
  },
  {
    id: "log-211",
    actorId: "staff-admin-1",
    action: "module.created",
    target: "Green Buildings & Efficient Cooling",
    detail: "Draft · not visible to learners",
    at: "2026-07-06T12:51",
  },
  {
    id: "log-210",
    actorId: "staff-admin-2",
    action: "review.rejected",
    target: "Review rev-107 by Chathura Ranasinghe",
    detail: "Advertising",
    at: "2026-07-09T10:15",
  },
  {
    id: "log-209",
    actorId: "staff-admin-2",
    action: "export.generated",
    target: "Learner register",
    detail: "1,203 rows · CSV",
    at: "2026-07-02T17:30",
  },
  {
    id: "log-208",
    actorId: "staff-inst-1",
    action: "lecture.published",
    target: "Presenting findings to decision-makers",
    detail: "Climate Vulnerability Assessment · lecture 07 revised",
    at: "2026-08-04T11:26",
  },
  {
    id: "log-207",
    actorId: "staff-super",
    action: "role.changed",
    target: "Dilan Fernando",
    detail: "Lecture instructor → Administrator",
    at: "2025-11-06T09:03",
  },
  {
    id: "log-206",
    actorId: "staff-admin-1",
    action: "module.published",
    target: "Gender-Responsive Budgeting",
    detail: "7 lectures · opened to enrolment",
    at: "2026-02-09T08:15",
  },
  {
    id: "log-205",
    actorId: "staff-admin-2",
    action: "account.restored",
    target: "Nimal Karunaratne",
    detail: "Suspension lifted after support call",
    at: "2026-07-18T14:07",
  },
  {
    id: "log-204",
    actorId: "staff-inst-4",
    action: "module.updated",
    target: "Developing Bankable Climate Finance Proposals",
    detail: "Reporting lecture updated for the 2026 verification rules",
    at: "2026-06-30T16:44",
  },
  {
    id: "log-203",
    actorId: "staff-super",
    action: "settings.updated",
    target: "Moderation",
    detail: "Reviews now held for approval before publishing",
    at: "2026-05-21T10:58",
  },
  {
    id: "log-202",
    actorId: "staff-admin-1",
    action: "assignment.changed",
    target: "Tharindu Bandara",
    detail: "Assigned to Gender-Responsive Budgeting",
    at: "2026-01-19T09:31",
  },
  {
    id: "log-201",
    actorId: "staff-super",
    action: "module.published",
    target: "Climate Vulnerability Assessment",
    detail: "First module on the platform",
    at: "2025-09-08T07:00",
  },
];

/* ---------------------------------------------------------------- settings */

/**
 * The platform's own settings, as currently set.
 *
 * Grouped the way the settings screen groups them. `superAdminOnly` marks the
 * groups an administrator can read but not change - the console shows those
 * controls disabled with the reason, rather than hiding them, because a
 * setting you cannot see is one you cannot ask about.
 */
export const PLATFORM_SETTINGS = {
  general: {
    platformName: "GreenFin Academy",
    supportEmail: "hello@greenfin.lk",
    defaultLanguage: "English",
    languages: ["English", "සිංහල", "தமிழ்"],
    timezone: "Asia/Colombo (UTC+5:30)",
  },
  enrolment: {
    openRegistration: true,
    requireEmailVerification: true,
    maxModulesPerLearner: "No limit",
    allowSelfUnenrol: true,
  },
  certificates: {
    passMark: 70,
    issueOnCompletion: true,
    referencePrefix: "GF",
    verificationPage: true,
  },
  moderation: {
    holdReviewsForApproval: true,
    autoFlagKeywords: true,
    notifyOnFlag: true,
  },
  email: {
    weeklyProgressDigest: true,
    newModuleAnnouncements: true,
    inactivityNudgeAfter: "21 days",
  },
} as const;
