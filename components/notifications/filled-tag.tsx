import type { ReactNode } from "react";

/**
 * A solid, high-contrast pill - deliberately NOT the shared `Badge` in
 * `components/console/ui.tsx`. Every `Badge` tone is a pale tint on
 * purpose, one restrained palette across the whole app - fine for a fact
 * ("Published", "3 lecturers") but too quiet for the couple of things on a
 * notifications screen that are meant to grab the eye first: something new,
 * or something this account sent itself. Filled, not tinted - a
 * highlighter, not a hint.
 *
 * Two tones only, added as needed rather than speculatively: `accent` for
 * "New" (unread, see `NewTag` below), `primary` for "sent by this account".
 * Shared across `notification-feed.tsx`, `thread-drawer.tsx` and
 * `notification-bell.tsx` so these signals read identically everywhere they
 * appear, rather than each component inventing its own idea of "filled".
 */
const FILLED_TAG_TONES = {
  accent: "bg-accent text-ink",
  primary: "bg-primary text-paper",
} as const;

export function FilledTag({
  tone,
  icon,
  children,
}: {
  tone: keyof typeof FILLED_TAG_TONES;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-bold ${FILLED_TAG_TONES[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}

/** The "New"/unread tag - an announcement just in, a message not yet
 *  opened. The one signal on a notifications screen meant to grab the eye
 *  first, so it gets the loudest of the two tones. */
export function NewTag() {
  return <FilledTag tone="accent">New</FilledTag>;
}
