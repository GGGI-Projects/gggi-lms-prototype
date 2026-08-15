/**
 * The library's derivations.
 *
 * The one that matters is `usageOf`. Where a material is used is NOT authored
 * anywhere - it is found by looking through the curriculum for a materials
 * block that attaches that title. That direction is deliberate: the module is
 * the thing a learner opens, so the module's own content is the truth about
 * what it attaches, and a `usedIn` list kept by hand beside it would be a
 * second answer to the same question that starts drifting the day somebody
 * removes a handout from a module.
 *
 * The join is by TITLE, which is only sound because a title is what a learner
 * reads - two files called the same thing are already a problem for them, not
 * just for this function. The development check at the bottom fails loudly if
 * two library entries ever share one.
 */

import { MODULES } from "@/content/curriculum";
import { MANAGED_PROGRAMMES } from "@/content/staff";
import {
  MATERIALS,
  MATERIAL_GROUPS,
  type MaterialAsset,
  type MaterialGroup,
} from "@/content/materials";
import { staffById } from "@/lib/admin";
import type { StaffMember } from "@/content/staff";

/* ----------------------------------------------------------------- lookups */

export function materialById(id: string): MaterialAsset | undefined {
  return MATERIALS.find((asset) => asset.id === id);
}

export function groupById(id: string): MaterialGroup | undefined {
  return MATERIAL_GROUPS.find((group) => group.id === id);
}

export function materialsInGroup(groupId: string): MaterialAsset[] {
  return MATERIALS.filter((asset) => asset.groupId === groupId);
}

export function uploader(asset: MaterialAsset): StaffMember | undefined {
  return staffById(asset.uploadedBy);
}

/* ------------------------------------------------------------------- usage */

export type MaterialUsage = {
  programmeId: string;
  programmeTitle: string;
  moduleId: string;
  moduleNumber: string;
  moduleTitle: string;
};

/** Every module that attaches this material, found in the curriculum itself. */
export function usageOf(title: string): MaterialUsage[] {
  return Object.entries(MODULES).flatMap(([programmeId, modules]) => {
    const programme = MANAGED_PROGRAMMES.find(
      (entry) => entry.id === programmeId,
    );

    return modules
      .filter((mod) =>
        mod.content.some(
          (block) =>
            block.type === "materials" &&
            block.items.some((item) => item.title === title),
        ),
      )
      .map((mod) => ({
        programmeId,
        programmeTitle: programme?.title ?? programmeId,
        moduleId: mod.id,
        moduleNumber: mod.number,
        moduleTitle: mod.title,
      }));
  });
}

/** A library row with everything a list needs, so no screen re-derives it. */
export type LibraryEntry = {
  asset: MaterialAsset;
  group: MaterialGroup | undefined;
  uploadedBy: StaffMember | undefined;
  usage: MaterialUsage[];
};

export function library(): LibraryEntry[] {
  return MATERIALS.map((asset) => ({
    asset,
    group: groupById(asset.groupId),
    uploadedBy: uploader(asset),
    usage: usageOf(asset.title),
  })).sort((a, b) => b.asset.uploadedOn.localeCompare(a.asset.uploadedOn));
}

export function libraryEntry(id: string): LibraryEntry | undefined {
  return library().find((entry) => entry.asset.id === id);
}

/** Groups with the two numbers a shelf is judged by: how many, and how used. */
export function groupsWithCounts() {
  const entries = library();

  return MATERIAL_GROUPS.map((group) => {
    const inGroup = entries.filter((entry) => entry.asset.groupId === group.id);
    return {
      group,
      count: inGroup.length,
      attached: inGroup.filter((entry) => entry.usage.length > 0).length,
      modules: new Set(
        inGroup.flatMap((entry) => entry.usage.map((use) => use.moduleId)),
      ).size,
      newest: inGroup
        .map((entry) => entry.asset.uploadedOn)
        .sort()
        .at(-1),
    };
  });
}

export function libraryTotals() {
  const entries = library();
  const unused = entries.filter((entry) => entry.usage.length === 0);

  return {
    files: entries.length,
    groups: MATERIAL_GROUPS.length,
    attachments: entries.reduce((sum, entry) => sum + entry.usage.length, 0),
    unused: unused.length,
    /** Uploaded in the last 30 days, counted against the prototype's "today". */
    recent: entries.filter((entry) => entry.asset.uploadedOn >= "2026-07-16")
      .length,
  };
}

/** Everything one person put on the shelf. Used on an instructor's own pages. */
export function uploadsBy(staffId: string): LibraryEntry[] {
  return library().filter((entry) => entry.asset.uploadedBy === staffId);
}

/**
 * The materials one module attaches, as library entries where the library
 * knows them.
 *
 * A module can attach something that is not in the library - the first
 * forty-two modules were written before the library existed, and their
 * handouts were uploaded straight onto the module. Those come back with
 * `asset: null`, which is not an error state: it is the backlog, and the
 * module management screen shows it as exactly that.
 */
export type AttachedMaterial = {
  title: string;
  kind: string;
  size?: string;
  entry: LibraryEntry | null;
};

export function attachmentsFor(
  programmeId: string,
  moduleId: string,
): AttachedMaterial[] {
  const mod = MODULES[programmeId]?.find((entry) => entry.id === moduleId);
  if (!mod) return [];

  const shelf = library();

  return mod.content
    .filter((block) => block.type === "materials")
    .flatMap((block) =>
      block.items.map((item) => ({
        title: item.title,
        kind: item.kind,
        size: item.size,
        entry: shelf.find((entry) => entry.asset.title === item.title) ?? null,
      })),
    );
}

/**
 * The library flattened for the browser.
 *
 * The picker on a module management screen is a client component, so it cannot
 * import any of this. It gets the shelf as plain objects instead - title,
 * group, size, how many modules use it - which is a few kilobytes, against the
 * whole curriculum if it imported the library itself.
 */
export function pickerData() {
  const shelf = library();

  return {
    materials: shelf.map((entry) => ({
      id: entry.asset.id,
      title: entry.asset.title,
      kind: entry.asset.kind,
      size: entry.asset.size,
      groupId: entry.asset.groupId,
      groupName: entry.group?.name ?? "No group",
      uses: entry.usage.length,
    })),
    groups: MATERIAL_GROUPS.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      count: materialsInGroup(group.id).length,
    })),
  };
}

/* --------------------------------------------------- development-only check */

if (process.env.NODE_ENV !== "production") {
  const warn = (message: string) => console.warn(`[materials] ${message}`);

  const titles = new Map<string, string>();
  for (const asset of MATERIALS) {
    const seen = titles.get(asset.title);
    if (seen) {
      warn(
        `${asset.id} and ${seen} share the title "${asset.title}" - usage cannot be told apart`,
      );
    }
    titles.set(asset.title, asset.id);

    if (!groupById(asset.groupId)) {
      warn(`${asset.id} is in unknown group ${asset.groupId}`);
    }
    if (!staffById(asset.uploadedBy)) {
      warn(`${asset.id} was uploaded by unknown account ${asset.uploadedBy}`);
    }
  }

  for (const group of MATERIAL_GROUPS) {
    if (!staffById(group.createdBy)) {
      warn(`group ${group.id} was created by unknown account ${group.createdBy}`);
    }
  }
}
