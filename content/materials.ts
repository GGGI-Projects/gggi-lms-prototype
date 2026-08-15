/**
 * The materials library.
 *
 * ONE SHELF FOR THE WHOLE PLATFORM. Before this existed, a handout lived
 * inside the module it was attached to, which meant the same unit-cost table
 * was uploaded four times by three people, each copy aged separately, and
 * nobody could answer "which modules use the 2025 tariff sheet" without
 * opening forty-two modules. A library turns that into one file with a date on
 * it and a list of where it is used.
 *
 * WHAT IS AUTHORED HERE: the file, its group, who put it there and when.
 * WHAT IS DERIVED: where it is used - `lib/materials.ts` finds that by looking
 * for the asset's title in the curriculum's own materials blocks, so usage
 * cannot claim a module that does not attach it. See the note on `usageOf`.
 *
 * GROUPS ARE SUBJECT SHELVES, not owners. Anybody on staff can use anything -
 * an energy instructor attaching the Sinhala glossary from the teaching kit is
 * the whole point of the shelf being shared. What a group does is make the
 * library findable at 200 files, and let a module pick up a whole set at once.
 */

import type { MaterialKind } from "@/content/curriculum";

/**
 * The library carries one kind the curriculum's own blocks do not: a recording
 * that is not the module's lecture - a webinar, a field video, a recorded
 * briefing.
 */
export type LibraryKind = MaterialKind | "video";

/* ------------------------------------------------------------------ groups */

export type MaterialGroup = {
  id: string;
  name: string;
  /** One line. Shown on the group card and when picking a group for a module. */
  description: string;
  createdOn: string;
  /** Staff id of whoever opened the shelf. */
  createdBy: string;
};

export const MATERIAL_GROUPS: MaterialGroup[] = [
  {
    id: "adaptation-toolkit",
    name: "Adaptation toolkit",
    description:
      "Everything a department needs to read, cost and defend an adaptation measure.",
    createdOn: "2025-09-02",
    createdBy: "staff-inst-1",
  },
  {
    id: "waste-templates",
    name: "Waste & circular templates",
    description:
      "Field sheets, roster and cost models for a municipal waste scheme.",
    createdOn: "2025-09-05",
    createdBy: "staff-inst-2",
  },
  {
    id: "energy-references",
    name: "Energy technical references",
    description:
      "Comparison tables, resource maps and the paperwork behind a renewable project.",
    createdOn: "2025-10-06",
    createdBy: "staff-inst-3",
  },
  {
    id: "finance-templates",
    name: "Finance & proposal templates",
    description:
      "Models, checklists and annotated examples for putting a bankable case together.",
    createdOn: "2025-11-18",
    createdBy: "staff-inst-4",
  },
  {
    id: "mobility-planning",
    name: "Mobility & land-use planning",
    description: "Corridor, interchange and street-level planning instruments.",
    createdOn: "2026-01-22",
    createdBy: "staff-inst-5",
  },
  {
    id: "national-data",
    name: "Sri Lanka datasets",
    description:
      "Official and derived data anybody on the platform may cite. Dated, and replaced rather than edited.",
    createdOn: "2025-09-12",
    createdBy: "staff-admin-1",
  },
  {
    id: "policy-circulars",
    name: "Policy & circulars",
    description:
      "Standing instructions, tariffs and circulars a learner may be asked to work to.",
    createdOn: "2025-10-30",
    createdBy: "staff-admin-1",
  },
  {
    id: "teaching-kit",
    name: "Teaching kit",
    description:
      "Slide templates and the Sinhala and Tamil glossaries. Used across every programme.",
    createdOn: "2025-09-01",
    createdBy: "staff-admin-1",
  },
];

/* ------------------------------------------------------------------ assets */

export type MaterialAsset = {
  id: string;
  /**
   * The title as it appears to a learner. It is also the JOIN: a module
   * attaches a material by this title, so two library entries must never share
   * one - `lib/materials.ts` warns in development if they do.
   */
  title: string;
  description: string;
  kind: LibraryKind;
  /** Absent for links, which have no size. */
  size?: string;
  groupId: string;
  uploadedBy: string;
  uploadedOn: string;
  /** English unless stated. Learners are told which language a handout is in. */
  language?: "English" | "සිංහල" | "தமிழ்";
  /** Shown on the material's own page. Blank where nothing was recorded. */
  source?: string;
};

/**
 * Thirty files, deliberately mixed.
 *
 * Most are attached to modules already - open one and it says where. Six are
 * not attached to anything, which is the state the library exists to make
 * visible: something uploaded and then forgotten is either the next module's
 * handout or dead weight, and you cannot tell which without a screen that
 * shows it.
 */
export const MATERIALS: MaterialAsset[] = [
  /* ------------------------------------------------------ adaptation toolkit */
  {
    id: "mat-101",
    title: "Glossary of adaptation terms",
    description:
      "The vocabulary an adaptation plan uses, in the order somebody meets it. Two pages.",
    kind: "pdf",
    size: "480 KB",
    groupId: "adaptation-toolkit",
    uploadedBy: "staff-inst-1",
    uploadedOn: "2025-09-08",
  },
  {
    id: "mat-102",
    title: "NAP sector chapter map",
    description:
      "Which chapter of the National Adaptation Plan covers which sector, and who owns each action.",
    kind: "pdf",
    size: "1.1 MB",
    groupId: "adaptation-toolkit",
    uploadedBy: "staff-inst-1",
    uploadedOn: "2025-09-19",
    source: "Derived from the published NAP, 2023 edition.",
  },
  {
    id: "mat-103",
    title: "Unit cost reference - common measures",
    description:
      "Indicative costs for the twenty measures that appear in most district plans. Revised annually.",
    kind: "pdf",
    size: "890 KB",
    groupId: "adaptation-toolkit",
    uploadedBy: "staff-inst-1",
    uploadedOn: "2026-02-11",
  },
  {
    id: "mat-104",
    title: "Climate expenditure tagging codes",
    description:
      "The tagging codes a budget line needs if the spend is to be counted as adaptation.",
    kind: "sheet",
    size: "88 KB",
    groupId: "adaptation-toolkit",
    uploadedBy: "staff-inst-1",
    uploadedOn: "2025-11-04",
  },
  {
    id: "mat-105",
    title: "Options appraisal template",
    description:
      "One page per option: what it does, what it costs, what it avoids, and what it needs to work.",
    kind: "sheet",
    size: "160 KB",
    groupId: "adaptation-toolkit",
    uploadedBy: "staff-inst-1",
    uploadedOn: "2025-10-02",
  },

  /* ------------------------------------------------------- waste templates */
  {
    id: "mat-201",
    title: "Characterisation protocol",
    description:
      "How to run a waste characterisation that will survive being questioned: sampling, sorting, recording.",
    kind: "pdf",
    size: "980 KB",
    groupId: "waste-templates",
    uploadedBy: "staff-inst-2",
    uploadedOn: "2025-09-15",
  },
  {
    id: "mat-202",
    title: "Field recording sheet",
    description: "The sheet that goes on the clipboard. Printable, one per sample day.",
    kind: "sheet",
    size: "76 KB",
    groupId: "waste-templates",
    uploadedBy: "staff-inst-2",
    uploadedOn: "2025-09-15",
  },
  {
    id: "mat-203",
    title: "Per-tonne cost model",
    description:
      "Collection, transfer, processing and disposal, with the levers a council actually controls marked.",
    kind: "sheet",
    size: "210 KB",
    groupId: "waste-templates",
    uploadedBy: "staff-inst-2",
    uploadedOn: "2025-12-03",
  },
  {
    id: "mat-204",
    title: "Buyer directory - by province",
    description:
      "Who buys recovered material, where, and at roughly what price. Updated twice a year.",
    kind: "dataset",
    size: "240 KB",
    groupId: "waste-templates",
    uploadedBy: "staff-inst-2",
    uploadedOn: "2026-06-20",
  },
  {
    id: "mat-205",
    title: "Model service-level schedule",
    description:
      "The schedule to attach to a collection contract, with the clauses that decide whether it is enforceable.",
    kind: "pdf",
    size: "760 KB",
    groupId: "waste-templates",
    uploadedBy: "staff-inst-2",
    uploadedOn: "2026-01-14",
  },

  /* ---------------------------------------------------- energy references */
  {
    id: "mat-301",
    title: "Technology comparison table",
    description:
      "Solar, wind, hydro and biomass against the six questions an evaluator has to answer.",
    kind: "sheet",
    size: "130 KB",
    groupId: "energy-references",
    uploadedBy: "staff-inst-3",
    uploadedOn: "2025-10-20",
  },
  {
    id: "mat-302",
    title: "Resource maps - solar and wind",
    description:
      "Irradiance and wind speed across the island, at the resolution a siting decision needs.",
    kind: "pdf",
    size: "3.2 MB",
    groupId: "energy-references",
    uploadedBy: "staff-inst-3",
    uploadedOn: "2025-10-20",
    source: "Compiled from published national resource assessments.",
  },
  {
    id: "mat-303",
    title: "Sample generation profiles",
    description:
      "Half-hourly output for a year, for one rooftop array and one wind site. Real shapes, anonymised sites.",
    kind: "dataset",
    size: "420 KB",
    groupId: "energy-references",
    uploadedBy: "staff-inst-3",
    uploadedOn: "2025-11-08",
  },
  {
    id: "mat-304",
    title: "PPA term sheet - annotated",
    description:
      "A power purchase agreement term sheet with the four clauses that decide the price marked up.",
    kind: "pdf",
    size: "1.5 MB",
    groupId: "energy-references",
    uploadedBy: "staff-inst-3",
    uploadedOn: "2026-03-02",
  },
  {
    id: "mat-305",
    title: "Walk-through audit form",
    description:
      "The form for a first-pass building energy audit. Fits on two sides and needs no meter.",
    kind: "sheet",
    size: "170 KB",
    groupId: "energy-references",
    uploadedBy: "staff-inst-3",
    uploadedOn: "2026-01-27",
  },
  {
    id: "mat-306",
    title: "O&M schedule template",
    description:
      "What gets checked, how often, by whom - the schedule that decides whether an installation lasts.",
    kind: "sheet",
    size: "115 KB",
    groupId: "energy-references",
    uploadedBy: "staff-inst-3",
    uploadedOn: "2026-04-16",
  },
  {
    id: "mat-307",
    title: "Rooftop solar site visit - recorded walkthrough",
    description:
      "Eleven minutes on a government building roof: shading, mounting, cable runs and what was got wrong.",
    kind: "video",
    size: "184 MB",
    groupId: "energy-references",
    uploadedBy: "staff-inst-3",
    uploadedOn: "2026-08-11",
  },

  /* -------------------------------------------------- finance templates */
  {
    id: "mat-401",
    title: "Bankability checklist",
    description:
      "The twelve things a financier looks for, in the order they look for them.",
    kind: "sheet",
    size: "105 KB",
    groupId: "finance-templates",
    uploadedBy: "staff-inst-4",
    uploadedOn: "2025-12-01",
  },
  {
    id: "mat-402",
    title: "Cash-flow model skeleton",
    description:
      "An empty model with the rows already right, so the work is the assumptions rather than the spreadsheet.",
    kind: "sheet",
    size: "230 KB",
    groupId: "finance-templates",
    uploadedBy: "staff-inst-4",
    uploadedOn: "2025-12-01",
  },
  {
    id: "mat-403",
    title: "Reviewer's scoring rubric",
    description:
      "How a fund's reviewer scores a proposal. Reading it before writing one is the whole trick.",
    kind: "sheet",
    size: "110 KB",
    groupId: "finance-templates",
    uploadedBy: "staff-inst-4",
    uploadedOn: "2026-02-24",
  },
  {
    id: "mat-404",
    title: "Accredited entities - current list",
    description:
      "Who can put a proposal to the major climate funds on Sri Lanka's behalf. A link, because it changes.",
    kind: "link",
    groupId: "finance-templates",
    uploadedBy: "staff-inst-4",
    uploadedOn: "2026-01-09",
  },

  /* ------------------------------------------------- mobility planning */
  {
    id: "mat-501",
    title: "Corridor prioritisation worksheet",
    description:
      "Ranking corridors by the people they move rather than by the vehicles on them.",
    kind: "sheet",
    size: "140 KB",
    groupId: "mobility-planning",
    uploadedBy: "staff-inst-5",
    uploadedOn: "2026-02-18",
  },
  {
    id: "mat-502",
    title: "Walking route audit form",
    description:
      "Footpath width, crossings, lighting and shade, scored the way a person walking would score it.",
    kind: "sheet",
    size: "86 KB",
    groupId: "mobility-planning",
    uploadedBy: "staff-inst-5",
    uploadedOn: "2026-03-11",
  },

  /* --------------------------------------------------- national datasets */
  {
    id: "mat-601",
    title: "District exposure summary - all 25",
    description:
      "One row per district: heat days, rainfall change, coastal exposure and population at risk.",
    kind: "dataset",
    size: "310 KB",
    groupId: "national-data",
    uploadedBy: "staff-admin-1",
    uploadedOn: "2025-09-22",
    source: "Derived from published meteorological and census data.",
  },
  {
    id: "mat-602",
    title: "Grid connection points - 2026",
    description:
      "Substations, capacity headroom and the queue at each. The first thing a project developer asks for.",
    kind: "dataset",
    size: "156 KB",
    groupId: "national-data",
    uploadedBy: "staff-admin-2",
    uploadedOn: "2026-07-30",
  },

  /* -------------------------------------------------- policy & circulars */
  {
    id: "mat-701",
    title: "Electricity tariff schedule - 2026",
    description:
      "Current tariffs by customer category. Every payback calculation on the platform depends on this one.",
    kind: "pdf",
    size: "640 KB",
    groupId: "policy-circulars",
    uploadedBy: "staff-admin-1",
    uploadedOn: "2026-04-02",
  },
  {
    id: "mat-702",
    title: "Green procurement circular 2026/03",
    description:
      "The standing instruction a public body has to follow when procuring anything with an energy label.",
    kind: "pdf",
    size: "410 KB",
    groupId: "policy-circulars",
    uploadedBy: "staff-admin-1",
    uploadedOn: "2026-05-19",
  },

  /* ------------------------------------------------------- teaching kit */
  {
    id: "mat-801",
    title: "Lecture slide template",
    description:
      "The platform's own slide template. Using it is what keeps forty-two modules looking like one course.",
    kind: "slides",
    size: "1.4 MB",
    groupId: "teaching-kit",
    uploadedBy: "staff-admin-1",
    uploadedOn: "2025-09-01",
  },
  {
    id: "mat-802",
    title: "Glossary of climate terms - සිංහල",
    description:
      "The platform's vocabulary in Sinhala. Attach it to any module whose learners asked for it.",
    kind: "pdf",
    size: "520 KB",
    groupId: "teaching-kit",
    uploadedBy: "staff-admin-2",
    uploadedOn: "2026-06-04",
    language: "සිංහල",
  },
  {
    id: "mat-803",
    title: "Glossary of climate terms - தமிழ்",
    description: "The same vocabulary in Tamil.",
    kind: "pdf",
    size: "515 KB",
    groupId: "teaching-kit",
    uploadedBy: "staff-admin-2",
    uploadedOn: "2026-06-04",
    language: "தமிழ்",
  },
  {
    id: "mat-804",
    title: "Cooling load calculator",
    description:
      "Room by room, for a public building. Written for the buildings programme that is still in draft.",
    kind: "sheet",
    size: "195 KB",
    groupId: "teaching-kit",
    uploadedBy: "staff-inst-3",
    uploadedOn: "2026-08-06",
  },
  {
    id: "mat-805",
    title: "Chiller efficiency benchmarks",
    description:
      "What good looks like for the plant already installed in most government buildings.",
    kind: "pdf",
    size: "730 KB",
    groupId: "teaching-kit",
    uploadedBy: "staff-inst-3",
    uploadedOn: "2026-08-14",
  },
];
