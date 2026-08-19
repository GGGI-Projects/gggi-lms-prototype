/**
 * The three library screens, written once for both consoles.
 *
 * `/admin/materials` and `/lecturer/materials` are the same shelf, so they
 * are the same components - see the note in `material-parts.tsx`. Each route
 * hands in its `area`, which decides two things and nothing else: where a
 * "used in" link points, and which capability the upload form is gated on.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { MATERIAL_GROUPS } from "@/content/materials";
import {
  groupById,
  library,
  libraryEntry,
  libraryTotals,
  groupsWithCounts,
  materialsInGroup,
  usageOf,
} from "@/lib/materials";
import { formatDate, formatDateLong } from "@/lib/portal";
import type { ConsoleArea } from "@/components/console/nav";
import {
  Badge,
  Callout,
  DefinitionList,
  MetricCard,
  PageBody,
  PageHeader,
  Panel,
  PrototypeNote,
  Section,
} from "@/components/console/ui";
import {
  GroupCard,
  KindMark,
  KIND_LABEL,
  MaterialRow,
  UsageList,
  type LibraryKindKey,
} from "@/components/console/material-parts";
import { MaterialShelf } from "@/components/console/material-shelf";
import { NewMaterialAction } from "@/components/console/new-material-action";
import { AddGroupAction, EditGroupAction } from "@/components/console/group-actions";
import { DownloadIcon } from "@/components/student-portal/icons";
import { ExternalIcon } from "@/components/console/icons";

/** Where a lecture lives, per console. The one thing the two areas disagree on. */
function lectureHrefFor(area: ConsoleArea) {
  return (moduleId: string, lectureId: string) =>
    area === "admin"
      ? `/admin/modules/${moduleId}/lectures/${lectureId}`
      : `/lecturer/modules/${moduleId}/lectures/${lectureId}`;
}

/* ----------------------------------------------------------------- library */

export function MaterialsLibrary({ area }: { area: ConsoleArea }) {
  const entries = library();
  const totals = libraryTotals();
  const shelves = groupsWithCounts();

  return (
    <PageBody>
      <PageHeader
        eyebrow={area === "admin" ? "Learning" : "Teaching"}
        title="Materials"
        lead="One shelf for the whole platform. Anything here can be attached to any lecture by anybody who writes one - which is the point: the unit cost table should exist once, with one date on it, not four times in four lectures."
      />

      <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <MetricCard label="Files" value={totals.files} hint="on the shelf" />
        <MetricCard label="Groups" value={totals.groups} hint="subject shelves" />
        <MetricCard
          label="Attachments"
          value={totals.attachments}
          hint="times a lecture uses one"
        />
        <MetricCard
          label="Never used"
          value={totals.unused}
          hint="uploaded, not attached to anything"
          goodWhen="down"
        />
      </div>

      <Section
        title="Groups"
        description="A group is a subject shelf, not an owner. Anybody may use anything on any of them, and a lecture can take a whole shelf in one go."
        action={<AddGroupAction area={area} />}
        className={CONSOLE.stack}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shelves.map((shelf) => (
            <GroupCard
              key={shelf.group.id}
              href={`/${area}/materials/groups/${shelf.group.id}`}
              name={shelf.group.name}
              description={shelf.group.description}
              count={shelf.count}
              attached={shelf.attached}
              lectures={shelf.lectures}
              newest={shelf.newest}
            />
          ))}
        </div>
      </Section>

      <Section
        title="Everything on the shelf"
        description="Newest first. Search matches the title, the group and the person who uploaded it."
        className={CONSOLE.stack}
      >
        <MaterialShelf
          area={area}
          entries={entries.map((entry) => ({
            id: entry.asset.id,
            title: entry.asset.title,
            description: entry.asset.description,
            kind: entry.asset.kind,
            size: entry.asset.size,
            groupId: entry.asset.groupId,
            groupName: entry.group?.name ?? "No group",
            uploadedBy: entry.uploadedBy?.name ?? "Unknown",
            uploadedOn: entry.asset.uploadedOn,
            uses: entry.usage.length,
            language: entry.asset.language,
          }))}
          groups={MATERIAL_GROUPS.map((group) => ({
            id: group.id,
            name: group.name,
            count: materialsInGroup(group.id).length,
          }))}
          action={
            <NewMaterialAction
              area={area}
              groups={MATERIAL_GROUPS.map((group) => ({
                id: group.id,
                name: group.name,
                description: group.description,
                count: materialsInGroup(group.id).length,
              }))}
            />
          }
        />
      </Section>

      <PrototypeNote className="mt-6">
        No file is stored and nothing downloads. The library&rsquo;s structure -
        shelves, usage, who uploaded what - is real; the files behind it are
        not.
      </PrototypeNote>
    </PageBody>
  );
}

/* ------------------------------------------------------------------- group */

export function MaterialGroupPage({
  area,
  groupId,
}: {
  area: ConsoleArea;
  groupId: string;
}) {
  const group = groupById(groupId);
  if (!group) notFound();

  const entries = library().filter((entry) => entry.asset.groupId === groupId);
  const attached = entries.filter((entry) => entry.usage.length > 0).length;
  const lectures = new Set(
    entries.flatMap((entry) => entry.usage.map((use) => use.lectureId)),
  ).size;

  return (
    <PageBody>
      <PageHeader
        back={{ href: `/${area}/materials`, label: "Materials" }}
        eyebrow="Material group"
        title={group.name}
        lead={group.description}
        meta={
          <>
            <Badge>{entries.length} files</Badge>
            <Badge tone={attached ? "done" : "neutral"}>
              {attached} in use
            </Badge>
            <Badge>Opened {formatDate(group.createdOn)}</Badge>
          </>
        }
        actions={<EditGroupAction group={group} area={area} />}
      />

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 lg:col-span-2">
          <div className="overflow-hidden rounded-sm border border-surface-deep bg-paper-raised">
            <ul className="divide-y divide-surface-deep">
              {entries.map((entry) => (
                <li key={entry.asset.id}>
                  <MaterialRow
                    entry={entry}
                    href={`/${area}/materials/${entry.asset.id}`}
                  />
                </li>
              ))}
            </ul>
          </div>

          {!entries.length ? (
            <p className={`rounded-sm border border-dashed border-muted-light bg-paper-raised px-6 py-12 text-center ${BODY.base}`}>
              This shelf is empty.
            </p>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-4">
          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              This shelf
            </h2>
            <DefinitionList
              className="mt-5"
              items={[
                { term: "Files", value: entries.length },
                { term: "Used by lectures", value: lectures },
                { term: "Opened", value: formatDateLong(group.createdOn) },
              ]}
            />
            <p className={`mt-5 ${BODY.base}`}>
              A lecture can attach this whole shelf in one action from its own
              management screen. That copies the files across as they are now -
              anything added here afterwards does not appear in that lecture by
              itself.
            </p>
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Add to this shelf
            </h2>
            <p className={`mt-2 ${BODY.base}`}>
              Uploads go to the library first and are picked up by lectures
              afterwards.
            </p>
            <Link
              href={`/${area}/materials#upload`}
              className="mt-4 inline-block text-lg font-semibold text-primary"
            >
              <span className="link-wipe">Upload a file</span>
            </Link>
          </Panel>
        </aside>
      </div>
    </PageBody>
  );
}

/* ---------------------------------------------------------------- one file */

export function MaterialDetail({
  area,
  materialId,
}: {
  area: ConsoleArea;
  materialId: string;
}) {
  const entry = libraryEntry(materialId);
  if (!entry) notFound();

  const { asset, group, uploadedBy } = entry;
  const alsoInGroup = materialsInGroup(asset.groupId).filter(
    (other) => other.id !== asset.id,
  );

  return (
    <PageBody>
      <PageHeader
        back={{ href: `/${area}/materials`, label: "Materials" }}
        eyebrow={group?.name ?? "Material"}
        title={asset.title}
        lead={asset.description}
        meta={
          <>
            <Badge>{KIND_LABEL[asset.kind as LibraryKindKey] ?? asset.kind}</Badge>
            {asset.size ? <Badge>{asset.size}</Badge> : null}
            {asset.language && asset.language !== "English" ? (
              <Badge tone="info">{asset.language}</Badge>
            ) : null}
            <Badge tone={entry.usage.length ? "done" : "warn"}>
              {entry.usage.length
                ? `Used by ${entry.usage.length} ${entry.usage.length === 1 ? "lecture" : "lectures"}`
                : "Not used"}
            </Badge>
          </>
        }
        actions={
          <span className="btn-ripple btn-solid btn-sm">
            <span aria-hidden="true" className="btn-wave" />
            <span className="btn-label">
              <DownloadIcon className="size-4" />
              Download
            </span>
          </span>
        }
      />

      {!entry.usage.length ? (
        <div className={CONSOLE.stack}>
          <Callout tone="info" title="Nothing attaches this yet">
            Uploaded {formatDateLong(asset.uploadedOn)} and never used. Attach
            it from a lecture&rsquo;s management screen, or remove it - a shelf
            of files nobody uses is how a library stops being searched.
          </Callout>
        </div>
      ) : null}

      <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
        <div className="min-w-0 space-y-10 lg:col-span-2">
          <Section
            title="Where it is used"
            description="Found in the lectures themselves, not recorded here - so this list cannot claim a lecture that does not attach it."
          >
            <Panel>
              <UsageList entry={entry} lectureHref={lectureHrefFor(area)} />
            </Panel>
          </Section>

          {alsoInGroup.length ? (
            <Section
              title={`Also on the ${group?.name ?? "same"} shelf`}
              action={
                <Link
                  href={`/${area}/materials/groups/${asset.groupId}`}
                  className="link-wipe text-lg font-semibold text-primary"
                >
                  The whole shelf
                </Link>
              }
            >
              <ul className="divide-y divide-surface-deep rounded-sm border border-surface-deep bg-paper-raised">
                {alsoInGroup.slice(0, 5).map((other) => (
                  <li key={other.id} className="flex items-center gap-4 px-5 py-3.5">
                    <KindMark kind={other.kind} className="size-9" />
                    <Link
                      href={`/${area}/materials/${other.id}`}
                      className="min-w-0 flex-1 truncate text-lg text-ink"
                    >
                      <span className="link-wipe">{other.title}</span>
                    </Link>
                    <span className={`shrink-0 ${META.base}`}>
                      {usageOf(other.title).length || "0"} uses
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-4">
          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              The file
            </h2>
            <DefinitionList
              className="mt-5"
              items={[
                {
                  term: "Type",
                  value: KIND_LABEL[asset.kind as LibraryKindKey] ?? asset.kind,
                },
                { term: "Size", value: asset.size ?? "-" },
                { term: "Language", value: asset.language ?? "English" },
                {
                  term: "Group",
                  value: group ? (
                    <Link
                      href={`/${area}/materials/groups/${group.id}`}
                      className="link-wipe text-primary"
                    >
                      {group.name}
                    </Link>
                  ) : (
                    "-"
                  ),
                },
                {
                  term: "Uploaded",
                  value: formatDateLong(asset.uploadedOn),
                },
                {
                  term: "Uploaded by",
                  value:
                    uploadedBy && area === "admin" ? (
                      <Link
                        href={
                          uploadedBy.role === "lecturer"
                            ? `/admin/lecturers/${uploadedBy.id}`
                            : "/admin/team"
                        }
                        className="link-wipe text-primary"
                      >
                        {uploadedBy.name}
                      </Link>
                    ) : (
                      (uploadedBy?.name ?? "Unknown")
                    ),
                },
                { term: "Reference", value: asset.id },
              ]}
            />
          </Panel>

          {asset.source ? (
            <Panel>
              <h2 className="font-display text-2xl tracking-tight text-ink">
                Where it came from
              </h2>
              <p className={`mt-3 ${BODY.base}`}>{asset.source}</p>
            </Panel>
          ) : null}

          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              Replacing it
            </h2>
            <p className={`mt-3 ${BODY.base}`}>
              Upload a new version rather than a new file, and every lecture
              using it gets the update. A second file with a year in the title
              is how two versions end up in circulation.
            </p>
            <Link
              href={`/${area}/materials#upload`}
              className="mt-4 inline-flex items-center gap-1.5 text-lg font-semibold text-primary"
            >
              <ExternalIcon className="size-4" />
              <span className="link-wipe">Upload a new version</span>
            </Link>
            <PrototypeNote className="mt-6" />
          </Panel>
        </aside>
      </div>
    </PageBody>
  );
}
