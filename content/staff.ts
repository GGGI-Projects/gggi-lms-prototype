/**
 * The people who run the platform, and what each of them is allowed to touch.
 *
 * THREE ROLES, and the boundaries between them are the product rather than a
 * technicality:
 *
 *   super-admin  Owns the platform. The only role that can create or remove an
 *                administrator, and the only one that reads the audit log.
 *   admin        Runs the day to day - programmes, learners, instructors,
 *                moderation, certificates. Cannot make another admin.
 *   instructor   Writes the material, and only for the programmes they have
 *                been assigned. Sees learners as progress on their own
 *                programmes, never as a directory to browse.
 *
 * The rule that shapes the console is that ADMINS ARE APPOINTED, NOT
 * SELF-SERVED: an admin account exists because one specific person created it,
 * on a date, and that is recorded on the account itself (`createdBy`) rather
 * than only in the log. A console where you cannot see who let someone in is a
 * console where nobody is responsible for it.
 *
 * Nothing here is computed - `lib/admin.ts` derives every count, join and
 * permission check, so no screen works out an instructor's workload twice and
 * gets it slightly different the second time.
 */

import { PROGRAMMES } from "@/content/site";
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

export type StaffMember = {
  id: string;
  name: string;
  /** Two letters for the avatar - the prototype ships no photographs. */
  initials: string;
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
   * Instructors only: the programmes they may author modules for. An empty
   * array is a real and visible state - an instructor with nothing assigned
   * can sign in and has nothing to open, which is what the assignment screen
   * exists to fix.
   */
  programmeIds?: string[];
};

export const STAFF: StaffMember[] = [
  {
    id: "staff-super",
    name: "Ruwan Jayasuriya",
    initials: "RJ",
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
    email: "chathuri.wijesinghe@example.lk",
    role: "admin",
    title: "Programme operations lead",
    status: "active",
    createdOn: "2025-08-19",
    createdBy: "staff-super",
    lastActive: "2026-08-15",
  },
  {
    id: "staff-admin-2",
    name: "Dilan Fernando",
    initials: "DF",
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
    email: "malika.ratnayake@example.lk",
    role: "instructor",
    title: "Climate adaptation specialist",
    status: "active",
    createdOn: "2025-09-01",
    createdBy: "staff-super",
    lastActive: "2026-08-15",
    programmeIds: ["climate-resilience"],
  },
  {
    id: "staff-inst-2",
    name: "Suresh Kumaraswamy",
    initials: "SK",
    email: "suresh.kumaraswamy@example.lk",
    role: "instructor",
    title: "Solid waste engineer",
    status: "active",
    createdOn: "2025-09-01",
    createdBy: "staff-super",
    lastActive: "2026-08-13",
    programmeIds: ["circular-economy"],
  },
  {
    // Two programmes, one of them the unpublished draft. The instructors list
    // needs a row where the workload is not one programme, and the draft is
    // how the console shows work that is not public yet.
    id: "staff-inst-3",
    name: "Anoma Herath",
    initials: "AH",
    email: "anoma.herath@example.lk",
    role: "instructor",
    title: "Energy systems analyst",
    status: "active",
    createdOn: "2025-09-14",
    createdBy: "staff-admin-1",
    lastActive: "2026-08-15",
    programmeIds: ["sustainable-energy", "green-buildings"],
  },
  {
    id: "staff-inst-4",
    name: "Nuwan de Silva",
    initials: "ND",
    email: "nuwan.desilva@example.lk",
    role: "instructor",
    title: "Development finance economist",
    status: "active",
    createdOn: "2025-10-02",
    createdBy: "staff-admin-1",
    lastActive: "2026-08-09",
    programmeIds: ["green-finance"],
  },
  {
    id: "staff-inst-5",
    name: "Tharindu Bandara",
    initials: "TB",
    email: "tharindu.bandara@example.lk",
    role: "instructor",
    title: "Transport planner",
    status: "active",
    createdOn: "2026-01-19",
    createdBy: "staff-admin-1",
    lastActive: "2026-07-30",
    programmeIds: ["mobility-landscapes"],
  },
  {
    // Appointed, never assigned. The instructor console has to have something
    // honest to show someone in exactly this position.
    id: "staff-inst-6",
    name: "Fathima Rizwan",
    initials: "FR",
    email: "fathima.rizwan@example.lk",
    role: "instructor",
    title: "Coastal ecosystems researcher",
    status: "invited",
    createdOn: "2026-08-12",
    createdBy: "staff-admin-1",
    lastActive: null,
    programmeIds: [],
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
  // Anoma Herath rather than one of the single-programme instructors, because
  // this account exercises the console: two programmes, one published and one
  // still a draft, a module in review, and material on the shelf that nothing
  // uses yet. An instructor with one finished programme shows a console where
  // every screen is already green.
  instructor: "staff-inst-3",
};

/* ------------------------------------------------------------- programmes */

export type ProgrammeStatus = "published" | "draft";

export type ManagedProgramme = {
  id: string;
  title: string;
  status: ProgrammeStatus;
  level: string;
  hours: number;
  /** Modules that exist, whether or not they are finished. */
  moduleCount: number;
  /** Of those, how many are published to learners. */
  publishedModules: number;
  instructorIds: string[];
  enrolments: number;
  completions: number;
  /** Mean quiz score across the programme, as a percentage. */
  averageScore: number;
  /** Out of 5, from published reviews only. */
  rating: number;
  reviewCount: number;
  createdOn: string;
  updatedOn: string;
};

/**
 * The five public programmes plus one that is not public yet.
 *
 * The five are BUILT FROM `content/site.ts` rather than retyped, so a title or
 * a module count cannot say one thing on the marketing page and another in the
 * console. Only the operational numbers - enrolments, ratings, who teaches it -
 * are authored here, because nothing on the public site knows about them.
 */
const catalogue = (
  id: string,
  operational: Omit<
    ManagedProgramme,
    "id" | "title" | "level" | "hours" | "moduleCount" | "status"
  >,
): ManagedProgramme => {
  const programme = PROGRAMMES.find((entry) => entry.id === id);
  if (!programme) throw new Error(`[staff] unknown programme: ${id}`);

  return {
    id,
    title: programme.title,
    status: "published",
    level: programme.level,
    hours: programme.hours,
    moduleCount: programme.modules,
    ...operational,
  };
};

export const MANAGED_PROGRAMMES: ManagedProgramme[] = [
  catalogue("climate-resilience", {
    publishedModules: 9,
    instructorIds: ["staff-inst-1"],
    enrolments: 612,
    completions: 104,
    averageScore: 84,
    rating: 4.7,
    reviewCount: 96,
    createdOn: "2025-09-08",
    updatedOn: "2026-08-04",
  }),
  catalogue("circular-economy", {
    publishedModules: 8,
    instructorIds: ["staff-inst-2"],
    enrolments: 468,
    completions: 87,
    averageScore: 86,
    rating: 4.6,
    reviewCount: 71,
    createdOn: "2025-09-08",
    updatedOn: "2026-07-22",
  }),
  catalogue("sustainable-energy", {
    publishedModules: 10,
    instructorIds: ["staff-inst-3"],
    enrolments: 431,
    completions: 63,
    averageScore: 81,
    rating: 4.5,
    reviewCount: 58,
    createdOn: "2025-10-13",
    updatedOn: "2026-08-11",
  }),
  catalogue("green-finance", {
    publishedModules: 8,
    instructorIds: ["staff-inst-4"],
    enrolments: 342,
    completions: 41,
    averageScore: 78,
    rating: 4.4,
    reviewCount: 39,
    createdOn: "2025-11-24",
    updatedOn: "2026-06-30",
  }),
  catalogue("mobility-landscapes", {
    publishedModules: 7,
    instructorIds: ["staff-inst-5"],
    enrolments: 260,
    completions: 19,
    averageScore: 80,
    rating: 4.6,
    reviewCount: 24,
    createdOn: "2026-02-09",
    updatedOn: "2026-08-13",
  }),
  {
    // Not on the public site, and that is the point: the programmes screen has
    // to be able to show work in progress. Two of its six modules are written.
    id: "green-buildings",
    title: "Green Buildings & Efficient Cooling",
    status: "draft",
    level: "Foundation",
    hours: 5,
    moduleCount: 6,
    publishedModules: 0,
    instructorIds: ["staff-inst-3"],
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
 * The draft programme's module list.
 *
 * The five published programmes get their modules from `content/curriculum.ts`
 * - the same 42 the learner reads. A draft has no learner-facing content yet,
 * so its modules exist only as a plan, which is exactly what an authoring
 * screen needs to show: two written, one in review, three not started.
 */
export type DraftModule = {
  id: string;
  number: string;
  title: string;
  state: "published" | "in-review" | "draft" | "not-started";
  updatedOn: string | null;
};

export const DRAFT_MODULES: Record<string, DraftModule[]> = {
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
 * Editorial state for the modules that ARE published.
 *
 * Keyed by module id. Anything missing is treated as published and untouched
 * since launch by `lib/admin.ts` - authoring an entry for all 42 would be 42
 * lines saying the same thing.
 */
export const MODULE_EDITS: Record<
  string,
  { state: DraftModule["state"]; updatedOn: string; authorId: string }
> = {
  // The two most recently worked-on modules on the platform, so the
  // dashboards have something true to point at.
  "solar-wind-and-what-they-need": {
    state: "published",
    updatedOn: "2026-08-11",
    authorId: "staff-inst-3",
  },
  "walking-cycling-first-mile": {
    state: "published",
    updatedOn: "2026-08-13",
    authorId: "staff-inst-5",
  },
  "inside-the-national-adaptation-plan": {
    state: "published",
    updatedOn: "2026-08-04",
    authorId: "staff-inst-1",
  },
};
