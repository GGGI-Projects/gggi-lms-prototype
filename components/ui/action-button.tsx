"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

/**
 * The one button used across the header and hero.
 *
 * Hover is a ripple: a circle of the wave colour grows from wherever the
 * pointer entered and floods the button. It replaces the magnetic pull the
 * buttons used to have, which moved them out from under the cursor - a
 * position change on hover makes a control feel evasive rather than
 * responsive.
 *
 * The ripple sits between the button's background and its label, which is why
 * the label is wrapped: a positioned pseudo-element would otherwise paint over
 * the text, and a negative z-index would hide it behind the background.
 */
export function ActionButton({
  href,
  variant = "filled",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  /**
   * `filled` / `outlined` read the seasonal palette and belong to the header
   * and hero. `solid` / `line` use the page palette and are for every other
   * section - see the note on `.btn-solid` in globals.css for why the season
   * colours cannot simply be reused down the page.
   */
  variant?: "filled" | "outlined" | "solid" | "line";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  /** Anchor the ripple's origin to the pointer, on entry and on exit. */
  const trackPointer = (event: React.PointerEvent<HTMLAnchorElement>) => {
    const element = ref.current;
    if (!element) return;
    const box = element.getBoundingClientRect();
    element.style.setProperty("--ripple-x", `${event.clientX - box.left}px`);
    element.style.setProperty("--ripple-y", `${event.clientY - box.top}px`);
  };

  const shared = {
    ref,
    onPointerEnter: trackPointer,
    onPointerLeave: trackPointer,
    className: `btn-ripple btn-${variant} btn-${size} ${className}`,
  };

  const content = (
    <>
      <span aria-hidden="true" className="btn-wave" />
      <span className="btn-label">{children}</span>
    </>
  );

  // In-page anchors stay plain <a>; the router has nothing to do with them.
  return href.startsWith("#") ? (
    <a href={href} {...shared}>
      {content}
    </a>
  ) : (
    <Link href={href} {...shared}>
      {content}
    </Link>
  );
}
