/**
 * The portal's icon set.
 *
 * Separate from `components/art/icons.tsx`, which holds three DUOTONE marks
 * drawn to be read at 40px inside a card. These are interface icons: 16-20px,
 * single weight, outline only, and they sit next to a label that already says
 * what they mean. A duotone icon at 18px is mud.
 *
 * One grid (24), one weight (1.7), round caps and joins throughout, so the set
 * holds together in a nav rail where six of them are stacked. Colour is always
 * `currentColor`; every one is `aria-hidden` because none of them is ever the
 * only thing carrying a meaning.
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

/* --------------------------------------------------------------------- nav */

export function DashboardIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="7.5" height="8.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="5.5" rx="2" />
      <rect x="3" y="14.5" width="7.5" height="6.5" rx="2" />
      <rect x="13.5" y="11.5" width="7.5" height="9.5" rx="2" />
    </svg>
  );
}

export function ProgrammesIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H5.5A1.5 1.5 0 0 1 4 15.5Z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h4.5a1.5 1.5 0 0 0 1.5-1.5Z" />
    </svg>
  );
}

export function QuizIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
      <path d="m8 11 2.2 2.2L15 8.5" />
      <path d="M8 16.5h6" />
    </svg>
  );
}

export function CertificateIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="9.5" r="5.5" />
      <path d="m8.6 14.4-1.1 6.1 4.5-2.4 4.5 2.4-1.1-6.1" />
    </svg>
  );
}

export function ProfileIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.8 20.2a7.4 7.4 0 0 1 14.4 0" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M19.4 14.3a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a1.9 1.9 0 1 1-3.8 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.3a1.9 1.9 0 1 1 0-3.8h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 1.8.3h.1A1.6 1.6 0 0 0 10.5 3v-.3a1.9 1.9 0 1 1 3.8 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a1.9 1.9 0 1 1 0 3.8h-.2a1.6 1.6 0 0 0-1.5 1.1Z" />
    </svg>
  );
}

export function SignOutIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M14.5 4.5H18a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-3.5" />
      <path d="M10 8.5 6.5 12 10 15.5" />
      <path d="M6.5 12H15" />
    </svg>
  );
}

/* ---------------------------------------------------------------- chrome */

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5S6.5 14 6.5 10Z" />
      <path d="M10.2 19a2 2 0 0 0 3.6 0" />
    </svg>
  );
}

/* -------------------------------------------------------------- movement */

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 12h15M13.5 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

/* ------------------------------------------------------------- content */

export function PlayIcon({ className }: IconProps) {
  // Filled rather than stroked: it sits inside a solid button at 20px, where
  // an outlined triangle reads as an artefact.
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8.5 5.6a1 1 0 0 1 1.52-.85l8.1 5.15a1.3 1.3 0 0 1 0 2.2l-8.1 5.15a1 1 0 0 1-1.52-.85Z" />
    </svg>
  );
}

export function PauseIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="7" y="5" width="3.6" height="14" rx="1.3" />
      <rect x="13.4" y="5" width="3.6" height="14" rx="1.3" />
    </svg>
  );
}

export function VideoIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="6" width="12.5" height="12" rx="2.5" />
      <path d="m15.5 13 4.2 2.6a.7.7 0 0 0 1.05-.6V9a.7.7 0 0 0-1.05-.6L15.5 11Z" />
    </svg>
  );
}

export function ReadingIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5.5h6a2.5 2.5 0 0 1 2 4v9a2.5 2.5 0 0 0-2-1H4Z" />
      <path d="M20 5.5h-6a2.5 2.5 0 0 0-2 4v9a2.5 2.5 0 0 1 2-1h6Z" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 4v10.5" />
      <path d="m7.8 10.8 4.2 4.2 4.2-4.2" />
      <path d="M5 19.5h14" />
    </svg>
  );
}

/* --------------------------------------------------------- material kinds */

export function PdfIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9Z" />
      <path d="M13.5 3.5V9H19" />
      <path d="M8.5 14.5h7" />
    </svg>
  );
}

export function SlidesIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="4.5" width="17" height="11" rx="2" />
      <path d="M12 15.5v4M9 19.5h6" />
    </svg>
  );
}

export function SheetIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="4" width="17" height="16" rx="2" />
      <path d="M3.5 9.5h17M9.5 9.5V20M15 9.5V20" />
    </svg>
  );
}

export function DatasetIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <ellipse cx="12" cy="6" rx="7.5" ry="2.8" />
      <path d="M4.5 6v12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8V6" />
      <path d="M4.5 12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8" />
    </svg>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M13.5 4.5H19.5V10.5" />
      <path d="M19.5 4.5 11 13" />
      <path d="M18 14v4.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h4.5" />
    </svg>
  );
}
