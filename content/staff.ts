/**
 * The people who run the platform, and what each of them is allowed to touch.
 *
 * SEVEN ROLES, and the boundaries between them are the product rather than a
 * technicality. THE OLD FLAT `admin` ROLE NO LONGER EXISTS (docs/SRS.md
 * §1.2, BR-31) - every one of its old responsibilities now belongs to
 * exactly one of the six scoped roles below, never to a second,
 * general-purpose account kept "just in case":
 *
 *   super-admin           Owns the platform. The only role that can appoint
 *                         any other console role, and the only one that
 *                         reads the audit log.
 *   module-admin          Runs one Module (or several - Appendix D, item 9)
 *                         day to day: its lecturer roster, its own details
 *                         and tags, its publish state, and its own reviews
 *                         and certificates (§4.29). Scoped by `moduleIds`
 *                         below, the same field a lecturer's own assignment
 *                         already uses.
 *   laws-admin            Keeps the Law library current, platform-wide.
 *                         Touches no Module, lecturer or learner (§4.30).
 *   tools-admin           Keeps the Tool directory current, platform-wide.
 *                         Touches no Module, lecturer or learner (§4.31).
 *   list-manager          Maintains the dynamic option lists that tag
 *                         Modules, Laws and Tools (§4.32).
 *   provincial-registrar  Reviews registration applications for exactly one
 *                         province (docs/SRS.md §4.33), and, once approved,
 *                         is that province's learners' ongoing administrator
 *                         - suspend, reset, export. Scoped by the `province`
 *                         field below.
 *   lecturer              Writes the material, and only for the modules they
 *                         have been assigned. Sees learners as progress on
 *                         their own modules, never as a directory to browse.
 *
 * The rule that shapes the console is that EVERY ONE OF THESE IS APPOINTED,
 * NOT SELF-SERVED: an account exists because one specific person created it,
 * on a date, and that is recorded on the account itself (`createdBy`) rather
 * than only in the log. A console where you cannot see who let someone in is a
 * console where nobody is responsible for it.
 *
 * Nothing here is computed - `lib/admin.ts` derives every count, join and
 * permission check, so no screen works out a lecturer's workload twice and
 * gets it slightly different the second time.
 */

import { MODULES } from "@/content/site";
import type { Province } from "@/content/laws";
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
   * Lecturers and Module Administrators only, and the two roles read this
   * same array very differently: for a lecturer it is which modules they may
   * author lectures for, for a Module Administrator (§4.29) it is which
   * modules they administer - its lecturer roster, its details and tags, its
   * publish state (FR-MODADM-010). A person can hold either role for more
   * than one Module (Appendix D, item 9), so this stays an array rather than
   * a single id, the same shape both readings need. An empty array is a real
   * and visible state either way - nothing assigned, nothing to open.
   */
  moduleIds?: string[];
  /**
   * Provincial Registrars only: the one province they administer (§4.33).
   * Never "National / Head Office" - applications and learners with that
   * choice belong to the Super Administrator directly instead (FR-REG-040),
   * so this field is always a real province, and a Provincial Registrar
   * without one would be a role with nothing to scope it - a state this
   * prototype does not create.
   */
  province?: Province;
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
    // The old flat Administrator role's most active account (see her
    // `createdBy` trail on staff-inst-3/4/5/6 below) - now a Module
    // Administrator for the same modules those appointments already tie her
    // to (BR-31). IDS ARE NOT RENAMED on a role change, here or on the two
    // records after it: `staff-admin-1` is an opaque identifier, not
    // user-facing text, and every `createdBy`/`addedBy`/`uploadedBy`
    // reference elsewhere in this codebase is a historical fact about who
    // did something, not a claim about what role that person holds today.
    id: "staff-admin-1",
    name: "Chathuri Wijesinghe",
    initials: "CW",
    avatarUrl:
      "https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "chathuri.wijesinghe@example.lk",
    role: "module-admin",
    title: "Module operations lead",
    status: "active",
    createdOn: "2025-08-19",
    createdBy: "staff-super",
    lastActive: "2026-08-15",
    // Every module her own appointees write for - none overlapping
    // staff-moduleadmin-1's climate-vulnerability-assessment/green-buildings,
    // so the two module administrators' territory stays legible at a glance.
    moduleIds: [
      "provincial-adaptation-plan",
      "bankable-climate-finance-proposals",
      "gender-responsive-budgeting",
      "gender-social-inclusion",
    ],
  },
  {
    // "Learner support" already described exactly what a Provincial
    // Registrar does - day-to-day learner administration - so this account
    // became one outright rather than being retired and replaced.
    id: "staff-admin-2",
    name: "Dilan Fernando",
    initials: "DF",
    avatarUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "dilan.fernando@example.lk",
    role: "provincial-registrar",
    title: "Provincial Registrar, Eastern Province",
    status: "active",
    createdOn: "2025-11-06",
    createdBy: "staff-super",
    lastActive: "2026-08-14",
    province: "Eastern",
  },
  {
    // An account that exists but has never been used - kept invited, not
    // retired, so the team page still has a pending invitation to show for
    // one of the NEW roles too, not only ever for the old flat one.
    id: "staff-admin-3",
    name: "Ayesha Nazeer",
    initials: "AN",
    avatarUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "ayesha.nazeer@example.lk",
    role: "list-manager",
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
  {
    // The registrar viewpoint deliberately administers Southern Province -
    // the same province the demo learner (Nadeesha) belongs to, so signing
    // in as this account and opening the register shows the one learner the
    // client can cross-check against the student portal itself.
    id: "staff-registrar-1",
    name: "Nimal Gunawardena",
    initials: "NG",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "nimal.gunawardena@example.lk",
    role: "provincial-registrar",
    title: "Provincial Registrar, Southern Province",
    status: "active",
    createdOn: "2026-06-02",
    createdBy: "staff-super",
    lastActive: "2026-08-15",
    province: "Southern",
  },
  {
    // A second registrar sharing Southern Province's queue - FR-REG-010
    // assumes a province may be served by more than one registrar, sharing
    // one queue, and this is the record that makes that visible rather than
    // only asserted in a comment.
    id: "staff-registrar-2",
    name: "Kumari Abeywardena",
    initials: "KA",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "kumari.abeywardena@example.lk",
    role: "provincial-registrar",
    title: "Provincial Registrar, Southern Province",
    status: "active",
    createdOn: "2026-06-02",
    createdBy: "staff-super",
    lastActive: "2026-08-14",
    province: "Southern",
  },
  {
    // Western Province is the busiest in the sample data (see
    // `content/students.ts`), so this account gives the console a registrar
    // whose queue and register are not both nearly empty.
    id: "staff-registrar-3",
    name: "Sanjeewa Ilangakoon",
    initials: "SI",
    avatarUrl:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "sanjeewa.ilangakoon@example.lk",
    role: "provincial-registrar",
    title: "Provincial Registrar, Western Province",
    status: "active",
    createdOn: "2026-05-11",
    createdBy: "staff-super",
    lastActive: "2026-08-15",
    province: "Western",
  },
  {
    // One published module and one draft - the same "shows both states at
    // once" reasoning `SESSION.lecturer` already picked staff-inst-3 for,
    // reused here so the module-admin viewpoint has a publish/draft control
    // to actually exercise on sight rather than only on the second module
    // opened.
    id: "staff-moduleadmin-1",
    name: "Harsha Wickramasuriya",
    initials: "HW",
    avatarUrl:
      "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "harsha.wickramasuriya@example.lk",
    role: "module-admin",
    title: "Module Administrator",
    status: "active",
    createdOn: "2026-06-15",
    createdBy: "staff-super",
    lastActive: "2026-08-15",
    moduleIds: ["climate-vulnerability-assessment", "green-buildings"],
  },
  {
    id: "staff-lawsadmin-1",
    name: "Dilrukshi Fonseka",
    initials: "DF",
    avatarUrl:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "dilrukshi.fonseka@example.lk",
    role: "laws-admin",
    title: "Laws Administrator",
    status: "active",
    createdOn: "2026-07-01",
    createdBy: "staff-super",
    lastActive: "2026-08-15",
  },
  {
    id: "staff-toolsadmin-1",
    name: "Sampath Kodikara",
    initials: "SK",
    avatarUrl:
      "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "sampath.kodikara@example.lk",
    role: "tools-admin",
    title: "Tools Administrator",
    status: "active",
    createdOn: "2026-07-01",
    createdBy: "staff-super",
    lastActive: "2026-08-15",
  },
  {
    // Ayesha Nazeer (above) also holds this role but has never signed in -
    // the session needs an ACTIVE account to view the console as, so this is
    // a second, working List Manager rather than a repurposing of hers.
    id: "staff-listmanager-1",
    name: "Iresha Bandaranayake",
    initials: "IB",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    email: "iresha.bandaranayake@example.lk",
    role: "list-manager",
    title: "List Manager",
    status: "active",
    createdOn: "2026-07-15",
    createdBy: "staff-super",
    lastActive: "2026-08-15",
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
  // Anoma Herath rather than one of the single-module lecturers, because
  // this account exercises the console: two modules, one published and one
  // still a draft, and material on the shelf that nothing uses yet. A
  // lecturer with one finished module shows a console where every screen
  // is already green.
  lecturer: "staff-inst-3",
  // Southern Province, shared with a second registrar - so this viewpoint's
  // queue shows the "more than one registrar, one queue" shape FR-REG-010
  // assumes, and its register includes the demo learner (Nadeesha is also
  // Southern), the same "two sides of one person cannot disagree" reasoning
  // `demoLearnerRecord()` documents in `lib/admin.ts`.
  "provincial-registrar": "staff-registrar-1",
  // One published module (a lecturer roster, reviews, certificates already
  // in it) and one draft (nothing to moderate yet, a tag-editing form with
  // real content in it) - the same "don't pick the account where every
  // screen is already green" reasoning as `lecturer` above.
  "module-admin": "staff-moduleadmin-1",
  "laws-admin": "staff-lawsadmin-1",
  "tools-admin": "staff-toolsadmin-1",
  // Not Ayesha Nazeer - see the note on `staff-listmanager-1` above; the
  // session needs an account that has actually signed in at least once.
  "list-manager": "staff-listmanager-1",
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
  /**
   * Tags from the dynamic option lists (`content/tags.ts`) - what a Module
   * Administrator edits (FR-MODADM-020) and what `relatedPoolForModule()` in
   * `lib/laws-tools.ts` matches against. Carried HERE rather than read off
   * `content/site.ts`'s own `Module.hazardIds`/`categoryIds` at the point of
   * use, because a draft module (see `"green-buildings"` below) has no entry
   * in `content/site.ts` at all - it is not on the public catalogue yet - so
   * a lookup that only checked there would silently find nothing to tag a
   * draft module's related pool with, which is exactly the state a
   * newly-created Module is naturally in.
   */
  hazardIds: string[];
  categoryIds: string[];
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
    | "id"
    | "title"
    | "level"
    | "hours"
    | "lectureCount"
    | "status"
    | "hazardIds"
    | "categoryIds"
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
    hazardIds: mdl.hazardIds,
    categoryIds: mdl.categoryIds,
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
    // A draft's tags are exactly as real as a published module's - a Module
    // Administrator can tag a Module before it ever reaches the catalogue,
    // and its related pool of Laws/Tools already reflects that (see
    // `relatedPoolForModule()` in `lib/laws-tools.ts`). No category yet fits
    // "buildings" well - an empty list is the honest state, not a gap.
    hazardIds: ["extreme-heat"],
    categoryIds: [],
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
 * screen needs to show: three written, three not started.
 *
 * NO "IN REVIEW" STATE. There is nobody to review a lecture for - the
 * lecturer who wrote it is also the one who publishes it, so a lecture is
 * either still being written (`draft`, or `not-started` if nobody has
 * opened it yet) or `published`. See `lecture-editor.tsx`'s `StateControl`
 * for where that choice is made.
 */
export type DraftLecture = {
  id: string;
  number: string;
  title: string;
  state: "published" | "draft" | "not-started";
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
      state: "draft",
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
