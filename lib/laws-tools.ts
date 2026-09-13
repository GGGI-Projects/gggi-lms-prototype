/**
 * The Laws/Tools derivations.
 *
 * The one rule everything here exists to enforce: a Module's related Laws
 * and Tools are never AUTHORED - they are FOUND, by matching tags, every
 * time they are asked for (see BR-26 in docs/SRS.md). There is no field
 * anywhere naming "this Law belongs to this Module"; adding a tag to a Law
 * that a Module already carries is enough to relate them, and removing that
 * tag un-relates them, with nothing else to update by hand.
 *
 * `relatedPoolForModule()` is the automatic, broad answer a Module's own
 * page shows in full. `curatedForLecture()` is the narrower, deliberate one
 * a lecturer picked - see `Lecture["relatedLawIds"/"relatedToolIds"]` in
 * `content/curriculum.ts` and §4.10a of the SRS.
 */

import { getLecture } from "@/lib/portal";
import { MANAGED_MODULES, type ManagedModule } from "@/content/staff";
import { categoryLabel, hazardLabel } from "@/content/tags";
import {
  LAWS,
  NATIONAL_LEARNER,
  type Law,
  type LawScope,
  type LearnerProvince,
} from "@/content/laws";
import { TOOLS, type Tool } from "@/content/tools";

/* ------------------------------------------------------------------ lookups */

export function lawById(id: string): Law | undefined {
  return LAWS.find((law) => law.id === id);
}

export function toolById(id: string): Tool | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export function publishedLaws(): Law[] {
  return LAWS.filter((law) => law.status === "published");
}

export function publishedTools(): Tool[] {
  return TOOLS.filter((tool) => tool.status === "published");
}

/* -------------------------------------------------------------- relatedness */

type Tagged = { hazardIds: string[]; categoryIds: string[] };

/**
 * ANY SHARED TAG COUNTS - an OR-match, not "every list has to line up".
 * Deliberately inclusive: with a small, growing library, a strict match
 * would under-surface almost everything early on, and an inclusive one at
 * least gives a learner something to look at (see BR-26).
 */
function sharesTag(a: Tagged, b: Tagged): boolean {
  return (
    a.hazardIds.some((id) => b.hazardIds.includes(id)) ||
    a.categoryIds.some((id) => b.categoryIds.includes(id))
  );
}

export type RelatedPool = { laws: Law[]; tools: Tool[] };

/**
 * A Module's full related pool - every published Law and Tool sharing at
 * least one tag with it. Shown in full on the Module's own page; a
 * Lecture only ever shows a curated subset of this (`curatedForLecture()`).
 *
 * READS TAGS FROM `MANAGED_MODULES` (`content/staff.ts`), not the public
 * catalogue in `content/site.ts` - a draft Module has no catalogue entry at
 * all (it is not public yet), but a Module Administrator can tag it before
 * it ever is (FR-MODADM-020), and its related pool has to reflect that from
 * day one rather than only once it publishes.
 */
export function relatedPoolForModule(moduleId: string): RelatedPool {
  const mdl: ManagedModule | undefined = MANAGED_MODULES.find(
    (entry) => entry.id === moduleId,
  );
  if (!mdl) return { laws: [], tools: [] };

  return {
    laws: publishedLaws().filter((law) => sharesTag(mdl, law)),
    tools: publishedTools().filter((tool) => sharesTag(mdl, tool)),
  };
}

/**
 * A Lecture's own, lecturer-picked subset - never sourced from the whole
 * platform-wide library directly, only from IDs the lecturer selected out
 * of their Module's own pool (FR-INS-105). Most lectures pick none, which
 * this returns as two empty arrays rather than a special case for callers
 * to check for.
 */
export function curatedForLecture(moduleId: string, lectureId: string): RelatedPool {
  const lecture = getLecture(moduleId, lectureId);
  if (!lecture) return { laws: [], tools: [] };

  return {
    laws: (lecture.relatedLawIds ?? [])
      .map((id) => lawById(id))
      .filter((law): law is Law => Boolean(law)),
    tools: (lecture.relatedToolIds ?? [])
      .map((id) => toolById(id))
      .filter((tool): tool is Tool => Boolean(tool)),
  };
}

/* ---------------------------------------------------------- learner-facing */

/** Whether a Law's scope covers a given learner - "national" always does;
 *  a specific-province scope does only for a learner who has that same
 *  province, never for "National / Head Office" (nobody's single province
 *  matches everyone's, and the reverse - see Appendix D, item 12 of the
 *  SRS). */
function matchesProvince(scope: LawScope, province: LearnerProvince): boolean {
  if (scope === "national") return true;
  if (province === NATIONAL_LEARNER) return false;
  return scope.includes(province);
}

export type ProvinceSplitLaws = {
  /** National laws, plus anything scoped to the learner's own province -
   *  shown first (FR-STU-500). */
  own: Law[];
  /** Every other province's own laws - shown below. */
  other: Law[];
};

/** The Laws tab's own split: a learner's province first, everyone else's
 *  laws after. A "National / Head Office" learner sees only the national
 *  half of `own` - there is no province of theirs for anything else to
 *  match against. */
export function lawsForLearner(province: LearnerProvince): ProvinceSplitLaws {
  const published = publishedLaws();
  return {
    own: published.filter((law) => matchesProvince(law.scope, province)),
    other: published.filter((law) => !matchesProvince(law.scope, province)),
  };
}

/** A Law's scope, in one line - for a badge or a definitions list. */
export function scopeLabel(scope: LawScope): string {
  if (scope === "national") return "National / All provinces";
  return scope.join(", ");
}

/* ---------------------------------------------------------- console-facing */

/** A Law's own tags, as labels rather than ids - for a badge, not a filter,
 *  which is why hazards and categories come back in one list rather than
 *  two: the lecturer picking a related Law cares that it carries a tag,
 *  not which of the two lists that tag happens to live on. */
export function lawTagLabels(law: Law): string[] {
  return [...law.hazardIds.map(hazardLabel), ...law.categoryIds.map(categoryLabel)];
}

/** The same, for a Tool. */
export function toolTagLabels(tool: Tool): string[] {
  return [...tool.hazardIds.map(hazardLabel), ...tool.categoryIds.map(categoryLabel)];
}

export type ModuleUsage = { moduleId: string; moduleTitle: string };

/**
 * Every Module a Law currently relates to - `relatedPoolForModule()` read in
 * the other direction, and just as FOUND rather than authored: a Laws
 * Administrator sees this to know whether their entry is actually reaching
 * anything, never as a list they maintain by hand.
 */
export function moduleUsageOfLaw(law: Tagged): ModuleUsage[] {
  return MANAGED_MODULES.filter((mdl) => sharesTag(mdl, law)).map((mdl) => ({
    moduleId: mdl.id,
    moduleTitle: mdl.title,
  }));
}

/** The same, for a Tool. */
export function moduleUsageOfTool(tool: Tagged): ModuleUsage[] {
  return moduleUsageOfLaw(tool);
}

export type LawEntry = { law: Law; usage: ModuleUsage[] };

/** Every Law, any status, newest first - the Laws Administrator's own list,
 *  as opposed to `publishedLaws()`, which is what a learner is allowed to
 *  see. */
export function lawsWithUsage(): LawEntry[] {
  return [...LAWS]
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn))
    .map((law) => ({ law, usage: moduleUsageOfLaw(law) }));
}

/** The Laws library's own headline numbers, the same shape the Materials
 *  library's `libraryTotals()` already reports in. */
export function lawTotals() {
  return {
    total: LAWS.length,
    published: LAWS.filter((law) => law.status === "published").length,
    draft: LAWS.filter((law) => law.status === "draft").length,
    unrelated: LAWS.filter((law) => moduleUsageOfLaw(law).length === 0).length,
  };
}

export type ToolEntry = { tool: Tool; usage: ModuleUsage[] };

/** Every Tool, any status, newest first - the Tools Administrator's own
 *  list, as opposed to `publishedTools()`, which is what a learner is
 *  allowed to see. Same shape as `lawsWithUsage()`. */
export function toolsWithUsage(): ToolEntry[] {
  return [...TOOLS]
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn))
    .map((tool) => ({ tool, usage: moduleUsageOfTool(tool) }));
}

/** The Tool directory's own headline numbers - same shape as `lawTotals()`. */
export function toolTotals() {
  return {
    total: TOOLS.length,
    published: TOOLS.filter((tool) => tool.status === "published").length,
    draft: TOOLS.filter((tool) => tool.status === "draft").length,
    unrelated: TOOLS.filter((tool) => moduleUsageOfTool(tool).length === 0).length,
  };
}
