/**
 * The people who run the platform, and what each of them is allowed to touch.
 *
 * THREE ROLES, and the boundaries between them are the product rather than a
 * technicality:
 *
 *   super-admin  Owns the platform. The only role that can create or remove an
 *                administrator, and the only one that reads the audit log.
 *   admin        Runs the day to day - modules, learners, lecturers,
 *                moderation, certificates. Cannot make another admin.
 *   lecturer     Writes the material, and only for the modules they have
 *                been assigned. Sees learners as progress on their own
 *                modules, never as a directory to browse.
 *
 * The rule that shapes the console is that ADMINS ARE APPOINTED, NOT
 * SELF-SERVED: an admin account exists because one specific person created it,
 * on a date, and that is recorded on the account itself (`createdBy`) rather
 * than only in the log. A console where you cannot see who let someone in is a
 * console where nobody is responsible for it.
 *
 * Nothing here is computed - `lib/admin.ts` derives every count, join and
 * permission check, so no screen works out a lecturer's workload twice and
 * gets it slightly different the second time.
 */

import { MODULES } from "@/content/site";
import type { StaffRole } from "@/lib/permissions";

/* -------------------------------------------------------------------- roles */

/**
 * The role type and its labels live in `lib/permissions.ts` - the browser
 * needs them and must not pull this file's data across to get them. Re-exported
 * here so anything reading staff records still has one import.
 */
export { ROLE_LABEL, ROLE_SUMMARY } from "@/lib/permissions";
export type { StaffRole };

/* ------------------------------------------------------------------- people */

export type StaffStatus = "active" | "invited" | "suspended";

/* ------------------------------------------------------------ credentials */

export type QualificationEntry = {
  id: string;
  qualification: string;
  institution: string;
  year: string;
};

export type ExperienceEntry = {
  id: string;
  role: string;
  organisation: string;
  /** Free text rather than two ISO dates - a CV entry is "2019-present", not
   *  a date range a picker would produce. */
  period: string;
  description?: string;
};

export type PublicationEntry = {
  id: string;
  title: string;
  publisher: string;
  year: string;
  /** A link to the piece itself, where one exists. */
  url?: string;
};

export type AchievementEntry = {
  id: string;
  title: string;
  year?: string;
  description?: string;
};

/**
 * A lecturer's credentials - what a learner reads on their public profile
 * page to judge whether this is someone worth learning from.
 *
 * FOUR LISTS, NOT ONE LONG BIO. A bio is the one paragraph everyone reads;
 * the lists are the evidence for it, and a learner scanning for "has this
 * person actually done the work" reads the lists, not the prose. Each list
 * can be empty - see `staff-inst-6` below for a lecturer with no achievements
 * recorded yet, which is a real and early-career state, not a gap to hide.
 */
export type LecturerProfile = {
  bio: string;
  qualifications: QualificationEntry[];
  experience: ExperienceEntry[];
  publications: PublicationEntry[];
  achievements: AchievementEntry[];
};

export type StaffMember = {
  id: string;
  name: string;
  /** Two letters - the fallback the avatar draws if `avatarUrl` is ever
   *  missing, which no record below actually leaves it as. */
  initials: string;
  /** A public headshot photo, sourced from Unsplash for this prototype (see
   *  the note in `components/student-portal/ui.tsx`'s `Avatar`) - a real
   *  build would swap these for the person's own uploaded photo. */
  avatarUrl: string;
  email: string;
  role: StaffRole;
  /** What they do, in their own organisation's words. */
  title: string;
  status: StaffStatus;
  createdOn: string;
  /**
   * The staff id of whoever created this account, or null for the founding
   * super administrator - the one account nobody on the platform appointed.
   */
  createdBy: string | null;
  /** ISO date. "Never" is expressed as the account still being `invited`. */
  lastActive: string | null;
  /**
   * Lecturers only: the modules they may author lectures for. An empty
   * array is a real and visible state - a lecturer with nothing assigned
   * can sign in and has nothing to open, which is what the assignment screen
   * exists to fix.
   */
  moduleIds?: string[];
  /**
   * Lecturers only: their public profile, set by an administrator when the
   * account is appointed (see FR-INS-201 in the SRS) and managed by the
   * lecturer themselves from then on. Every lecturer below carries one,
   * because it is mandatory at creation - there is no lecturer account on
   * this platform without one.
   */
  profile?: LecturerProfile;
};

export const STAFF: StaffMember[] = [
  {
    id: "staff-super",
    name: "Ruwan Jayasuriya",
    initials: "RJ",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "ruwan.jayasuriya@example.lk",
    role: "super-admin",
    title: "Platform owner",
    status: "active",
    createdOn: "2025-08-04",
    createdBy: null,
    lastActive: "2026-08-15",
  },
  {
    id: "staff-admin-1",
    name: "Chathuri Wijesinghe",
    initials: "CW",
    avatarUrl:
      "https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "chathuri.wijesinghe@example.lk",
    role: "admin",
    title: "Module operations lead",
    status: "active",
    createdOn: "2025-08-19",
    createdBy: "staff-super",
    lastActive: "2026-08-15",
  },
  {
    id: "staff-admin-2",
    name: "Dilan Fernando",
    initials: "DF",
    avatarUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "dilan.fernando@example.lk",
    role: "admin",
    title: "Learner support",
    status: "active",
    createdOn: "2025-11-06",
    createdBy: "staff-super",
    lastActive: "2026-08-14",
  },
  {
    // An account that exists but has never been used. The team page has to be
    // able to show a pending invitation, or "invite someone" is a button with
    // no visible consequence.
    id: "staff-admin-3",
    name: "Ayesha Nazeer",
    initials: "AN",
    avatarUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "ayesha.nazeer@example.lk",
    role: "admin",
    title: "Monitoring & evaluation",
    status: "invited",
    createdOn: "2026-08-11",
    createdBy: "staff-super",
    lastActive: null,
  },
  {
    id: "staff-inst-1",
    name: "Malika Ratnayake",
    initials: "MR",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "malika.ratnayake@example.lk",
    role: "lecturer",
    title: "Climate adaptation specialist",
    status: "active",
    createdOn: "2025-09-01",
    createdBy: "staff-super",
    lastActive: "2026-08-15",
    moduleIds: ["climate-vulnerability-assessment"],
    profile: {
      bio: "Malika has spent twelve years working on climate risk assessment across Sri Lanka's coastal and dry-zone districts, most recently leading the technical team behind the National Adaptation Plan's vulnerability baseline. She trained as a hydrologist before moving into policy-facing advisory work.",
      qualifications: [
        { id: "mr-q1", qualification: "MSc, Water Resources Engineering", institution: "University of Moratuwa", year: "2013" },
        { id: "mr-q2", qualification: "BSc (Hons), Civil Engineering", institution: "University of Peradeniya", year: "2010" },
      ],
      experience: [
        { id: "mr-e1", role: "Senior Technical Adviser, Climate Risk", organisation: "Ministry of Environment", period: "2019-present", description: "Leads the technical working group behind the National Adaptation Plan's vulnerability assessments." },
        { id: "mr-e2", role: "Hydrologist", organisation: "Irrigation Department", period: "2013-2019", description: "Flood modelling and hazard mapping for six river basins." },
      ],
      publications: [
        { id: "mr-p1", title: "Composite Vulnerability Indices for Divisional-Scale Planning in Sri Lanka", publisher: "Journal of South Asian Climate Policy", year: "2022" },
        { id: "mr-p2", title: "Field Verification Protocols for Desk-Based Hazard Data", publisher: "National Adaptation Plan Technical Series", year: "2020" },
      ],
      achievements: [
        { id: "mr-a1", title: "Lead author, Sri Lanka's second National Communication vulnerability chapter", year: "2021" },
      ],
    },
  },
  {
    id: "staff-inst-2",
    name: "Suresh Kumaraswamy",
    initials: "SK",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "suresh.kumaraswamy@example.lk",
    role: "lecturer",
    title: "Provincial planning officer",
    status: "active",
    createdOn: "2025-09-01",
    createdBy: "staff-super",
    lastActive: "2026-08-13",
    moduleIds: ["provincial-adaptation-plan"],
    profile: {
      bio: "Suresh has worked inside provincial administration for over fifteen years, most of that time translating national policy into budgets a divisional secretariat can actually act on. He teaches from the inside of the process he describes.",
      qualifications: [
        { id: "sk-q1", qualification: "MPA, Public Administration", institution: "University of Sri Jayewardenepura", year: "2011" },
        { id: "sk-q2", qualification: "BA (Hons), Economics", institution: "University of Colombo", year: "2007" },
      ],
      experience: [
        { id: "sk-e1", role: "Assistant Director, Provincial Planning", organisation: "Southern Provincial Council", period: "2016-present" },
        { id: "sk-e2", role: "Planning Officer", organisation: "Galle District Secretariat", period: "2009-2016" },
      ],
      publications: [
        { id: "sk-p1", title: "Sequencing Provincial Adaptation Budgets Across the Fiscal Cycle", publisher: "Provincial Governance Review", year: "2023" },
      ],
      achievements: [
        { id: "sk-a1", title: "Designed the localisation template now used by four provincial councils", year: "2021" },
      ],
    },
  },
  {
    // Two modules, one of them the unpublished draft. The lecturers list
    // needs a row where the workload is not one module, and the draft is
    // how the console shows work that is not public yet.
    id: "staff-inst-3",
    name: "Anoma Herath",
    initials: "AH",
    avatarUrl:
      "https://images.unsplash.com/photo-1541823709867-1b206113eafd?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "anoma.herath@example.lk",
    role: "lecturer",
    title: "Gender and social inclusion adviser",
    status: "active",
    createdOn: "2025-09-14",
    createdBy: "staff-admin-1",
    lastActive: "2026-08-15",
    moduleIds: ["gender-social-inclusion", "green-buildings"],
    profile: {
      bio: "Anoma has advised on gender and social inclusion for national ministries, provincial councils and two multilateral-funded programmes over a fourteen-year career. Her work focuses on turning inclusion requirements into decisions a budget officer or a procurement panel can actually check.",
      qualifications: [
        { id: "ah-q1", qualification: "MSc, Gender and Development", institution: "University of Colombo", year: "2012" },
        { id: "ah-q2", qualification: "BA (Hons), Sociology", institution: "University of Kelaniya", year: "2009" },
      ],
      experience: [
        { id: "ah-e1", role: "Gender and Social Inclusion Adviser", organisation: "Ministry of Women and Child Affairs", period: "2020-present" },
        { id: "ah-e2", role: "GSI Focal Point", organisation: "UNDP Sri Lanka", period: "2015-2020", description: "Led GSI mainstreaming across three provincial adaptation programmes." },
      ],
      publications: [
        { id: "ah-p1", title: "From Annex to Decision Point: Making GSI Requirements Operational", publisher: "Journal of Inclusive Development Practice", year: "2023" },
        { id: "ah-p2", title: "Reading a Budget for Who It Reaches", publisher: "Gender-Responsive Budgeting Practice Notes", year: "2021" },
      ],
      achievements: [
        { id: "ah-a1", title: "Designed the consultation-format guidance used across the Ministry's provincial programmes", year: "2022" },
        { id: "ah-a2", title: "Shortlisted, Public Service Innovation Awards", year: "2020" },
      ],
    },
  },
  {
    id: "staff-inst-4",
    name: "Nuwan de Silva",
    initials: "ND",
    avatarUrl:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "nuwan.desilva@example.lk",
    role: "lecturer",
    title: "Development finance economist",
    status: "active",
    createdOn: "2025-10-02",
    createdBy: "staff-admin-1",
    lastActive: "2026-08-09",
    moduleIds: ["bankable-climate-finance-proposals"],
    profile: {
      bio: "Nuwan structures climate finance proposals for government agencies and moves them through appraisal at multilateral funds. He has sat on both sides of the reviewer's desk, which shapes how he teaches what actually gets a proposal declined.",
      qualifications: [
        { id: "nd-q1", qualification: "MSc, Development Finance", institution: "SOAS University of London", year: "2014" },
        { id: "nd-q2", qualification: "BSc (Hons), Economics", institution: "University of Colombo", year: "2010" },
      ],
      experience: [
        { id: "nd-e1", role: "Development Finance Economist", organisation: "Department of National Planning", period: "2018-present" },
        { id: "nd-e2", role: "Investment Officer", organisation: "Development Finance Corporation of Ceylon", period: "2014-2018" },
      ],
      publications: [
        { id: "nd-p1", title: "What Makes a Climate Project Bankable, Not Just Worthwhile", publisher: "Climate Finance Quarterly", year: "2022" },
      ],
      achievements: [
        { id: "nd-a1", title: "Structured financing for three approved GCF-funded proposals", year: "2023" },
      ],
    },
  },
  {
    id: "staff-inst-5",
    name: "Tharindu Bandara",
    initials: "TB",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "tharindu.bandara@example.lk",
    role: "lecturer",
    title: "Public finance specialist",
    status: "active",
    createdOn: "2026-01-19",
    createdBy: "staff-admin-1",
    lastActive: "2026-07-30",
    moduleIds: ["gender-responsive-budgeting"],
    profile: {
      bio: "Tharindu has audited and advised on gender-responsive budgeting for provincial and national budget circulars for close to a decade, and reads a budget line the way most people read a balance sheet.",
      qualifications: [
        { id: "tb-q1", qualification: "MSc, Public Finance", institution: "University of Colombo", year: "2015" },
        { id: "tb-q2", qualification: "BSc (Hons), Business Administration", institution: "University of Sri Jayewardenepura", year: "2012" },
      ],
      experience: [
        { id: "tb-e1", role: "Public Finance Specialist", organisation: "Ministry of Finance", period: "2019-present" },
        { id: "tb-e2", role: "Budget Analyst", organisation: "National Budget Department", period: "2015-2019" },
      ],
      publications: [
        { id: "tb-p1", title: "Three Reasons a Gender-Responsive Budget Submission Gets Returned", publisher: "Public Finance Practice Notes", year: "2022" },
      ],
      achievements: [
        { id: "tb-a1", title: "Co-authored the GSI compliance checklist now used in the national budget circular", year: "2021" },
      ],
    },
  },
  {
    // Appointed, never assigned. The lecturer console has to have something
    // honest to show someone in exactly this position.
    id: "staff-inst-6",
    name: "Fathima Rizwan",
    initials: "FR",
    avatarUrl:
      "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "fathima.rizwan@example.lk",
    role: "lecturer",
    title: "Social development researcher",
    status: "invited",
    createdOn: "2026-08-12",
    createdBy: "staff-admin-1",
    lastActive: null,
    moduleIds: [],
    profile: {
      bio: "Fathima researches social development outcomes across rural service delivery programmes, with a particular interest in how monitoring data is collected and used.",
      qualifications: [
        { id: "fr-q1", qualification: "MSc, Social Policy and Development", institution: "London School of Economics", year: "2021" },
        { id: "fr-q2", qualification: "BA (Hons), Development Studies", institution: "University of Colombo", year: "2018" },
      ],
      experience: [
        { id: "fr-e1", role: "Research Associate", organisation: "Centre for Poverty Analysis", period: "2021-present" },
      ],
      publications: [
        { id: "fr-p1", title: "Sex-Disaggregated Data in Rural Service Delivery: What Already Exists", publisher: "Centre for Poverty Analysis Working Paper Series", year: "2023" },
      ],
      // Newly appointed, never active - a lecturer this early in their console
      // life genuinely has no recorded achievements yet, which is why this
      // list is the one left empty rather than padded to match the others.
      achievements: [],
    },
  },
];

/**
 * WHO YOU ARE when you open the console, per viewpoint.
 *
 * The prototype has no session, so the role switcher in the header decides
 * both what you can do and who the header says you are. Switching to
 * "Administrator" and still being greeted as the platform owner would make the
 * permission differences look like a bug rather than a rule.
 */
export const SESSION: Record<StaffRole, string> = {
  "super-admin": "staff-super",
  admin: "staff-admin-1",
  // Anoma Herath rather than one of the single-module lecturers, because
  // this account exercises the console: two modules, one published and one
  // still a draft, a lecture in review, and material on the shelf that nothing
  // uses yet. A lecturer with one finished module shows a console where
  // every screen is already green.
  lecturer: "staff-inst-3",
};

/* ------------------------------------------------------------- modules */

export type ModuleStatus = "published" | "draft";

export type ManagedModule = {
  id: string;
  title: string;
  status: ModuleStatus;
  level: string;
  hours: number;
  /** Lectures that exist, whether or not they are finished. */
  lectureCount: number;
  /** Of those, how many are published to learners. */
  publishedLectures: number;
  lecturerIds: string[];
  enrolments: number;
  completions: number;
  /** Mean quiz score across the module, as a percentage. */
  averageScore: number;
  /** Out of 5, from published reviews only. */
  rating: number;
  reviewCount: number;
  createdOn: string;
  updatedOn: string;
};

/**
 * The five public modules plus one that is not public yet.
 *
 * The five are BUILT FROM `content/site.ts` rather than retyped, so a title or
 * a lecture count cannot say one thing on the marketing page and another in the
 * console. Only the operational numbers - enrolments, ratings, who teaches it -
 * are authored here, because nothing on the public site knows about them.
 */
const catalogue = (
  id: string,
  operational: Omit<
    ManagedModule,
    "id" | "title" | "level" | "hours" | "lectureCount" | "status"
  >,
): ManagedModule => {
  const mdl = MODULES.find((entry) => entry.id === id);
  if (!mdl) throw new Error(`[staff] unknown module: ${id}`);

  return {
    id,
    title: mdl.title,
    status: "published",
    level: mdl.level,
    hours: mdl.hours,
    lectureCount: mdl.lectures,
    ...operational,
  };
};

export const MANAGED_MODULES: ManagedModule[] = [
  catalogue("climate-vulnerability-assessment", {
    publishedLectures: 8,
    lecturerIds: ["staff-inst-1"],
    enrolments: 612,
    completions: 104,
    averageScore: 84,
    rating: 4.7,
    reviewCount: 96,
    createdOn: "2025-09-08",
    updatedOn: "2026-08-04",
  }),
  catalogue("provincial-adaptation-plan", {
    publishedLectures: 7,
    lecturerIds: ["staff-inst-2"],
    enrolments: 468,
    completions: 87,
    averageScore: 86,
    rating: 4.6,
    reviewCount: 71,
    createdOn: "2025-09-08",
    updatedOn: "2026-07-22",
  }),
  catalogue("bankable-climate-finance-proposals", {
    publishedLectures: 8,
    lecturerIds: ["staff-inst-4"],
    enrolments: 431,
    completions: 63,
    averageScore: 82,
    rating: 4.5,
    reviewCount: 58,
    createdOn: "2025-10-13",
    updatedOn: "2026-08-11",
  }),
  catalogue("gender-social-inclusion", {
    publishedLectures: 7,
    lecturerIds: ["staff-inst-3"],
    enrolments: 342,
    // The attempt-weighted mean of `QUIZ_STATS` below rounds to 81 - this
    // field has to match it exactly, or the development console warns.
    averageScore: 81,
    completions: 41,
    rating: 4.4,
    reviewCount: 39,
    createdOn: "2025-11-24",
    updatedOn: "2026-06-30",
  }),
  catalogue("gender-responsive-budgeting", {
    publishedLectures: 7,
    lecturerIds: ["staff-inst-5"],
    enrolments: 260,
    completions: 19,
    averageScore: 80,
    rating: 4.6,
    reviewCount: 24,
    createdOn: "2026-02-09",
    updatedOn: "2026-08-13",
  }),
  {
    // Not on the public site, and that is the point: the modules screen has
    // to be able to show work in progress. Two of its six lectures are written.
    id: "green-buildings",
    title: "Green Buildings & Efficient Cooling",
    status: "draft",
    level: "Foundation",
    hours: 5,
    lectureCount: 6,
    publishedLectures: 0,
    lecturerIds: ["staff-inst-3"],
    enrolments: 0,
    completions: 0,
    averageScore: 0,
    rating: 0,
    reviewCount: 0,
    createdOn: "2026-07-06",
    updatedOn: "2026-08-14",
  },
];

/**
 * The draft module's lecture list.
 *
 * The five published modules get their lectures from `content/curriculum.ts`
 * - the same 37 the learner reads. A draft has no learner-facing content yet,
 * so its lectures exist only as a plan, which is exactly what an authoring
 * screen needs to show: two written, one in review, three not started.
 */
export type DraftLecture = {
  id: string;
  number: string;
  title: string;
  state: "published" | "in-review" | "draft" | "not-started";
  updatedOn: string | null;
};

export const DRAFT_LECTURES: Record<string, DraftLecture[]> = {
  "green-buildings": [
    {
      id: "why-cooling-is-the-problem",
      number: "01",
      title: "Why cooling is the problem",
      state: "draft",
      updatedOn: "2026-08-14",
    },
    {
      id: "envelope-before-equipment",
      number: "02",
      title: "Envelope before equipment",
      state: "draft",
      updatedOn: "2026-08-06",
    },
    {
      id: "sizing-and-specifying-plant",
      number: "03",
      title: "Sizing and specifying plant",
      state: "in-review",
      updatedOn: "2026-07-29",
    },
    {
      id: "retrofitting-a-government-building",
      number: "04",
      title: "Retrofitting a government building",
      state: "not-started",
      updatedOn: null,
    },
    {
      id: "measuring-what-you-saved",
      number: "05",
      title: "Measuring what you saved",
      state: "not-started",
      updatedOn: null,
    },
    {
      id: "writing-the-business-case",
      number: "06",
      title: "Writing the business case",
      state: "not-started",
      updatedOn: null,
    },
  ],
};

/**
 * Editorial state for the lectures that ARE published.
 *
 * Keyed by lecture id. Anything missing is treated as published and untouched
 * since launch by `lib/admin.ts` - authoring an entry for all 37 would be 37
 * lines saying the same thing.
 */
export const LECTURE_EDITS: Record<
  string,
  { state: DraftLecture["state"]; updatedOn: string; authorId: string }
> = {
  // The two most recently worked-on lectures on the platform, so the
  // dashboards have something true to point at.
  "auditing-a-budget-circular-for-gsi-compliance": {
    state: "published",
    updatedOn: "2026-08-13",
    authorId: "staff-inst-5",
  },
  "designing-an-inclusive-consultation": {
    state: "published",
    updatedOn: "2026-08-11",
    authorId: "staff-inst-3",
  },
  "presenting-findings-to-decision-makers": {
    state: "published",
    updatedOn: "2026-08-04",
    authorId: "staff-inst-1",
  },
};
