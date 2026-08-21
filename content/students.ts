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
  /** A public headshot photo, sourced from Unsplash for this prototype - see
   *  the note in `components/student-portal/ui.tsx`'s `Avatar`. */
  avatarUrl: string;
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
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1517070208541-6ddc4d3efbcb?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1542178243-bc20204b769f?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1602233158242-3ba0ac4d2167?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1508341591423-4347099e1f19?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
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
