/**
 * The Tool directory.
 *
 * Global, and owned by nobody's Module - same shape as the Law library in
 * `content/laws.ts`, kept current by a Tools Administrator (see
 * docs/SRS.md §4.31). A Tool is deliberately thin: a link and an explanation
 * of how to use it for a specific task, not a document the platform hosts -
 * opening one leaves the platform (see FR-STU-630). It carries no province
 * scope, unlike a Law - the client's own description of this role named no
 * provincial dimension for it.
 */

export type Tool = {
  id: string;
  title: string;
  /** An outside resource - the platform's job is to keep this current, not
   *  to host what it points to. */
  link: string;
  explanation: string;
  hazardIds: string[];
  categoryIds: string[];
  /** Archived keeps the record - and any lecture that once pointed at it -
   *  true; it only stops it appearing anywhere new (see FR-TOOLADM-030, the
   *  same "hidden, not erased" rule a Law's own archive follows). */
  status: "draft" | "published" | "archived";
  publishedOn: string;
  /** Staff id of the Tools Administrator who added it. */
  addedBy: string;
};

export const TOOLS: Tool[] = [
  {
    id: "climate-risk-screening-tool",
    title: "Climate Risk Screening Tool",
    explanation:
      "Answer a short set of questions about a project or a division and get back which hazards apply, at what rough severity - the same first pass a full vulnerability assessment starts from.",
    link: "https://tools.example.lk/climate-risk-screening",
    hazardIds: ["flooding", "drought", "landslide", "sea-level-rise"],
    categoryIds: ["climate-vulnerability", "climate-risk"],
    status: "published",
    publishedOn: "2025-09-10",
    addedBy: "staff-admin-3",
  },
  {
    id: "vulnerability-index-calculator",
    title: "Vulnerability Index Calculator",
    explanation:
      "Enter a division's exposure and sensitivity indicators and it returns a comparable vulnerability score, weighted the same way across every district so two officers' scores can sit in one table.",
    link: "https://tools.example.lk/vulnerability-index",
    hazardIds: ["flooding", "drought", "sea-level-rise"],
    categoryIds: ["climate-vulnerability"],
    status: "published",
    publishedOn: "2025-09-12",
    addedBy: "staff-admin-3",
  },
  {
    id: "provincial-adaptation-costing-sheet",
    title: "Provincial Adaptation Costing Sheet",
    explanation:
      "A working spreadsheet for costing and sequencing a localised adaptation action against a real provincial budget cycle - fill in the action list and it builds the multi-year cost profile.",
    link: "https://tools.example.lk/adaptation-costing-sheet",
    hazardIds: ["flooding", "drought", "coastal-erosion"],
    categoryIds: ["adaptation-planning", "provincial-planning"],
    status: "published",
    publishedOn: "2025-09-20",
    addedBy: "staff-admin-3",
  },
  {
    id: "climate-finance-proposal-checklist",
    title: "Climate Finance Proposal Screening Checklist",
    explanation:
      "The same checklist a fund's own reviewers work through first - eligibility, additionality, co-financing - so a proposal is fixed before submission rather than after a rejection letter.",
    link: "https://tools.example.lk/proposal-checklist",
    hazardIds: [],
    categoryIds: ["climate-finance", "public-finance"],
    status: "published",
    publishedOn: "2025-10-01",
    addedBy: "staff-admin-3",
  },
  {
    id: "gender-budget-statement-template",
    title: "Gender Budget Statement Template",
    explanation:
      "A ready-built gender budget statement with the sex-disaggregated data fields already laid out, so a budget circular's requirement is a fill-in exercise rather than a blank page.",
    link: "https://tools.example.lk/gender-budget-statement",
    hazardIds: [],
    categoryIds: ["gender-responsive-budgeting", "public-finance"],
    status: "published",
    publishedOn: "2025-10-05",
    addedBy: "staff-admin-4",
  },
  {
    id: "gsi-consultation-design-toolkit",
    title: "GSI Consultation Design Toolkit",
    explanation:
      "A step-by-step guide to designing a consultation that actually reaches people usually left out of one - who to invite, when to hold it, and how to record what changed because of it.",
    link: "https://tools.example.lk/gsi-consultation-toolkit",
    hazardIds: [],
    categoryIds: ["gender-social-inclusion"],
    status: "published",
    publishedOn: "2025-10-05",
    addedBy: "staff-admin-4",
  },
];
