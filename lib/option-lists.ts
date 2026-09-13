/**
 * The List Manager's own derivations.
 *
 * The one number this file exists to compute: how many Modules, Laws and
 * Tools currently carry a given tag - FOUND by reading those records, never
 * kept as a separate count the List Manager has to update by hand. It is the
 * same "found, not authored" rule as `moduleUsageOfLaw()` in
 * `lib/laws-tools.ts`, read from the tag's side instead of the tagged
 * record's.
 */

import { MANAGED_MODULES } from "@/content/staff";
import { LAWS } from "@/content/laws";
import { TOOLS } from "@/content/tools";
import { OPTION_LISTS, type OptionList } from "@/content/tags";

export function optionLists(): OptionList[] {
  return OPTION_LISTS;
}

export function optionListById(listId: string): OptionList | undefined {
  return OPTION_LISTS.find((list) => list.id === listId);
}

/**
 * Which field on a Module/Law/Tool a list's own values are read from.
 *
 * ONLY TWO LISTS EXIST TODAY, and both happen to be native fields on the
 * three tagged record types - this is the one place in the platform that is
 * genuinely "frozen at two" rather than shaped to hold more (see the note on
 * `OPTION_LISTS` in `content/tags.ts`). A third list would need a matching
 * `hazardIds`/`categoryIds`-style field added to `Module`/`Law`/`Tool` and a
 * case added here - not a limitation of the list mechanism itself, just of
 * how a tag is currently stored on the record it tags.
 */
function fieldFor(listId: string): "hazardIds" | "categoryIds" | undefined {
  if (listId === "hazards") return "hazardIds";
  if (listId === "categories") return "categoryIds";
  return undefined;
}

export type ValueUsage = { modules: number; laws: number; tools: number };

/**
 * How many Modules, Laws and Tools currently carry this exact tag - a
 * retired value can still show a nonzero count, since retiring hides it
 * from future pickers without stripping it from anything already tagged
 * (FR-LIST-020).
 *
 * READS `MANAGED_MODULES` (`content/staff.ts`), not the public catalogue in
 * `content/site.ts` - the same fix `relatedPoolForModule()` in
 * `lib/laws-tools.ts` needed, and for the same reason: a draft Module (not
 * yet on the public catalogue) can carry a tag too, and a value's usage
 * count has to include it or a Module Administrator tagging a brand-new
 * draft would see this screen quietly disagree with the one they just used.
 */
export function valueUsage(listId: string, valueId: string): ValueUsage {
  const field = fieldFor(listId);
  if (!field) return { modules: 0, laws: 0, tools: 0 };

  return {
    modules: MANAGED_MODULES.filter((mdl) => mdl[field].includes(valueId)).length,
    laws: LAWS.filter((law) => law[field].includes(valueId)).length,
    tools: TOOLS.filter((tool) => tool[field].includes(valueId)).length,
  };
}

export function valueUsageTotal(listId: string, valueId: string): number {
  const usage = valueUsage(listId, valueId);
  return usage.modules + usage.laws + usage.tools;
}
