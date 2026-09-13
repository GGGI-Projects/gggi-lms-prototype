/**
 * The Law library.
 *
 * Global, and owned by nobody's Module - a Laws Administrator keeps this one
 * shelf current for the whole platform (see docs/SRS.md §4.30), the same way
 * the Materials Library in `content/materials.ts` is one shelf a lecturer
 * reads from rather than a private folder per module. What ties a Law to a
 * Module is a shared tag, worked out by `relatedPoolForModule()` in
 * `lib/laws-tools.ts` - never a field on either record naming the other.
 *
 * SRI LANKA'S NINE PROVINCES, PLUS A TENTH FIXED CHOICE, are the platform's
 * one closed geography - not a dynamic option list a List Manager edits (see
 * `content/tags.ts` for the lists that ARE editable). A learner has exactly
 * one; a Law can be scoped to the whole country, one province, or several.
 *
 * The Act numbers below are the real, citable instruments a Sri Lankan
 * environment/climate curriculum would actually reference. The two
 * province-specific entries are illustrative stand-ins for a provincial
 * council's own statute - the exact kind of local instrument this library
 * exists to hold, not a real regulation - and are labelled as such.
 */

export const PROVINCES = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
] as const;

export type Province = (typeof PROVINCES)[number];

/** What a Learner picks at registration when no single province applies -
 *  see docs/SRS.md §4.2, FR-REG-040. Not a Law's own scope - see `LawScope`. */
export const NATIONAL_LEARNER = "National / Head Office" as const;

export type LearnerProvince = Province | typeof NATIONAL_LEARNER;

/** `"national"` reads as "every province", never as an empty list - see
 *  `matchesProvince()` in `lib/laws-tools.ts`. */
export type LawScope = "national" | Province[];

export type Law = {
  id: string;
  title: string;
  summary: string;
  /** A citation a learner can act on - an Act number, or a plain note where
   *  the document is a policy rather than an Act. */
  reference: string;
  scope: LawScope;
  hazardIds: string[];
  categoryIds: string[];
  /** Archived keeps the record - and any certificate or lecture that once
   *  pointed at it - true; it only stops it appearing anywhere new (see
   *  FR-LAWADM-030, the same "hidden, not erased" rule a Module's own
   *  archive already follows). */
  status: "draft" | "published" | "archived";
  publishedOn: string;
  /** Staff id of the Laws Administrator who added it - same shape as
   *  `MaterialAsset.uploadedBy` in `content/materials.ts`. */
  addedBy: string;
};

export const LAWS: Law[] = [
  {
    id: "national-environmental-act",
    title: "National Environmental Act",
    summary:
      "The framework law behind almost every environmental approval and standard in the country - the starting point for reading any other instrument in this library.",
    reference: "No. 47 of 1980, as amended",
    scope: "national",
    hazardIds: ["flooding", "drought", "landslide", "coastal-erosion", "sea-level-rise"],
    categoryIds: ["climate-vulnerability", "climate-risk"],
    status: "published",
    publishedOn: "2025-09-01",
    addedBy: "staff-admin-1",
  },
  {
    id: "coast-conservation-act",
    title: "Coast Conservation and Coastal Resource Management Act",
    summary:
      "Sets the coastal zone and the permit regime inside it - the law behind any adaptation measure that touches the shoreline.",
    reference: "No. 57 of 1981, amended 2011",
    scope: "national",
    hazardIds: ["coastal-erosion", "sea-level-rise"],
    categoryIds: ["climate-vulnerability", "adaptation-planning"],
    status: "published",
    publishedOn: "2025-09-01",
    addedBy: "staff-admin-1",
  },
  {
    id: "disaster-management-act",
    title: "Disaster Management Act",
    summary:
      "Establishes the national disaster management structure, from the council down to the district level - the legal basis for the early-warning and response duties a vulnerability assessment feeds into.",
    reference: "No. 13 of 2005",
    scope: "national",
    hazardIds: ["flooding", "landslide", "drought", "extreme-heat"],
    categoryIds: ["climate-risk", "climate-vulnerability"],
    status: "published",
    publishedOn: "2025-09-08",
    addedBy: "staff-admin-1",
  },
  {
    id: "national-climate-change-policy",
    title: "National Climate Change Policy",
    summary:
      "The country's own statement of principle on climate change - adaptation and mitigation both - that every sector plan is expected to sit under.",
    reference: "Policy document, 2012",
    scope: "national",
    hazardIds: [],
    categoryIds: ["climate-vulnerability", "adaptation-planning", "climate-risk"],
    status: "published",
    publishedOn: "2025-09-08",
    addedBy: "staff-admin-1",
  },
  {
    id: "national-adaptation-plan",
    title: "National Adaptation Plan for Climate Change Impacts",
    summary:
      "The ten-year national plan a provincial adaptation plan is meant to localise - sector by sector, action by action.",
    reference: "NAP 2016-2025",
    scope: "national",
    hazardIds: ["flooding", "drought", "sea-level-rise"],
    categoryIds: ["adaptation-planning", "provincial-planning"],
    status: "published",
    publishedOn: "2025-09-15",
    addedBy: "staff-admin-1",
  },
  {
    id: "provincial-councils-act",
    title: "Provincial Councils Act",
    summary:
      "The devolution law behind a provincial council's own planning and budget powers - the reason a national plan has to be localised rather than simply handed down.",
    reference: "No. 42 of 1987",
    scope: "national",
    hazardIds: [],
    categoryIds: ["provincial-planning"],
    status: "published",
    publishedOn: "2025-09-15",
    addedBy: "staff-admin-1",
  },
  {
    id: "southern-province-environmental-statute",
    title: "Southern Province Environmental Statute",
    summary:
      "The Southern Provincial Council's own environmental statute, covering coastal and inland development consent within the province.",
    reference: "Provincial statute (illustrative)",
    scope: ["Southern"],
    hazardIds: ["coastal-erosion", "flooding"],
    categoryIds: ["adaptation-planning"],
    status: "published",
    publishedOn: "2025-10-02",
    addedBy: "staff-admin-2",
  },
  {
    id: "central-province-landslide-zoning",
    title: "Central Province Landslide Risk Zoning Regulations",
    summary:
      "Zoning rules for hillside development in landslide-prone divisions of the Central Province, made under the province's own planning powers.",
    reference: "Provincial regulation (illustrative)",
    scope: ["Central"],
    hazardIds: ["landslide"],
    categoryIds: ["climate-risk", "adaptation-planning"],
    status: "published",
    publishedOn: "2025-10-09",
    addedBy: "staff-admin-2",
  },
];
