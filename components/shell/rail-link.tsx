import Link from "next/link";
import type { ComponentType } from "react";

/**
 * One entry in a rail - the console's or the portal's.
 *
 * The two were the same link written twice: an active bar on the left, an
 * icon that picks up the accent colour when lit, a truncating label. The
 * console's also draws a padlock for a capability the current viewpoint
 * lacks; the portal never locks an entry, so `lockedNote`/`lockIcon` are
 * simply absent there rather than being a second component.
 */
export function RailLink({
  href,
  label,
  icon: Icon,
  active,
  lockedNote,
  lockIcon: LockIcon,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
  /** Screen-reader text for a capability the viewpoint lacks. Its presence
   *  alone decides whether the padlock renders. */
  lockedNote?: string;
  /** The console's `LockIcon` - passed in rather than imported here, so a
   *  caller that never locks anything does not carry it for nothing. */
  lockIcon?: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-lg transition-colors duration-300 ${
        active
          ? "bg-primary-800/70 font-semibold text-paper"
          : "text-tint hover:bg-primary-900/70 hover:text-paper"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-opacity duration-300 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
      <Icon
        className={`size-5 shrink-0 transition-colors duration-300 ${
          active ? "text-accent" : "text-primary-500 group-hover:text-tint"
        }`}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {lockedNote && LockIcon ? (
        <>
          <LockIcon className="size-4 shrink-0 text-primary-500" />
          <span className="sr-only">{lockedNote}</span>
        </>
      ) : null}
    </Link>
  );
}
