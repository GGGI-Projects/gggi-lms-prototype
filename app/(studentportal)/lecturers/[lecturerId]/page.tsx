import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Avatar,
  Badge,
  PageBody,
  PageHeader,
  Panel,
  Section,
} from "@/components/student-portal/ui";
import { LecturerReviewForm } from "@/components/student-portal/lecturer-review-form";
import { CheckIcon, StarFilledIcon } from "@/components/student-portal/icons";
import {
  lecturerRating,
  lecturers,
  learnerCompletedLectureBy,
  publishedLecturesBy,
  reviewsForLecturer,
  staffById,
  studentById,
} from "@/lib/admin";
import { messageContactsForStudent } from "@/lib/comms";
import { ComposeMessageAction } from "@/components/notifications/compose-message";
import { LEARNER } from "@/content/portal";
import { formatDate } from "@/lib/portal";
import { BODY, EYEBROW, HEADING, META } from "@/lib/theme";

type Params = { params: Promise<{ lecturerId: string }> };

export function generateStaticParams() {
  return lecturers().map((member) => ({ lecturerId: member.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lecturerId } = await params;
  const member = staffById(lecturerId);
  if (!member || member.role !== "lecturer") return { title: "Lecturer not found" };
  return { title: member.name, description: member.profile?.bio };
}

/**
 * A lecturer, as a learner sees them.
 *
 * REACHED FROM A LECTURE, not the other way round - see the byline on the
 * lecture page. There is deliberately no directory of lecturers to browse:
 * the platform introduces you to a lecturer once you are already reading
 * something they wrote, the same way a byline works in print.
 *
 * THE CREDENTIALS ARE THE ANSWER TO "WHY SHOULD I LISTEN TO THIS PERSON",
 * shown before the lecture list rather than after it - a learner deciding
 * whether to trust a lecturer reads the qualifications and the experience
 * first, and the list of what they have written second.
 *
 * REVIEWING IS GATED BY HAVING ACTUALLY FINISHED SOMETHING THEY WROTE, the
 * same rule a module review follows from a certificate - see
 * `learnerCompletedLectureBy()` in `lib/admin.ts`. A learner who has not is
 * shown exactly what stands between them and being able to, not a hidden
 * form or a vague "sign in to review".
 */
export default async function LecturerProfilePage({ params }: Params) {
  const { lecturerId } = await params;
  const member = staffById(lecturerId);
  if (!member || member.role !== "lecturer") notFound();

  const profile = member.profile;
  const lectures = publishedLecturesBy(member.id);
  const rating = lecturerRating(member.id);
  const reviews = reviewsForLecturer(member.id).filter(
    (review) => review.status === "published",
  );
  const canReview = learnerCompletedLectureBy(member.id);
  const student = studentById(LEARNER.id);
  const messageContacts = student ? messageContactsForStudent(student) : [];
  const canMessage = messageContacts.some((contact) => contact.id === member.id);

  return (
    <PageBody>
      <PageHeader
        eyebrow={member.title}
        title={member.name}
        lead={profile?.bio}
        actions={
          canMessage ? (
            <ComposeMessageAction
              contacts={messageContacts}
              preselectedId={member.id}
              buttonLabel="Message this lecturer"
              drawerTitle={`Message ${member.name}`}
            />
          ) : undefined
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {rating ? (
          <Badge icon={<StarFilledIcon className="size-3.5" />}>
            {rating.average.toFixed(1)} from {rating.count}{" "}
            {rating.count === 1 ? "review" : "reviews"}
          </Badge>
        ) : (
          <Badge tone="neutral">No reviews yet</Badge>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          {profile ? (
            <div className="space-y-10">
              <CredentialSection
                title="Qualifications"
                empty="Nothing recorded yet."
                items={profile.qualifications.map((entry) => ({
                  key: entry.id,
                  title: entry.qualification,
                  detail: [entry.institution, entry.year].filter(Boolean).join(" · "),
                }))}
              />

              <CredentialSection
                title="Experience"
                empty="Nothing recorded yet."
                items={profile.experience.map((entry) => ({
                  key: entry.id,
                  title: entry.role,
                  detail: [entry.organisation, entry.period].filter(Boolean).join(" · "),
                  note: entry.description,
                }))}
              />

              <CredentialSection
                title="Publications"
                empty="Nothing recorded yet."
                items={profile.publications.map((entry) => ({
                  key: entry.id,
                  title: entry.title,
                  detail: [entry.publisher, entry.year].filter(Boolean).join(" · "),
                  href: entry.url,
                }))}
              />

              <CredentialSection
                title="Achievements"
                empty="Nothing recorded yet - most lecturers build this out over time."
                items={profile.achievements.map((entry) => ({
                  key: entry.id,
                  title: entry.title,
                  detail: entry.year,
                  note: entry.description,
                }))}
              />
            </div>
          ) : null}

          <Section
            className="mt-12"
            title={`Written by ${member.name.split(" ")[0]}`}
            description="Every published lecture, across every module they teach."
          >
            {lectures.length ? (
              <div className="overflow-hidden rounded-sm border border-surface-deep bg-paper-raised">
                <ul className="divide-y divide-surface-deep">
                  {lectures.map(({ module: mdl, lecture }) => (
                    <li key={`${mdl.id}-${lecture.id}`}>
                      <Link
                        href={`/modules/${mdl.id}/lectures/${lecture.id}`}
                        className="flex items-center gap-4 px-5 py-4 transition-colors duration-300 hover:bg-surface/60"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-lg font-semibold text-ink">
                            {lecture.number}. {lecture.title}
                          </span>
                          <span className={`block truncate ${META.base}`}>{mdl.title}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className={`rounded-sm border border-dashed border-muted-light bg-paper-raised px-6 py-10 text-center ${BODY.base}`}>
                Nothing published yet.
              </p>
            )}
          </Section>

          <Section className="mt-12" title="Reviews">
            {reviews.length ? (
              <ul className="space-y-4">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-sm border border-surface-deep bg-paper-raised p-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-ink">{review.studentName}</p>
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarFilledIcon
                            key={i}
                            className={`size-4 ${i < review.rating ? "text-accent" : "text-surface-deep"}`}
                          />
                        ))}
                      </span>
                    </div>
                    <p className={`mt-3 ${BODY.base}`}>{review.body}</p>
                    <p className={`mt-3 ${META.base}`}>{formatDate(review.submittedOn)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={BODY.base}>No reviews published yet.</p>
            )}

            <div className="mt-8">
              <Panel>
                {canReview ? (
                  <LecturerReviewForm lecturerName={member.name} />
                ) : (
                  <LecturerReviewGate name={member.name} />
                )}
              </Panel>
            </div>
          </Section>
        </div>

        <aside className="lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <Panel>
              <div className="flex items-center gap-4">
                <Avatar
                  src={member.avatarUrl}
                  initials={member.initials}
                  className="size-14 text-xl"
                />
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-ink">
                    {member.name}
                  </p>
                  <p className={`truncate ${META.base}`}>{member.title}</p>
                </div>
              </div>

              <ul className="mt-6 space-y-2.5 border-t border-surface-deep pt-5">
                <li className={`flex items-center gap-3 ${META.base}`}>
                  <CheckIcon className="size-4 shrink-0 text-primary" />
                  {lectures.length} published{" "}
                  {lectures.length === 1 ? "lecture" : "lectures"}
                </li>
                <li className={`flex items-center gap-3 ${META.base}`}>
                  <CheckIcon className="size-4 shrink-0 text-primary" />
                  {new Set(lectures.map((entry) => entry.module.id)).size}{" "}
                  {new Set(lectures.map((entry) => entry.module.id)).size === 1
                    ? "module"
                    : "modules"}
                </li>
              </ul>
            </Panel>

            <Panel>
              <p className={EYEBROW.muted}>Reviewing {member.name.split(" ")[0]}</p>
              <p className={`mt-3 ${BODY.base}`}>
                {canReview
                  ? "You have finished one of their lectures, so your review is open below."
                  : "Finish one of their lectures and you can leave a review here."}
              </p>
            </Panel>
          </div>
        </aside>
      </div>
    </PageBody>
  );
}

/* ------------------------------------------------------------ credentials */

type CredentialItem = {
  key: string;
  title: string;
  detail?: string;
  note?: string;
  href?: string;
};

function CredentialSection({
  title,
  items,
  empty,
}: {
  title: string;
  items: CredentialItem[];
  empty: string;
}) {
  return (
    <section>
      <h2 className={HEADING.card}>{title}</h2>
      <div className="mt-5">
        {items.length ? (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.key}
                className="rounded-sm border border-surface-deep bg-paper-raised p-5"
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="link-wipe text-lg font-semibold text-primary"
                  >
                    {item.title}
                  </a>
                ) : (
                  <p className="text-lg font-semibold text-ink">{item.title}</p>
                )}
                {item.detail ? (
                  <p className={`mt-1 ${META.base}`}>{item.detail}</p>
                ) : null}
                {item.note ? <p className={`mt-2 ${BODY.base}`}>{item.note}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className={BODY.base}>{empty}</p>
        )}
      </div>
    </section>
  );
}

/**
 * What a learner sees below the reviews instead of a form, until they have
 * actually finished something this lecturer wrote - the explanation stands
 * in for the form, rather than the form simply being absent.
 */
function LecturerReviewGate({ name }: { name: string }) {
  return (
    <div>
      <p className={EYEBROW.muted}>Reviews are for learners who have finished a lecture</p>
      <p className={`mt-4 ${BODY.base}`}>
        Finish any lecture written by {name} and a review form opens up right
        here - the same rule that holds for reviewing a module, applied to
        the person who taught it.
      </p>
    </div>
  );
}
