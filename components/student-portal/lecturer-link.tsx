import Link from "next/link";
import { Avatar } from "@/components/student-portal/ui";
import { ArrowRightIcon } from "@/components/student-portal/icons";
import type { StaffMember } from "@/content/staff";
import { HEADING, META } from "@/lib/theme";

type LecturerSummary = Pick<
  StaffMember,
  "id" | "name" | "title" | "avatarUrl" | "initials"
>;

/**
 * One lecturer, as a link to their profile - avatar, name, title, arrow.
 *
 * THE ONE CARD both the lecture page's "Written by" byline and the module
 * page's "Your lecturer(s)" section render - a lecture's author and a
 * module's teaching staff are the same fact at two different zoom levels
 * (one lecturer or several), and a learner should recognise the same shape
 * in both rather than learn two different bylines. See `LecturerSection`
 * below for the heading + grid wrapper both pages use around it.
 */
export function LecturerLink({ lecturer }: { lecturer: LecturerSummary }) {
  return (
    <Link
      href={`/lecturers/${lecturer.id}`}
      className="link-wipe group flex items-center gap-4 rounded-sm border border-surface-deep bg-paper-raised px-5 py-4 transition-colors duration-300 hover:bg-surface/60"
    >
      <Avatar
        src={lecturer.avatarUrl}
        initials={lecturer.initials}
        className="size-12 text-lg"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-lg font-semibold text-ink">
          {lecturer.name}
        </span>
        <span className={`block truncate ${META.base}`}>{lecturer.title}</span>
      </span>
      <ArrowRightIcon className="size-4 shrink-0 text-muted-light transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}

/**
 * The heading + card grid around one or more `LecturerLink`s. Renders
 * nothing when the list is empty - a lecture with no recorded author, or a
 * module whose lectures have none between them, shows no section at all
 * rather than an empty heading.
 */
export function LecturerSection({
  heading,
  lecturers,
  className = "",
}: {
  heading: string;
  lecturers: LecturerSummary[];
  className?: string;
}) {
  if (!lecturers.length) return null;

  return (
    <section className={className}>
      <h2 className={HEADING.card}>{heading}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {lecturers.map((lecturer) => (
          <LecturerLink key={lecturer.id} lecturer={lecturer} />
        ))}
      </div>
    </section>
  );
}
