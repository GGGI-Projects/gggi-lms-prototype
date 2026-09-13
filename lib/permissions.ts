/**
 * Who may do what.
 *
 * ITS OWN FILE, WITH NO DATA IMPORTS, and that is the whole reason it is not
 * part of `lib/admin.ts`. The permission check runs in the browser - the
 * padlocks in the rail, the disabled controls, the restricted screens are all
 * client components - and `lib/admin.ts` reaches the entire curriculum, the
 * learner register and every operations table. Importing `can()` from there
 * would ship all of it to the browser to decide whether to grey out a button.
 * The only import here is a type, which erases at compile time.
 *
 * `lib/admin.ts` re-exports everything below, so server code has one import
 * and never has to know this split exists.
 */

/**
 * SEVEN ROLES: six scoped console roles plus Lecturer (docs/SRS.md §1.2,
 * BR-31) - THE OLD FLAT `admin` ROLE NO LONGER EXISTS. It was retired in the
 * same pass that built the last of the six scoped roles below, once every one
 * of its old responsibilities had somewhere real to go (see the per-capability
 * notes further down, and `content/staff.ts`'s three former `admin` accounts,
 * each now reassigned to the scoped role its actual work already matched).
 *
 *   super-admin           Owns the platform. The only role that can appoint
 *                         any other console role, and the only one that reads
 *                         the audit log.
 *   module-admin          Runs one Module (or several - Appendix D, item 9)
 *                         day to day: its lecturer roster, its own details and
 *                         tags, its publish state, and its own reviews and
 *                         certificates (§4.29).
 *   laws-admin            Keeps the Law library current, platform-wide.
 *                         Touches no Module, lecturer or learner (§4.30).
 *   tools-admin           Keeps the Tool directory current, platform-wide.
 *                         Touches no Module, lecturer or learner (§4.31).
 *   list-manager          Maintains the dynamic option lists (Hazards,
 *                         Categories, and any added later) that tag Modules,
 *                         Laws and Tools (§4.32).
 *   provincial-registrar  Reviews registration applications for one province,
 *                         and administers that province's learners once
 *                         approved (§4.33).
 *   lecturer              Writes the material, and only for the modules they
 *                         have been assigned.
 *
 * They live here rather than with the staff records because a role is a
 * permission concept, not a person - and because the padlocks, the restricted
 * screens and the viewpoint switcher all need the name of a role in the
 * browser. `content/staff.ts` imports the type from here and re-exports it, so
 * nothing outside this file has to know which way the dependency runs.
 */
export type StaffRole =
  | "super-admin"
  | "module-admin"
  | "laws-admin"
  | "tools-admin"
  | "list-manager"
  | "provincial-registrar"
  | "lecturer";

/** Titles as they appear in the interface. Never abbreviated on screen. */
export const ROLE_LABEL: Record<StaffRole, string> = {
  "super-admin": "Super administrator",
  "module-admin": "Module administrator",
  "laws-admin": "Laws administrator",
  "tools-admin": "Tools administrator",
  "list-manager": "List manager",
  "provincial-registrar": "Provincial registrar",
  lecturer: "Lecturer",
};

/** One line each, for the role switcher and the administrators page. */
export const ROLE_SUMMARY: Record<StaffRole, string> = {
  "super-admin":
    "Full access, including appointing every other console role, the audit log and platform settings.",
  "module-admin":
    "Runs one Module day to day - its lecturer roster, details, tags, publish state, and its own reviews and certificates.",
  "laws-admin":
    "Adds, edits and publishes the Law library. Touches no Module, lecturer or learner.",
  "tools-admin":
    "Adds, edits and publishes the Tool directory. Touches no Module, lecturer or learner.",
  "list-manager":
    "Adds, renames and retires the values in every dynamic option list that tags Modules, Laws and Tools.",
  "provincial-registrar":
    "Approves or rejects that province's registration applications, and administers the learners it lets in.",
  lecturer:
    "Writes and edits lectures for assigned modules, and sees how learners are doing on them.",
};

/**
 * Every gated action on the platform, named after what it does rather than
 * after the screen it appears on. A capability called `viewTeamPage` would
 * have to be renamed the first time the page moved.
 *
 * `manageAdmins` and `readAuditLog` are the super administrator's alone - a
 * log that the people it records can edit their way out of is not a log.
 *
 * `manageModuleDetails` and `manageModuleLecturers` are `manageModules` and
 * `manageLecturers` SPLIT, NOT RENAMED, and the split is the point: a Module
 * Administrator may run their own Module's details/tags/publish-state and
 * invite or assign a lecturer onto it, but must never be able to suspend a
 * lecturer's whole account (that can be shared across several Module
 * Administrators' modules at once - BR-29) or create a brand new Module
 * platform-wide (FR-ADM-060). The old, broader `manageModules`/
 * `manageLecturers` stay exactly what they were - Super-Administrator powers
 * spanning every Module - so neither capability had to be renamed out from
 * under the screens already gated on it.
 */
export type Capability =
  | "viewConsole"
  | "manageAdmins"
  | "readAuditLog"
  | "managePlatformSettings"
  | "manageModules"
  | "manageModuleDetails"
  | "manageLecturers"
  | "manageModuleLecturers"
  | "assignModules"
  | "viewAllLearners"
  | "manageLearners"
  | "moderateReviews"
  | "manageCertificates"
  | "authorLectures"
  | "viewAssignedLearners"
  | "manageLaws"
  | "manageTools"
  | "manageOptionLists"
  | "manageApplications";

const CAPABILITIES: Record<StaffRole, Capability[]> = {
  "super-admin": [
    "viewConsole",
    "manageAdmins",
    "readAuditLog",
    "managePlatformSettings",
    "manageModules",
    "manageModuleDetails",
    "manageLecturers",
    "manageModuleLecturers",
    "assignModules",
    "viewAllLearners",
    "manageLearners",
    "moderateReviews",
    "manageCertificates",
    "authorLectures",
    "viewAssignedLearners",
    "manageLaws",
    "manageTools",
    "manageOptionLists",
    "manageApplications",
  ],
  "module-admin": [
    "viewConsole",
    "manageModuleDetails",
    "manageModuleLecturers",
    "moderateReviews",
    "manageCertificates",
  ],
  "laws-admin": ["viewConsole", "manageLaws"],
  "tools-admin": ["viewConsole", "manageTools"],
  "list-manager": ["viewConsole", "manageOptionLists"],
  "provincial-registrar": ["viewConsole", "manageApplications", "manageLearners"],
  lecturer: ["viewConsole", "authorLectures", "viewAssignedLearners"],
};

export function can(role: StaffRole, capability: Capability): boolean {
  return CAPABILITIES[role].includes(capability);
}

/**
 * Why a role cannot do something, in the words the screen will use.
 *
 * Kept next to `can()` so a refusal and its explanation are written together -
 * a disabled control with no reason beside it reads as a broken control.
 */
export const RESTRICTION: Partial<Record<Capability, string>> = {
  manageAdmins:
    "Only the super administrator can appoint, suspend or remove any other console role.",
  readAuditLog:
    "The audit log is restricted to the super administrator, so that the people it records cannot edit their own trail.",
  managePlatformSettings:
    "Platform settings are set by the super administrator. Every other role can read them.",
  manageModules:
    "Only the super administrator can create a new module. Running one day to day belongs to that module's own module administrator.",
  manageModuleDetails:
    "A module's own details, tags and publish state are managed by its module administrator, or the super administrator.",
  manageLecturers:
    "Only the super administrator can appoint a lecturer platform-wide, or suspend and restore a lecturer's whole account.",
  manageModuleLecturers:
    "Only that module's own module administrator, or the super administrator, may invite, assign or remove a lecturer on this module.",
  assignModules:
    "Only the super administrator can change which modules a lecturer may write for, platform-wide. A module administrator assigns lecturers from their own module's page instead.",
  manageLearners:
    "A learner's account is administered by their own province's provincial registrar, or the super administrator for National / Head Office.",
  moderateReviews:
    "A module's reviews are moderated by that module's own module administrator, or the super administrator. A lecturer's own profile reviews are moderated by the super administrator alone.",
  manageCertificates:
    "A certificate is withdrawn by its own module's module administrator, or the super administrator, as a documented exception.",
  authorLectures:
    "Lectures are written by the lecturers assigned to the module.",
  manageLaws: "The Law library is managed by the laws administrator.",
  manageTools: "The Tool directory is managed by the tools administrator.",
  manageOptionLists:
    "The dynamic option lists are managed by the list manager. The client has flagged this role as possibly unnecessary on its own - see docs/SRS.md Appendix D.",
  manageApplications:
    "Registration applications are reviewed by that province's provincial registrar, or the super administrator for a National / Head Office applicant.",
};
