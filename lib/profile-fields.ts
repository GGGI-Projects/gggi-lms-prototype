/**
 * The field schemas for a lecturer's four profile lists, and the pure
 * functions that read them - kept OUT of `components/console/profile-
 * entries.tsx` deliberately, because that file is `"use client"` and a
 * server component (the admin lecturer page, the student lecturer page)
 * cannot call a plain function exported from a client module, only render
 * its components. Everything here is just data and data transforms, so it
 * belongs where both server and client code can reach it.
 */

export type EntryField = {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
};

export type EntryValues = Record<string, string>;

export const QUALIFICATION_FIELDS: EntryField[] = [
  { key: "qualification", label: "Qualification", placeholder: "MSc, Water Resources Engineering", required: true },
  { key: "institution", label: "Institution", placeholder: "University of Moratuwa", required: true },
  { key: "year", label: "Year", placeholder: "2013", required: true },
];

export const EXPERIENCE_FIELDS: EntryField[] = [
  { key: "role", label: "Role", placeholder: "Senior Technical Adviser, Climate Risk", required: true },
  { key: "organisation", label: "Organisation", placeholder: "Ministry of Environment", required: true },
  { key: "period", label: "Period", placeholder: "2019-present", required: true },
  { key: "description", label: "What this involved", placeholder: "A line or two - optional", multiline: true },
];

export const PUBLICATION_FIELDS: EntryField[] = [
  { key: "title", label: "Title", placeholder: "Composite Vulnerability Indices for Divisional-Scale Planning", required: true },
  { key: "publisher", label: "Publisher", placeholder: "Journal of South Asian Climate Policy", required: true },
  { key: "year", label: "Year", placeholder: "2022", required: true },
  { key: "url", label: "Link", placeholder: "Optional" },
];

export const ACHIEVEMENT_FIELDS: EntryField[] = [
  { key: "title", label: "Achievement", placeholder: "Lead author, Sri Lanka's second National Communication", required: true },
  { key: "year", label: "Year", placeholder: "Optional" },
  { key: "description", label: "Detail", placeholder: "Optional", multiline: true },
];

/** The first field is always the headline - see the field order above - and
 *  everything else that has a value becomes the supporting line under it. */
export function summarise(fields: EntryField[], entry: EntryValues) {
  const [headline, ...rest] = fields;
  return {
    title: entry[headline.key] || "Untitled",
    detail: rest
      .map((field) => entry[field.key])
      .filter(Boolean)
      .join(" · "),
  };
}

export function emptyValues(fields: EntryField[]): EntryValues {
  return Object.fromEntries(fields.map((field) => [field.key, ""]));
}

/**
 * A typed entry from `content/staff.ts` (`QualificationEntry`,
 * `ExperienceEntry`, ...), flattened into the loose string-keyed shape the
 * forms and read-only lists both work with. Optional fields (`description?`,
 * `url?`) become empty strings rather than `undefined`, so `summarise()` can
 * treat every entry the same way regardless of source.
 */
export function toEntryValues(entry: Record<string, unknown>): EntryValues {
  return Object.fromEntries(
    Object.entries(entry).map(([key, value]) => [key, value == null ? "" : String(value)]),
  );
}
