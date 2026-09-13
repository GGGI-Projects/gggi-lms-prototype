/**
 * The dynamic option lists.
 *
 * Every Module, Law and Tool is tagged from these - and a shared tag is the
 * ONLY thing that relates them to each other. There is no hand-maintained
 * "this Law belongs to this Module" table anywhere in the platform; a
 * Module's related pool (see `relatedPoolForModule()` in `lib/laws-tools.ts`)
 * is worked out by matching tags, every time it is asked for.
 *
 * A LIST OF LISTS, not two fixed constants - that is the whole point of
 * `OPTION_LISTS` existing as one array rather than `HAZARDS`/`CATEGORIES`
 * being the only two names this file could ever export. The List Manager
 * (docs/SRS.md §4.32) can open a third, a fourth, and so on; `HAZARDS` and
 * `CATEGORIES` below are kept as derived, ACTIVE-ONLY views onto that array,
 * so the many call sites written before this file supported more than two
 * lists do not need to change to keep working.
 *
 * TWO LISTS TO START, and the client has been explicit that Hazards and
 * Categories are illustrative rather than final or complete.
 *
 * RETIRED, NOT DELETED. A value's `active` flag is what a tagging picker
 * checks before offering it (FR-LIST-020) - retiring one hides it from
 * every *future* pick without stripping it from anything already tagged
 * with it, the same "archiving doesn't erase" rule already governing a
 * Module's or a Law's own archive (BR-11).
 *
 * CATEGORIES DELIBERATELY ECHOES THE MARKETING MARQUEE (`SUBJECT_MARQUEE` in
 * `content/site.ts`) rather than importing it. The two are not the same
 * system - one is landing-page decoration, the other is the taxonomy real
 * content gets tagged and matched against - and coupling them would mean a
 * marquee wording tweak silently changing what a Module is tagged with. They
 * share wording on purpose, because a learner should not meet two different
 * vocabularies for the same five subjects on two different screens.
 */

export type OptionValue = {
  id: string;
  label: string;
  active: boolean;
};

export type OptionList = {
  id: string;
  name: string;
  createdOn: string;
  /** Staff id of whoever opened this list - same shape as
   *  `MaterialGroup.createdBy` in `content/materials.ts`. */
  createdBy: string;
  /** Order is the list's own - see `moveOptionValue()` in
   *  `lib/option-lists.ts` for how the List Manager console reorders it. */
  values: OptionValue[];
};

export const OPTION_LISTS: OptionList[] = [
  {
    id: "hazards",
    name: "Hazards",
    createdOn: "2025-09-01",
    createdBy: "staff-super",
    values: [
      { id: "flooding", label: "Flooding", active: true },
      { id: "drought", label: "Drought", active: true },
      { id: "landslide", label: "Landslide", active: true },
      { id: "sea-level-rise", label: "Sea-Level Rise", active: true },
      { id: "coastal-erosion", label: "Coastal Erosion", active: true },
      { id: "extreme-heat", label: "Extreme Heat", active: true },
    ],
  },
  {
    id: "categories",
    name: "Categories",
    createdOn: "2025-09-01",
    createdBy: "staff-super",
    values: [
      { id: "climate-vulnerability", label: "Climate Vulnerability", active: true },
      { id: "adaptation-planning", label: "Adaptation Planning", active: true },
      { id: "climate-finance", label: "Climate Finance", active: true },
      { id: "gender-social-inclusion", label: "Gender & Social Inclusion", active: true },
      { id: "gender-responsive-budgeting", label: "Gender-Responsive Budgeting", active: true },
      { id: "provincial-planning", label: "Provincial Planning", active: true },
      { id: "climate-risk", label: "Climate Risk", active: true },
      { id: "public-finance", label: "Public Finance", active: true },
    ],
  },
];

function listById(listId: string): OptionList | undefined {
  return OPTION_LISTS.find((list) => list.id === listId);
}

function valueById(listId: string, valueId: string): OptionValue | undefined {
  return listById(listId)?.values.find((value) => value.id === valueId);
}

/** Every ACTIVE hazard - what a tagging picker offers. Retired hazards keep
 *  their label reachable through `hazardLabel()`, just not through this
 *  list. */
export const HAZARDS: OptionValue[] = OPTION_LISTS.find(
  (list) => list.id === "hazards",
)!.values.filter((value) => value.active);

/** The same, for categories. */
export const CATEGORIES: OptionValue[] = OPTION_LISTS.find(
  (list) => list.id === "categories",
)!.values.filter((value) => value.active);

export function hazardLabel(id: string): string {
  return valueById("hazards", id)?.label ?? id;
}

export function categoryLabel(id: string): string {
  return valueById("categories", id)?.label ?? id;
}

/** Every ACTIVE tag a Module, Law or Tool can carry, every list together -
 *  what a filter bar offers when it does not need to keep the lists apart. */
export function allTags(): OptionValue[] {
  return OPTION_LISTS.flatMap((list) => list.values.filter((value) => value.active));
}
