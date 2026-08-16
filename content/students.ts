/**
 * The learner register, as an administrator sees it.
 *
 * ONE PAGE OF A LARGER REGISTER. The platform has 1,247 learners
 * (`PLATFORM.learners` in `content/operations.ts`); what is authored here is a
 * sample of the most recent registrations, which is what the students screen
 * shows before its pagination. Writing 1,247 records would not make the screen
 * any more true - it would make the totals harder to keep honest, because they
 * would then be two sources for the same number. The list is the sample; the
 * totals are the platform's own.
 *
 * The demo learner is NOT in this file. `lib/admin.ts` derives her record from
 * `content/portal.ts`, so the row an administrator opens and the dashboard she
 * signs into cannot disagree about how many lectures she has finished.
 *
 * Names, emails and districts are invented. Nothing here is a real person.
 */

export type StudentStatus = "active" | "dormant" | "suspended";

export type StudentEnrolment = {
  moduleId: string;
  enrolledOn: string;
  /** Lectures finished, out of the module's own count. */
  lecturesDone: number;
  /** Mean quiz score so far, or null if no quiz has been attempted. */
  averageScore: number | null;
  /** Set once the module is finished and the certificate has issued. */
  certificateRef?: string;
};

export type StudentRecord = {
  id: string;
  name: string;
  initials: string;
  email: string;
  district: string;
  sector: string;
  organisation: string;
  joined: string;
  /** ISO date of the last sign-in. */
  lastActive: string;
  status: StudentStatus;
  enrolments: StudentEnrolment[];
};

/**
 * Sector labels come from the sign-up form's list, unchanged. An admin filter
 * that offers categories the form never collected filters nothing.
 */
export const SECTORS = [
  "Government or public sector",
  "Provincial or local authority",
  "Private sector",
  "NGO or development organisation",
  "University or school",
  "Something else",
] as const;

export const STUDENTS: StudentRecord[] = [
  {
    id: "stu-2041",
    name: "Ishara Wickramasinghe",
    initials: "IW",
    email: "ishara.w@example.lk",
    district: "Colombo",
    sector: "Government or public sector",
    organisation: "Ministry of Environment",
    joined: "2026-08-14",
    lastActive: "2026-08-15",
    status: "active",
    enrolments: [
      {
        moduleId: "climate-vulnerability-assessment",
        enrolledOn: "2026-08-14",
        lecturesDone: 1,
        averageScore: 100,
      },
    ],
  },
  {
    id: "stu-2040",
    name: "Kasun Ekanayake",
    initials: "KE",
    email: "kasun.ekanayake@example.lk",
    district: "Kandy",
    sector: "Provincial or local authority",
    organisation: "Central Provincial Council",
    joined: "2026-08-13",
    lastActive: "2026-08-15",
    status: "active",
    enrolments: [
      {
        moduleId: "provincial-adaptation-plan",
        enrolledOn: "2026-08-13",
        lecturesDone: 3,
        averageScore: 83,
      },
      {
        moduleId: "climate-vulnerability-assessment",
        enrolledOn: "2026-08-14",
        lecturesDone: 0,
        averageScore: null,
      },
    ],
  },
  {
    id: "stu-2039",
    name: "Fathima Ashraff",
    initials: "FA",
    email: "fathima.ashraff@example.lk",
    district: "Batticaloa",
    sector: "NGO or development organisation",
    organisation: "Eastern Coastal Trust",
    joined: "2026-08-12",
    lastActive: "2026-08-14",
    status: "active",
    enrolments: [
      {
        moduleId: "gender-responsive-budgeting",
        enrolledOn: "2026-08-12",
        lecturesDone: 2,
        averageScore: 75,
      },
    ],
  },
  {
    id: "stu-2038",
    name: "Dinesh Rajapaksha",
    initials: "DR",
    email: "dinesh.rajapaksha@example.lk",
    district: "Gampaha",
    sector: "Private sector",
    organisation: "Lanka Cement Works",
    joined: "2026-08-11",
    lastActive: "2026-08-12",
    status: "active",
    enrolments: [
      {
        moduleId: "bankable-climate-finance-proposals",
        enrolledOn: "2026-08-11",
        lecturesDone: 4,
        averageScore: 88,
      },
    ],
  },
  {
    id: "stu-2037",
    name: "Sanduni Alwis",
    initials: "SA",
    email: "sanduni.alwis@example.lk",
    district: "Colombo",
    sector: "University or school",
    organisation: "University of Moratuwa",
    joined: "2026-08-10",
    lastActive: "2026-08-15",
    status: "active",
    enrolments: [
      {
        moduleId: "gender-social-inclusion",
        enrolledOn: "2026-08-10",
        lecturesDone: 6,
        averageScore: 92,
      },
      {
        moduleId: "bankable-climate-finance-proposals",
        enrolledOn: "2026-08-11",
        lecturesDone: 2,
        averageScore: 75,
      },
    ],
  },
  {
    id: "stu-2036",
    name: "Mohamed Rizvi",
    initials: "MR",
    email: "mohamed.rizvi@example.lk",
    district: "Puttalam",
    sector: "Provincial or local authority",
    organisation: "Puttalam Urban Council",
    joined: "2026-08-08",
    lastActive: "2026-08-09",
    status: "active",
    enrolments: [
      {
        moduleId: "provincial-adaptation-plan",
        enrolledOn: "2026-08-08",
        lecturesDone: 5,
        averageScore: 80,
      },
    ],
  },
  {
    id: "stu-2035",
    name: "Piyumi Gunasekara",
    initials: "PG",
    email: "piyumi.g@example.lk",
    district: "Galle",
    sector: "Government or public sector",
    organisation: "Coast Conservation Department",
    joined: "2026-08-06",
    lastActive: "2026-08-14",
    status: "active",
    enrolments: [
      {
        moduleId: "climate-vulnerability-assessment",
        enrolledOn: "2026-08-06",
        lecturesDone: 8,
        averageScore: 89,
        certificateRef: "GP-2026-CV-05902",
      },
      {
        moduleId: "gender-responsive-budgeting",
        enrolledOn: "2026-08-13",
        lecturesDone: 1,
        averageScore: 100,
      },
    ],
  },
  {
    id: "stu-2034",
    name: "Thilina Perera",
    initials: "TP",
    email: "thilina.perera@example.lk",
    district: "Kurunegala",
    sector: "Government or public sector",
    organisation: "District Secretariat, Kurunegala",
    joined: "2026-08-04",
    lastActive: "2026-08-05",
    status: "active",
    enrolments: [
      {
        moduleId: "climate-vulnerability-assessment",
        enrolledOn: "2026-08-04",
        lecturesDone: 2,
        averageScore: 63,
      },
    ],
  },
  {
    id: "stu-2033",
    name: "Nirosha Silva",
    initials: "NS",
    email: "nirosha.silva@example.lk",
    district: "Matara",
    sector: "University or school",
    organisation: "University of Ruhuna",
    joined: "2026-08-02",
    lastActive: "2026-08-15",
    status: "active",
    enrolments: [
      {
        moduleId: "gender-social-inclusion",
        enrolledOn: "2026-08-02",
        lecturesDone: 7,
        averageScore: 94,
        certificateRef: "GP-2026-GS-05877",
      },
    ],
  },
  {
    id: "stu-2032",
    name: "Ahamed Naushad",
    initials: "AN",
    email: "ahamed.naushad@example.lk",
    district: "Ampara",
    sector: "Provincial or local authority",
    organisation: "Ampara Pradeshiya Sabha",
    joined: "2026-07-31",
    lastActive: "2026-08-01",
    status: "active",
    enrolments: [
      {
        moduleId: "provincial-adaptation-plan",
        enrolledOn: "2026-07-31",
        lecturesDone: 1,
        averageScore: null,
      },
    ],
  },
  {
    id: "stu-2031",
    name: "Chamodi Jayawardena",
    initials: "CJ",
    email: "chamodi.j@example.lk",
    district: "Colombo",
    sector: "Private sector",
    organisation: "Ceylon Green Advisory",
    joined: "2026-07-29",
    lastActive: "2026-08-13",
    status: "active",
    enrolments: [
      {
        moduleId: "gender-social-inclusion",
        enrolledOn: "2026-07-29",
        lecturesDone: 5,
        averageScore: 85,
      },
      {
        moduleId: "climate-vulnerability-assessment",
        enrolledOn: "2026-08-02",
        lecturesDone: 3,
        averageScore: 92,
      },
    ],
  },
  {
    id: "stu-2030",
    name: "Ruwanthi Dias",
    initials: "RD",
    email: "ruwanthi.dias@example.lk",
    district: "Nuwara Eliya",
    sector: "NGO or development organisation",
    organisation: "Highlands Water Forum",
    joined: "2026-07-27",
    lastActive: "2026-07-28",
    status: "dormant",
    enrolments: [
      {
        moduleId: "climate-vulnerability-assessment",
        enrolledOn: "2026-07-27",
        lecturesDone: 0,
        averageScore: null,
      },
    ],
  },
  {
    id: "stu-2029",
    name: "Buddhika Senanayake",
    initials: "BS",
    email: "buddhika.s@example.lk",
    district: "Anuradhapura",
    sector: "Government or public sector",
    organisation: "Department of Agriculture",
    joined: "2026-07-24",
    lastActive: "2026-08-10",
    status: "active",
    enrolments: [
      {
        moduleId: "bankable-climate-finance-proposals",
        enrolledOn: "2026-07-24",
        lecturesDone: 7,
        averageScore: 79,
      },
    ],
  },
  {
    id: "stu-2028",
    name: "Shanika Rodrigo",
    initials: "SR",
    email: "shanika.rodrigo@example.lk",
    district: "Gampaha",
    sector: "Private sector",
    organisation: "Negombo Logistics",
    joined: "2026-07-21",
    lastActive: "2026-08-15",
    status: "active",
    enrolments: [
      {
        moduleId: "gender-responsive-budgeting",
        enrolledOn: "2026-07-21",
        lecturesDone: 7,
        averageScore: 82,
        certificateRef: "GP-2026-GB-05771",
      },
      {
        moduleId: "provincial-adaptation-plan",
        enrolledOn: "2026-08-04",
        lecturesDone: 2,
        averageScore: 75,
      },
    ],
  },
  {
    id: "stu-2027",
    name: "Janaka Bandaranayake",
    initials: "JB",
    email: "janaka.b@example.lk",
    district: "Badulla",
    sector: "Provincial or local authority",
    organisation: "Uva Provincial Council",
    joined: "2026-07-18",
    lastActive: "2026-07-19",
    status: "dormant",
    enrolments: [],
  },
  {
    id: "stu-2026",
    name: "Vithya Sivanathan",
    initials: "VS",
    email: "vithya.s@example.lk",
    district: "Jaffna",
    sector: "University or school",
    organisation: "University of Jaffna",
    joined: "2026-07-15",
    lastActive: "2026-08-14",
    status: "active",
    enrolments: [
      {
        moduleId: "climate-vulnerability-assessment",
        enrolledOn: "2026-07-15",
        lecturesDone: 6,
        averageScore: 91,
      },
      {
        moduleId: "gender-social-inclusion",
        enrolledOn: "2026-07-30",
        lecturesDone: 2,
        averageScore: 75,
      },
    ],
  },
  {
    id: "stu-2025",
    name: "Roshan Peiris",
    initials: "RP",
    email: "roshan.peiris@example.lk",
    district: "Colombo",
    sector: "Government or public sector",
    organisation: "Urban Development Authority",
    joined: "2026-07-12",
    lastActive: "2026-08-12",
    status: "active",
    enrolments: [
      {
        moduleId: "gender-responsive-budgeting",
        enrolledOn: "2026-07-12",
        lecturesDone: 4,
        averageScore: 81,
      },
    ],
  },
  {
    id: "stu-2024",
    name: "Amali Fonseka",
    initials: "AF",
    email: "amali.fonseka@example.lk",
    district: "Kalutara",
    sector: "NGO or development organisation",
    organisation: "Southern Livelihoods Network",
    joined: "2026-07-09",
    lastActive: "2026-08-15",
    status: "active",
    enrolments: [
      {
        moduleId: "provincial-adaptation-plan",
        enrolledOn: "2026-07-09",
        lecturesDone: 7,
        averageScore: 88,
        certificateRef: "GP-2026-PA-05604",
      },
      {
        moduleId: "bankable-climate-finance-proposals",
        enrolledOn: "2026-07-25",
        lecturesDone: 5,
        averageScore: 85,
      },
    ],
  },
  {
    id: "stu-2023",
    name: "Sajith Weerakoon",
    initials: "SW",
    email: "sajith.weerakoon@example.lk",
    district: "Ratnapura",
    sector: "Something else",
    organisation: "Independent consultant",
    joined: "2026-07-05",
    lastActive: "2026-07-06",
    status: "suspended",
    enrolments: [
      {
        moduleId: "gender-social-inclusion",
        enrolledOn: "2026-07-05",
        lecturesDone: 1,
        averageScore: 25,
      },
    ],
  },
  {
    id: "stu-2022",
    name: "Hasini Abeywardena",
    initials: "HA",
    email: "hasini.a@example.lk",
    district: "Kandy",
    sector: "Government or public sector",
    organisation: "Central Environmental Authority",
    joined: "2026-07-02",
    lastActive: "2026-08-11",
    status: "active",
    enrolments: [
      {
        moduleId: "climate-vulnerability-assessment",
        enrolledOn: "2026-07-02",
        lecturesDone: 8,
        averageScore: 86,
        certificateRef: "GP-2026-CV-05512",
      },
      {
        moduleId: "provincial-adaptation-plan",
        enrolledOn: "2026-07-20",
        lecturesDone: 6,
        averageScore: 83,
      },
    ],
  },
  {
    id: "stu-2021",
    name: "Nimal Karunaratne",
    initials: "NK",
    email: "nimal.k@example.lk",
    district: "Polonnaruwa",
    sector: "Government or public sector",
    organisation: "Irrigation Department",
    joined: "2026-06-28",
    lastActive: "2026-07-14",
    status: "dormant",
    enrolments: [
      {
        moduleId: "climate-vulnerability-assessment",
        enrolledOn: "2026-06-28",
        lecturesDone: 3,
        averageScore: 67,
      },
    ],
  },
  {
    id: "stu-2020",
    name: "Dulmini Herath",
    initials: "DH",
    email: "dulmini.herath@example.lk",
    district: "Colombo",
    sector: "Private sector",
    organisation: "Hatton Development Bank",
    joined: "2026-06-24",
    lastActive: "2026-08-15",
    status: "active",
    enrolments: [
      {
        moduleId: "gender-social-inclusion",
        enrolledOn: "2026-06-24",
        lecturesDone: 7,
        averageScore: 96,
        certificateRef: "GP-2026-GS-05398",
      },
      {
        moduleId: "bankable-climate-finance-proposals",
        enrolledOn: "2026-07-18",
        lecturesDone: 7,
        averageScore: 90,
      },
    ],
  },
  {
    id: "stu-2019",
    name: "Aravinth Thevarajah",
    initials: "AT",
    email: "aravinth.t@example.lk",
    district: "Trincomalee",
    sector: "Provincial or local authority",
    organisation: "Trincomalee Municipal Council",
    joined: "2026-06-20",
    lastActive: "2026-08-07",
    status: "active",
    enrolments: [
      {
        moduleId: "provincial-adaptation-plan",
        enrolledOn: "2026-06-20",
        lecturesDone: 4,
        averageScore: 75,
      },
    ],
  },
  {
    id: "stu-2018",
    name: "Menaka Liyanage",
    initials: "ML",
    email: "menaka.liyanage@example.lk",
    district: "Galle",
    sector: "University or school",
    organisation: "Southern Technical College",
    joined: "2026-06-16",
    lastActive: "2026-08-13",
    status: "active",
    enrolments: [
      {
        moduleId: "bankable-climate-finance-proposals",
        enrolledOn: "2026-06-16",
        lecturesDone: 8,
        averageScore: 87,
        certificateRef: "GP-2026-CF-05244",
      },
    ],
  },
  {
    id: "stu-2017",
    name: "Chathura Ranasinghe",
    initials: "CR",
    email: "chathura.r@example.lk",
    district: "Hambantota",
    sector: "Government or public sector",
    organisation: "Divisional Secretariat, Tangalle",
    joined: "2026-06-11",
    lastActive: "2026-06-30",
    status: "dormant",
    enrolments: [
      {
        moduleId: "gender-responsive-budgeting",
        enrolledOn: "2026-06-11",
        lecturesDone: 2,
        averageScore: 50,
      },
    ],
  },
  {
    id: "stu-2016",
    name: "Iresha Kumari",
    initials: "IK",
    email: "iresha.kumari@example.lk",
    district: "Monaragala",
    sector: "NGO or development organisation",
    organisation: "Dry Zone Farmers Collective",
    joined: "2026-06-07",
    lastActive: "2026-08-14",
    status: "active",
    enrolments: [
      {
        moduleId: "climate-vulnerability-assessment",
        enrolledOn: "2026-06-07",
        lecturesDone: 7,
        averageScore: 84,
      },
      {
        moduleId: "provincial-adaptation-plan",
        enrolledOn: "2026-07-11",
        lecturesDone: 7,
        averageScore: 91,
        certificateRef: "GP-2026-PA-05455",
      },
    ],
  },
];
