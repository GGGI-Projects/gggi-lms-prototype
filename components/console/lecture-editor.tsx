import Link from "next/link";
import type { ReactNode } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { BODY, CONSOLE, HEADING, META } from "@/lib/theme";
import type { ContentBlock, Lecture } from "@/content/curriculum";
import type { QuizStats } from "@/content/operations";
import { quizNeedsAttention, type ConsoleLecture } from "@/lib/admin";
import type { AttachedMaterial } from "@/lib/materials";
import { formatDate, formatDuration } from "@/lib/portal";
import {
  Badge,
  Callout,
  DefinitionList,
  MetricCard,
  Panel,
  PrototypeNote,
} from "@/components/console/ui";
import { ConfirmAction, StateControl } from "@/components/console/actions";
import { AttachLectureMaterials } from "@/components/console/attach-materials-action";
import {
  AddContentBlockActions,
  EditContentBlockAction,
  RemoveContentBlockAction,
} from "@/components/console/content-block-actions";
import type {
  PickerGroup,
  PickerMaterial,
} from "@/components/console/material-actions";
import { KindMark, KIND_LABEL, type LibraryKindKey } from "@/components/console/material-parts";
import { IfCan, LockedNote } from "@/components/console/permission";
import { LECTURE_STATE_LABEL, LECTURE_STATE_TONE } from "@/components/console/status";
import {
  ArrowRightIcon,
  ClockIcon,
  ReadingIcon,
  VideoIcon,
} from "@/components/student-portal/icons";
import { ExternalIcon, PlusIcon } from "@/components/console/icons";

/**
 * Managing a lecture.
 *
 * ONE COMPONENT FOR TWO CONSOLES. An administrator opening a lecture and the
 * instructor who wrote it need the same screen; the only differences are which
 * capability the controls are gated on and where the links go, and both arrive
 * as props. Two copies would have diverged by the second change.
 *
 * THREE THINGS IN ORDER, because that is the order they are worked on:
 *
 *   1. CONTENT - the video and the argument, shown close to how a learner
 *      meets it. The question an author has is "does this read properly", and
 *      a page of textareas cannot answer it.
 *   2. MATERIALS - what the learner takes away, attached FROM THE SHARED
 *      LIBRARY rather than uploaded here. That is the whole reason the library
 *      exists: the unit cost table is one file used by four lectures, not four
 *      files that were the same in March.
 *   3. THE QUIZ - summarised, with its results, and edited on its own screen.
 *      Four questions with four options and an explanation each is a page in
 *      its own right, and burying it at the bottom of this one is how quizzes
 *      go unrevised for a year.
 *
 * The prototype carries no rich text editor. What it carries is the shape of
 * the screen one would live in, and every control says so.
 */
export function LectureEditor({
  module: mdl,
  mod,
  content,
  attachments,
  picker,
  quiz,
  hrefs,
  capability,
}: {
  module: { id: string; title: string; status: string };
  mod: ConsoleLecture;
  /** The written lecture, or null for one that is still only a plan. */
  content: Lecture | null;
  attachments: AttachedMaterial[];
  picker: { materials: PickerMaterial[]; groups: PickerGroup[] };
  quiz: { questions: number; stats: QuizStats | null; passMark: number };
  hrefs: {
    module: string;
    quiz: string;
    materials: string;
    /** One library entry, by id. */
    material: (id: string) => string;
    /** Where a learner reads this. Absent when it is not published. */
    learner?: string;
  };
  /** What a role needs to change anything here. */
  capability: "manageModules" | "authorLectures";
}) {
  return (
    <div className={`${CONSOLE.stack} grid gap-4 lg:grid-cols-3`}>
      <div className="min-w-0 space-y-10 lg:col-span-2">
        {/* -------------------------------------------------------- content */}
        {content ? (
          <EditorSection
            index={1}
            title="Content"
            description="In the order a learner meets it. Each block is a separate thing to write, and their order is the lecture's argument."
          >
            <ol className="space-y-4">
              {content.content
                .filter((block) => block.type !== "materials")
                .map((block, index) => (
                  <li key={`${block.type}-${index}`}>
                    <BlockCard
                      block={block}
                      index={index}
                      capability={capability}
                    />
                  </li>
                ))}
            </ol>

            <div className="mt-4">
              <AddContentBlockActions capability={capability} />
            </div>
          </EditorSection>
        ) : (
          <EditorSection
            index={1}
            title="Content"
            description="Nothing has been written for this lecture yet."
          >
            <div className="rounded-sm border border-dashed border-muted-light bg-paper-raised px-8 py-14 text-center">
              <p className="font-display text-2xl tracking-tight text-ink">
                An empty lecture
              </p>
              <p className={`measure mx-auto mt-3 ${BODY.base}`}>
                A lecture is a short list of blocks: a video or a piece of
                reading, the argument written out, and whatever the learner
                should take away with them. Start with whichever one you have -
                and for the last of those, look on the shelf before uploading
                anything.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-sm border border-surface-deep bg-paper px-4 py-2.5 text-lg text-ink-soft">
                  <PlusIcon className="size-4" />
                  Video
                </span>
                <span className="inline-flex items-center gap-2 rounded-sm border border-surface-deep bg-paper px-4 py-2.5 text-lg text-ink-soft">
                  <PlusIcon className="size-4" />
                  Written section
                </span>
                <Link
                  href={hrefs.materials}
                  className="inline-flex items-center gap-2 rounded-sm border border-surface-deep bg-paper px-4 py-2.5 text-lg text-primary"
                >
                  <PlusIcon className="size-4" />
                  <span className="link-wipe">Attach from the library</span>
                </Link>
              </div>
              <PrototypeNote className="mt-8 justify-center">
                The authoring tools themselves are out of scope for this
                prototype - this is the screen they would live in.
              </PrototypeNote>
            </div>
          </EditorSection>
        )}

        {/* ------------------------------------------------------ materials */}
        <EditorSection
          index={2}
          title="Attached materials"
          description="What the learner downloads. Everything here comes off the shared library, so one file can serve six lectures and be replaced once."

        >
          {attachments.length ? (
            <ul className="divide-y divide-surface-deep rounded-sm border border-surface-deep bg-paper-raised">
              {attachments.map((item) => (
                <li key={item.title} className="flex items-center gap-4 px-5 py-3.5">
                  <KindMark kind={item.kind} className="size-9" />

                  <div className="min-w-0 flex-1">
                    {item.entry ? (
                      <Link
                        href={hrefs.material(item.entry.asset.id)}
                        className="block truncate text-lg font-semibold text-ink"
                      >
                        <span className="link-wipe">{item.title}</span>
                      </Link>
                    ) : (
                      <p className="truncate text-lg font-semibold text-ink">
                        {item.title}
                      </p>
                    )}
                    <p className={`mt-0.5 truncate ${META.base}`}>
                      {KIND_LABEL[item.kind as LibraryKindKey] ?? item.kind}
                      {item.size ? ` · ${item.size}` : null}
                      {item.entry
                        ? ` · ${item.entry.group?.name ?? "no group"} · used by ${item.entry.usage.length} ${item.entry.usage.length === 1 ? "lecture" : "lectures"}`
                        : " · uploaded straight onto this lecture"}
                    </p>
                  </div>

                  {item.entry ? (
                    <Badge tone="done">In the library</Badge>
                  ) : (
                    <Badge tone="warn">Not on a shelf</Badge>
                  )}

                  <IfCan capability={capability}>
                    <span className="shrink-0 text-sm font-semibold text-clay">
                      Remove
                    </span>
                  </IfCan>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`rounded-sm border border-dashed border-muted-light bg-paper-raised px-6 py-10 text-center ${BODY.base}`}>
              Nothing attached yet.
            </p>
          )}

          <div className="mt-6">
            <AttachLectureMaterials
              materials={picker.materials}
              groups={picker.groups}
              attached={attachments.map((item) => item.title)}
              uploadHref={`${hrefs.materials}#upload`}
              capability={capability}
            />
          </div>
        </EditorSection>

        {/* ----------------------------------------------------------- quiz */}
        <EditorSection
          index={3}
          title="Lecture quiz"
          description={`${quiz.questions ? `${quiz.questions} questions` : "No questions"} close this lecture. The pass mark is ${quiz.passMark}% and is set once for the whole platform.`}
          action={
            quiz.questions ? (
              <ActionButton href={hrefs.quiz} variant="line" size="sm">
                Manage the quiz
                <ArrowRightIcon className="size-4" />
              </ActionButton>
            ) : null
          }
        >
          {quiz.questions ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard
                label="Questions"
                value={quiz.questions}
                hint={`${quiz.passMark}% to pass`}
              />
              <MetricCard
                label="Attempts"
                value={quiz.stats ? quiz.stats.attempts : "-"}
                hint={quiz.stats ? "learners who submitted" : "no figures yet"}
              />
              <MetricCard
                label="Pass rate"
                value={quiz.stats ? `${quiz.stats.passRate}%` : "-"}
                hint={
                  quiz.stats
                    ? `averaging ${quiz.stats.averageScore}%`
                    : "no figures yet"
                }
                goodWhen="up"
              />
            </div>
          ) : (
            <p className={`rounded-sm border border-dashed border-muted-light bg-paper-raised px-6 py-10 text-center ${BODY.base}`}>
              A quiz is written once the lecture has content.
            </p>
          )}

          {quizNeedsAttention(quiz.stats) && quiz.stats ? (
            <div className="mt-4">
              <Callout title="This quiz is sending people back">
                {quiz.stats.passRate}% pass it, averaging{" "}
                {quiz.stats.averageScore}% across {quiz.stats.attempts}{" "}
                attempts. When the lectures either side of one are fine, it is
                usually a question that is wrong rather than a cohort that is
                weak.{" "}
                <Link href={hrefs.quiz} className="link-wipe font-semibold text-primary">
                  Read the questions
                </Link>
                .
              </Callout>
            </div>
          ) : null}
        </EditorSection>
      </div>

      {/* --------------------------------------------------------- sidebar */}
      <aside className="min-w-0 space-y-4">
        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">
            Publication
          </h2>
          <p className={`mt-2 ${BODY.base}`}>
            Only published lectures appear in a learner&rsquo;s contents list.
          </p>

          <div className="mt-6">
            <IfCan
              capability={capability}
              fallback={<LockedNote capability={capability} />}
            >
              <StateControl
                subject={`lecture ${mod.number}`}
                current={mod.state}
                states={[
                  {
                    value: "published",
                    label: "Published",
                    description: "Live. Learners can open it now.",
                  },
                  {
                    value: "in-review",
                    label: "In review",
                    description:
                      "Finished, waiting for somebody else to read it before it goes live.",
                  },
                  {
                    value: "draft",
                    label: "Draft",
                    description:
                      "Being written. Nobody outside the console sees it.",
                  },
                ]}
              />
            </IfCan>
          </div>
        </Panel>

        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">Lecture</h2>
          <DefinitionList
            className="mt-5"
            items={[
              {
                term: "Module",
                value: (
                  <Link href={hrefs.module} className="link-wipe text-primary">
                    {mdl.title}
                  </Link>
                ),
              },
              { term: "Position", value: `Lecture ${mod.number}` },
              {
                term: "State",
                value: (
                  <Badge tone={LECTURE_STATE_TONE[mod.state]}>
                    {LECTURE_STATE_LABEL[mod.state]}
                  </Badge>
                ),
              },
              {
                term: "Author",
                value: mod.author ? mod.author.name : "Nobody recorded",
              },
              {
                term: "Last updated",
                value: mod.updatedOn ? formatDate(mod.updatedOn) : "Never",
              },
              {
                term: "Study time",
                value: content ? formatDuration(content.minutes) : "-",
              },
              { term: "Attachments", value: attachments.length },
            ]}
          />

          {hrefs.learner ? (
            <Link
              href={hrefs.learner}
              className="mt-5 inline-flex items-center gap-1.5 text-lg font-semibold text-primary"
            >
              <ExternalIcon className="size-4" />
              <span className="link-wipe">Open as a learner sees it</span>
            </Link>
          ) : null}
        </Panel>

        {content ? (
          <Panel>
            <h2 className="font-display text-2xl tracking-tight text-ink">
              What it teaches
            </h2>
            <p className={`mt-2 ${BODY.base}`}>{content.summary}</p>
            <ul className="mt-5 space-y-2.5">
              {content.objectives.map((objective) => (
                <li key={objective} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span className={BODY.base}>{objective}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        <Panel>
          <h2 className="font-display text-2xl tracking-tight text-ink">Remove</h2>
          <p className={`mt-2 ${BODY.base}`}>
            Deleting a lecture renumbers the ones after it and removes it from
            the progress of everybody part-way through the module. Files it
            attaches stay on their shelves.
          </p>
          <div className="mt-6">
            <IfCan
              capability={capability}
              fallback={<LockedNote capability={capability} />}
            >
              <ConfirmAction
                label="Delete this lecture"
                question={`Delete lecture ${mod.number}, ${mod.title}?`}
                detail="The material and its quiz go with it. Learners who had finished it lose that completion."
                confirmLabel="Delete the lecture"
                done="Prototype - the lecture is unchanged."
              />
            </IfCan>
          </div>
          <PrototypeNote className="mt-6" />
        </Panel>
      </aside>
    </div>
  );
}

/* ---------------------------------------------------------------- sections */

/**
 * One of this screen's three steps - content, materials, quiz - boxed and
 * numbered rather than left to sit on the page and be told apart by a
 * heading and some air.
 *
 * `<Section>` elsewhere in the console gets away with that because most of
 * those screens hold one list. This one holds three, each already busy with
 * its own cards (a block, a material row, a metric), and three busy lists in
 * a row read as one long page rather than three steps unless something marks
 * where each begins. A bordered tray with its own number is that mark - the
 * same reason a block inside it is labelled "Block 1" rather than left to its
 * position alone.
 *
 * THE TRAY IS `surface`, NOT `paper-raised`, and that is the whole trick: the
 * cards inside - block cards, the material list, metric cards - are all
 * `paper-raised`. Boxing this in the same tone would stack white on white and
 * lose the very separation it exists to add; a step down in the palette
 * (`surface` sits between `paper` and `surface-deep`) is what lets a raised
 * card read as raised.
 */
function EditorSection({
  index,
  title,
  description,
  action,
  children,
}: {
  index: number;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-sm border border-surface-deep bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-surface-deep bg-paper-raised font-display text-lg font-bold text-primary"
          >
            {index}
          </span>
          <div className="min-w-0">
            <h2 className={HEADING.card}>{title}</h2>
            <p className={`measure-wide mt-2 ${BODY.base}`}>{description}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ blocks */

/**
 * One block, rendered as what it is.
 *
 * The kind mark sits at the top left of every card in the same place, so the
 * shape of a lecture - video, then argument - is readable down the left edge
 * rather than by reading three headings.
 */
function BlockCard({
  block,
  index,
  capability,
}: {
  block: ContentBlock;
  index: number;
  capability: "manageModules" | "authorLectures";
}) {
  if (block.type === "materials") return null;

  const heading = block.type === "video" ? block.title : block.heading;
  const Icon = block.type === "video" ? VideoIcon : ReadingIcon;

  return (
    <article className="rounded-sm border border-surface-deep bg-paper-raised p-6">
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-sm bg-surface text-ink-soft"
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className={`${META.base} capitalize`}>
            Block {index + 1} · {block.type}
          </p>
          <h3 className="mt-0.5 font-display text-xl leading-snug tracking-tight text-ink">
            {heading}
          </h3>
        </div>
      </div>

      {block.type === "video" ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge icon={<ClockIcon className="size-3.5" />}>
              {block.minutes} min
            </Badge>
            <Badge tone="neutral">No file attached in the prototype</Badge>
          </div>
          <p className={`mt-3 ${BODY.base}`}>{block.caption}</p>
        </div>
      ) : (
        <p className={`measure-wide mt-4 ${BODY.base}`}>{block.body}</p>
      )}

      {/* A row of its own, not tucked beside the title - `<RemoveContentBlockAction>`
          can expand into a full confirmation panel, and a panel that size has
          nowhere safe to grow inside a header row shared with the heading. */}
      <IfCan capability={capability}>
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-surface-deep pt-4">
          <EditContentBlockAction block={block} capability={capability} />
          <RemoveContentBlockAction block={block} capability={capability} />
        </div>
      </IfCan>
    </article>
  );
}

/** The banner a lecture inside an unpublished module carries. */
export function DraftLectureNotice({ module: mdl }: { module: string }) {
  return (
    <Callout tone="info" title="Not published">
      Nothing on this page is visible to a learner. {mdl} stays hidden
      from the catalogue until its lectures are written and published.
    </Callout>
  );
}
