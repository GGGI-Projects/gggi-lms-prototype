/**
 * The console's extra icons.
 *
 * NOT a second icon set. Everything the portal already draws - dashboard,
 * programmes, certificate, settings, profile, chevrons, check, clock, search,
 * bell, menu, close, download - is imported from
 * `components/student-portal/icons.tsx` and used unchanged. Redrawing a
 * dashboard glyph here so that the console could have "its own" set is how one
 * product ends up with two visual languages and a rail that does not match the
 * rail one role over.
 *
 * What is here is only what the console needs and the portal never did:
 * people, moderation, logs, permissions and the verbs of an editing interface.
 * Same grid (24), same 1.7 weight, same round caps - see the note on the
 * portal's set, which this file is a continuation of.
 */

type IconProps = { className?: string };

const base = {
  "aria-hidden": true as const,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* -------------------------------------------------------------------- people */

/** Learners. A pair, because the register is a crowd rather than a person. */
export function StudentsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.6" />
      <path d="M17.5 14.2a5 5 0 0 1 3 4.6" />
    </svg>
  );
}

/** Instructors. A person at a board - the one who writes the material. */
export function InstructorIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3.5" width="18" height="12" rx="2" />
      <path d="M7 8.5h6" />
      <path d="M7 12h4" />
      <path d="M12 15.5v5" />
      <path d="M9 20.5h6" />
    </svg>
  );
}

/** The team of administrators. A person with a shield. */
export function TeamIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="8.5" cy="8" r="3.2" />
      <path d="M3 19.5a5.5 5.5 0 0 1 9.5-3.8" />
      <path d="M18 11.2l3 1.2v3.1c0 2-1.2 3.8-3 4.5-1.8-.7-3-2.5-3-4.5v-3.1Z" />
    </svg>
  );
}

/* --------------------------------------------------------------- moderation */

// `StarIcon` and `StarFilledIcon` used to live here - "reviews are a console
// concern". They are not, now that a learner rates a programme on the
// certificate page too, so they moved to the portal's set, which this file's
// own header says is where every icon starts unless the portal never needed
// it. Re-exported rather than dropped, so every file already importing them
// from here keeps working.
export { StarIcon, StarFilledIcon } from "@/components/student-portal/icons";

/** Flagged for attention. */
export function FlagIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 21V4" />
      <path d="M5 4.5h11l-1.8 3.6L16 11.7H5Z" />
    </svg>
  );
}

/** Something needs a decision. */
export function AlertIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8v4.6" />
      <path d="M12 16.1h.01" />
    </svg>
  );
}

/* -------------------------------------------------------- logs & permissions */

/** The audit log. Lines with a time mark. */
export function LogIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5.5h11" />
      <path d="M4 10h8" />
      <path d="M4 14.5h6" />
      <path d="M4 19h6" />
      <circle cx="17.5" cy="16.5" r="4" />
      <path d="M17.5 14.8v1.9l1.3.8" />
    </svg>
  );
}

/** Restricted. Used on the screen a role is not allowed to read. */
export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.2 19 6v6c0 4-2.8 7.6-7 8.8-4.2-1.2-7-4.8-7-8.8V6Z" />
      <path d="M9.6 12.2l1.7 1.7 3.3-3.4" />
    </svg>
  );
}

/** A lock, for a control a role can see but not use. */
export function LockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </svg>
  );
}

/* ---------------------------------------------------------------- material */

/** The shared library. A shelf, because that is what the thing is. */
export function LibraryIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 4.5h3.5v15H4z" />
      <path d="M9.5 4.5H13v15H9.5z" />
      <path d="m15.4 5.6 3.3-.9 3.3 12.4-3.3.9z" />
      <path d="M4 19.5h15" />
    </svg>
  );
}

/** A module - a stack of things read in order. */
export function ModulesIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="3.5" width="17" height="6" rx="2" />
      <rect x="3.5" y="13" width="17" height="7.5" rx="2" />
      <path d="M7 16.8h6" />
    </svg>
  );
}

/* -------------------------------------------------------------------- verbs */

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="M14.5 6.5l3 3" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 6.5h15" />
      <path d="M9.5 6.5V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
      <path d="M6.5 6.5 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l.9-12.5" />
      <path d="M10.5 10.5v6M13.5 10.5v6" />
    </svg>
  );
}

/** Filters on a table. */
export function FilterIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

/** Leaves the console for a public page. */
export function ExternalIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M13.5 5H19v5.5" />
      <path d="M19 5l-7.5 7.5" />
      <path d="M18 14.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5" />
    </svg>
  );
}

/** Email, on an invitation. */
export function MailIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7.5 7.1 5a1.6 1.6 0 0 0 1.8 0l7.1-5" />
    </svg>
  );
}

/** The switch between viewpoints, and any other menu that drops down. */
export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m6 9.5 6 6 6-6" />
    </svg>
  );
}

/** Rising and falling, for a figure's change since last month. */
export function TrendUpIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 16.5 10 10l3.5 3.5L20 7" />
      <path d="M15 7h5v5" />
    </svg>
  );
}

export function TrendDownIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7.5 10 14l3.5-3.5L20 17" />
      <path d="M15 17h5v-5" />
    </svg>
  );
}
