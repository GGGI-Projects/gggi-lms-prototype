/**
 * Registration applications - what a prospective learner submits in place of
 * the old instant sign-up (docs/SRS.md §4.2).
 *
 * SIX FIELDS ON THE FORM, PER FR-AUTH-010: full name, email, a password (never
 * held here - this is an admin-facing record, not the credential store),
 * a required Province, an optional "where you work" sector, and a tick-box
 * agreeing to terms. Notably absent: district. The old learner record asks for
 * one (`content/students.ts`); the registration form itself never did, and
 * this type follows the form, not the record an approved application becomes.
 *
 * PENDING UNTIL A HUMAN DECIDES, routed by province (FR-AUTH-015): a specific
 * province goes to that province's Provincial Registrar(s) - see the shared
 * Southern Province queue below, `staff-registrar-1` and `staff-registrar-2`
 * both administer it (FR-REG-010) - and "National / Head Office" goes to the
 * Super Administrator directly (FR-REG-040). `decidedBy` records which one
 * actually acted, the same "who let someone in" accountability
 * `content/staff.ts`'s `createdBy` already keeps for staff accounts.
 *
 * DATES SIT ON OR BEFORE 15 AUGUST 2026 - this platform's fixed "today" (see
 * `content/comms.ts`'s note on `isNew`/`unreadFor`). A decision dated after
 * that, or a pending application submitted after it, would read as the
 * console knowing something that has not happened yet.
 */

import type { LearnerProvince } from "@/content/laws";
import { SECTORS } from "@/content/students";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type RegistrationApplication = {
  id: string;
  name: string;
  email: string;
  province: LearnerProvince;
  /** Optional on the form itself (FR-AUTH-010) - some applicants leave it
   *  blank, which is a real and permitted state, not missing data. */
  sector?: (typeof SECTORS)[number];
  submittedOn: string;
  status: ApplicationStatus;
  /** Set once a registrar (or the Super Administrator) has decided it. */
  decidedOn?: string;
  /** Staff id of whoever decided it. */
  decidedBy?: string;
  /** Set only when rejected - the reason FR-AUTH-025 lets the applicant read
   *  and fix before resubmitting. */
  reason?: string;
};

export const APPLICATIONS: RegistrationApplication[] = [
  // ------------------------------------------------------- Southern Province
  // Shared by staff-registrar-1 and staff-registrar-2 - one queue, two people.
  {
    id: "app-3001",
    name: "Chamodi Peiris",
    email: "chamodi.peiris@example.lk",
    province: "Southern",
    sector: "Government or public sector",
    submittedOn: "2026-08-13",
    status: "pending",
  },
  {
    id: "app-3002",
    name: "Ruwantha Gamage",
    email: "ruwantha.gamage@example.lk",
    province: "Southern",
    sector: "University or school",
    submittedOn: "2026-08-14",
    status: "pending",
  },
  {
    id: "app-3003",
    name: "Sithumini Wickramaratne",
    email: "sithumini.w@example.lk",
    province: "Southern",
    submittedOn: "2026-08-11",
    status: "pending",
  },
  {
    id: "app-3004",
    name: "Lakruwan Rodrigo",
    email: "lakruwan.rodrigo@example.lk",
    province: "Southern",
    sector: "Provincial or local authority",
    submittedOn: "2026-08-04",
    status: "approved",
    decidedOn: "2026-08-05",
    decidedBy: "staff-registrar-1",
  },
  {
    id: "app-3005",
    name: "Nadeesha Kularatne",
    email: "nadeesha.kularatne@example.lk",
    province: "Southern",
    sector: "NGO or development organisation",
    submittedOn: "2026-08-06",
    status: "approved",
    decidedOn: "2026-08-07",
    decidedBy: "staff-registrar-2",
  },
  {
    id: "app-3006",
    name: "Buddhika Senanayake",
    email: "buddhika.s@gmail.com",
    province: "Southern",
    sector: "Private sector",
    submittedOn: "2026-08-02",
    status: "rejected",
    decidedOn: "2026-08-03",
    decidedBy: "staff-registrar-1",
    reason:
      "Work email address could not be confirmed as a ministry or provincial address - please reapply from your official email.",
  },
  {
    id: "app-3007",
    name: "Ishini Madhurangi",
    email: "ishini.madhurangi@example.lk",
    province: "Southern",
    submittedOn: "2026-07-30",
    status: "rejected",
    decidedOn: "2026-08-01",
    decidedBy: "staff-registrar-2",
    reason:
      "Name did not match the certificate name given lower down the same form - please resubmit with both fields matching.",
  },

  // -------------------------------------------------------- Western Province
  {
    id: "app-3008",
    name: "Yasodha Karunaratne",
    email: "yasodha.k@example.lk",
    province: "Western",
    sector: "Government or public sector",
    submittedOn: "2026-08-12",
    status: "pending",
  },
  {
    id: "app-3009",
    name: "Chinthaka Mendis",
    email: "chinthaka.mendis@example.lk",
    province: "Western",
    sector: "Private sector",
    submittedOn: "2026-08-15",
    status: "pending",
  },
  {
    id: "app-3010",
    name: "Piumi Abeysekera",
    email: "piumi.abeysekera@example.lk",
    province: "Western",
    submittedOn: "2026-08-01",
    status: "approved",
    decidedOn: "2026-08-02",
    decidedBy: "staff-registrar-3",
  },
  {
    id: "app-3011",
    name: "Roshan Dassanayake",
    email: "roshan.dassanayake@example.lk",
    province: "Western",
    sector: "University or school",
    submittedOn: "2026-07-29",
    status: "rejected",
    decidedOn: "2026-07-31",
    decidedBy: "staff-registrar-3",
    reason:
      "Terms and privacy notice were left unticked on the copy received - please resubmit with the agreement checked.",
  },

  // ------------------------------------------------------- Other provinces
  {
    id: "app-3012",
    name: "Tharaka Wijeratne",
    email: "tharaka.wijeratne@example.lk",
    province: "Central",
    sector: "Provincial or local authority",
    submittedOn: "2026-08-10",
    status: "pending",
  },
  {
    id: "app-3013",
    name: "Vishwa Herath",
    email: "vishwa.herath@example.lk",
    province: "Uva",
    submittedOn: "2026-08-09",
    status: "pending",
  },
  {
    id: "app-3014",
    name: "Kalaivani Sivakumar",
    email: "kalaivani.sivakumar@example.lk",
    province: "Northern",
    sector: "NGO or development organisation",
    submittedOn: "2026-08-08",
    status: "pending",
  },

  // ---------------------------------------------- National / Head Office
  // Routed to the Super Administrator directly, not to any province's queue
  // (FR-REG-040).
  {
    id: "app-3015",
    name: "Manoj Amarasinghe",
    email: "manoj.amarasinghe@example.lk",
    province: "National / Head Office",
    sector: "Government or public sector",
    submittedOn: "2026-08-13",
    status: "pending",
  },
  {
    id: "app-3016",
    name: "Rashmi Gunasekara",
    email: "rashmi.gunasekara@example.lk",
    province: "National / Head Office",
    sector: "Government or public sector",
    submittedOn: "2026-08-01",
    status: "approved",
    decidedOn: "2026-08-02",
    decidedBy: "staff-super",
  },
];
