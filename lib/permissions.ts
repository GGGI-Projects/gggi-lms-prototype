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
 * The three roles, and what each is called on screen.
 *
 * They live here rather than with the staff records because a role is a
 * permission concept, not a person - and because the padlocks, the restricted
 * screens and the viewpoint switcher all need the name of a role in the
 * browser. `content/staff.ts` imports the type from here and re-exports it, so
 * nothing outside this file has to know which way the dependency runs.
 */
export type StaffRole = "super-admin" | "admin" | "lecturer";

/** Titles as they appear in the interface. Never abbreviated on screen. */
export const ROLE_LABEL: Record<StaffRole, string> = {
  "super-admin": "Super administrator",
  admin: "Administrator",
  lecturer: "Lecturer",
};

/** One line each, for the role switcher and the administrators page. */
export const ROLE_SUMMARY: Record<StaffRole, string> = {
  "super-admin":
    "Full access, including administrator accounts, the audit log and platform settings.",
  admin:
    "Modules, learners, lecturers, moderation and certificates. Cannot create administrators.",
  lecturer:
    "Writes and edits lectures for assigned modules, and sees how learners are doing on them.",
};

/**
 * Every gated action on the platform, named after what it does rather than
 * after the screen it appears on. A capability called `viewTeamPage` would
 * have to be renamed the first time the page moved.
 *
 * Two of these are the whole reason the roles exist: `manageAdmins` is the
 * super administrator's alone, and `readAuditLog` with it - a log that the
 * people it records can edit their way out of is not a log.
 */
export type Capability =
  | "viewConsole"
  | "manageAdmins"
  | "readAuditLog"
  | "managePlatformSettings"
  | "manageModules"
  | "manageLecturers"
  | "assignModules"
  | "viewAllLearners"
  | "manageLearners"
  | "moderateReviews"
  | "manageCertificates"
  | "authorLectures"
  | "viewAssignedLearners";

const CAPABILITIES: Record<StaffRole, Capability[]> = {
  "super-admin": [
    "viewConsole",
    "manageAdmins",
    "readAuditLog",
    "managePlatformSettings",
    "manageModules",
    "manageLecturers",
    "assignModules",
    "viewAllLearners",
    "manageLearners",
    "moderateReviews",
    "manageCertificates",
    "authorLectures",
    "viewAssignedLearners",
  ],
  admin: [
    "viewConsole",
    "manageModules",
    "manageLecturers",
    "assignModules",
    "viewAllLearners",
    "manageLearners",
    "moderateReviews",
    "manageCertificates",
    "viewAssignedLearners",
  ],
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
    "Only the super administrator can create, suspend or remove administrator accounts.",
  readAuditLog:
    "The audit log is restricted to the super administrator, so that the people it records cannot edit their own trail.",
  managePlatformSettings:
    "Platform settings are set by the super administrator. Administrators can read them.",
  manageModules:
    "Modules are created and published by administrators. Lecturers write the lectures inside them.",
  manageLecturers:
    "Only an administrator can appoint or suspend a lecturer.",
  assignModules:
    "Only an administrator can change which modules a lecturer may write for.",
  manageLearners:
    "Learner accounts are managed by administrators.",
  moderateReviews: "Reviews are moderated by administrators.",
  manageCertificates: "Certificates are managed by administrators.",
  authorLectures:
    "Lectures are written by the lecturers assigned to the module.",
};
