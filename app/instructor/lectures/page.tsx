import type { Metadata } from "next";
import Link from "next/link";
import { BODY, CONSOLE, META } from "@/lib/theme";
import { SESSION } from "@/content/staff";
import { lectureLoad, staffById } from "@/lib/admin";
import { attachmentsFor } from "@/lib/materials";
import { formatDate } from "@/lib/portal";
import {
  Badge,
  Cell,
  EmptyState,
  MetricCard,
  NameCell,
  PageBody,
  PageHeader,
  Panel,
  PrototypeNote,
  Row,
  type Column,
} from "@/components/console/ui";
import { Register, type RegisterItem } from "@/components/console/register";
import {
  LECTURE_STATE_LABEL,
  LECTURE_STATE_TONE,
} from "@/components/console/status";

export const metadata: Metadata = { title: "Lectures" };

const COLUMNS: Column[] = [
  { key: "lecture", head: "Lecture" },
  { key: "module", head: "Module", hideBelow: "lg" },
  { key: "state", head: "State" },
  { key: "materials", head: "Materials", numeric: true, hideBelow: "sm" },
  { key: "updated", head: "Last edited", numeric: true, hideBelow: "md" },
  { key: "open", head: "", numeric: true },
];

/**
 * Every lecture this instructor owns, flat.
 *
 * The modules screen groups by module, which is right for "how is that
 * module doing". This one deliberately does not, because the other question
 * an author asks is "what have I not finished", and that question does not
 * care which module the answer is in. Filtering by state is the whole
 * point of the screen.
 */
export default function InstructorLecturesPage() {
  const member = staffById(SESSION.instructor);
  if (!member) throw new Error("[instructor] no session account");

  const load = lectureLoad(member);

  const items: RegisterItem[] = load.lectures.map((mod) => {
    const href = `/instructor/modules/${mod.module.id}/lectures/${mod.id}`;
    const attachments = mod.hasContent
      ? attachmentsFor(mod.module.id, mod.id)
      : [];

    return {
      id: `${mod.module.id}-${mod.id}`,
      text: [mod.title, mod.number, mod.module.title]
        .join(" ")
        .toLowerCase(),
      tags: [mod.state, mod.module.id],
      row: (
        <Row href={href}>
          <NameCell
            href={href}
            title={`${mod.number}. ${mod.title}`}
            subtitle={mod.hasContent ? undefined : "Nothing written yet"}
          />
          <Cell hideBelow="lg">{mod.module.title}</Cell>
          <Cell>
            <Badge tone={LECTURE_STATE_TONE[mod.state]}>
              {LECTURE_STATE_LABEL[mod.state]}
            </Badge>
          </Cell>
          <Cell numeric hideBelow="sm">
            {mod.hasContent ? attachments.length : "-"}
          </Cell>
          <Cell numeric hideBelow="md">
            {mod.updatedOn ? formatDate(mod.updatedOn) : "-"}
          </Cell>
          <Cell numeric>
            <Link href={href} className="link-wipe text-sm font-semibold text-primary">
              {mod.hasContent ? "Manage" : "Start writing"}
            </Link>
          </Cell>
        </Row>
      ),
    };
  });

  const count = (state: string) =>
    load.lectures.filter((mod) => mod.state === state).length;

  return (
    <PageBody>
      <PageHeader
        eyebrow="Teaching"
        title="Lectures"
        lead="Everything you write, across every module you are assigned to. Filter by state to see what is still outstanding."
        actions={
          <Link href="/instructor/materials" className="btn-ripple btn-solid btn-sm">
            <span aria-hidden="true" className="btn-wave" />
            <span className="btn-label">The materials library</span>
          </Link>
        }
      />

      {load.lectures.length ? (
        <>
          <div className={`${CONSOLE.stack} grid gap-4 sm:grid-cols-2 xl:grid-cols-4`}>
            <MetricCard
              label="Lectures"
              value={load.lectures.length}
              hint="across your modules"
            />
            <MetricCard
              label="Published"
              value={load.published}
              hint="live for learners"
            />
            <MetricCard
              label="In review"
              value={load.inReview}
              hint="waiting on somebody else"
            />
            <MetricCard
              label="Unwritten"
              value={load.unwritten}
              hint="not started or still drafting"
              goodWhen="down"
            />
          </div>

          <div className={CONSOLE.stack}>
            <Register
              columns={COLUMNS}
              caption="Lectures you write"
              items={items}
              searchPlaceholder="Search your lectures"
              filters={[
                { value: "all", label: "All", count: load.lectures.length },
                { value: "published", label: "Published", count: count("published") },
                { value: "in-review", label: "In review", count: count("in-review") },
                { value: "draft", label: "Draft", count: count("draft") },
                {
                  value: "not-started",
                  label: "Not started",
                  count: count("not-started"),
                },
              ]}
              selectFilter={
                load.modules.length > 1
                  ? {
                      label: "Module",
                      placeholder: "Every module",
                      options: load.modules.map((mdl) => ({
                        value: mdl.id,
                        label: mdl.title,
                      })),
                    }
                  : undefined
              }
              emptyMessage="No lecture matches that."
            />
          </div>

          <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-2`}>
            <Panel>
              <h2 className="font-display text-2xl tracking-tight text-ink">
                What a lecture needs before it publishes
              </h2>
              <ul className="mt-4 space-y-2.5">
                {[
                  "A video or a piece of reading, and the argument written out.",
                  "Whatever the learner takes away - attached from the library rather than uploaded twice.",
                  "Four questions, each with the explanation a learner reads afterwards.",
                  "A study time that keeps the module's total honest.",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent"
                    />
                    <span className={BODY.base}>{line}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel>
              <h2 className="font-display text-2xl tracking-tight text-ink">
                Draft, in review, published
              </h2>
              <p className={`mt-3 ${BODY.base}`}>
                You can publish a lecture yourself. Moving it to{" "}
                <span className="font-semibold text-ink">in review</span> instead
                puts it in front of an administrator, which is worth doing for
                anything that makes a claim about policy or money.
              </p>
              <p className={`mt-3 ${META.base}`}>
                Nothing in a draft module is visible to a learner whatever
                state its lectures are in.
              </p>
              <PrototypeNote className="mt-5" />
            </Panel>
          </div>
        </>
      ) : (
        <div className={CONSOLE.stack}>
          <EmptyState
            title="No lectures yet"
            body="An administrator assigns modules to instructors. Once one is assigned, its lectures appear here."
          />
        </div>
      )}
    </PageBody>
  );
}
