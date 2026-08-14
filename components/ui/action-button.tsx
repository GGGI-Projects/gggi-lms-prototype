"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

/**
 * The one button used across the page.
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
 *
 * Omit `href` and it renders a real `<button>` instead of a link - which is
 * what the sign-up form's submit needs. That is why the element is chosen here
 * rather than at the call site: a second ripple implementation living in the
 * form is how the page's primary action ends up being two slightly different
 * buttons depending on which one you are looking at.
 */
export function ActionButton({
  href,
  type = "button",
  onClick,
  variant = "filled",
  size = "md",
  className = "",
  children,
}: {
  /** Omit to render a `<button>`. */
  href?: string;
  /** Ignored when `href` is set. */
  type?: "button" | "submit";
  /**
   * For the handful of controls that act on the page rather than navigating -
   * the module page's "Mark as complete", the quiz's "Submit". It lives here
   * rather than at a call site wrapping this in its own `<button>`, which
   * would nest a button inside a button.
   */
  onClick?: () => void;
  /**
   * `filled` / `outlined` read the seasonal palette and belong to the header
   * and hero. `solid` / `line` use the page palette and are for every other
   * section - see the note on `.btn-solid` in globals.css for why the season
   * colours cannot simply be reused down the page.
   */
  variant?: "filled" | "outlined" | "solid" | "line";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  // One ref for three possible elements, so the ripple maths below is written
  // once. Only `getBoundingClientRect` and `style` are read off it, and every
  // element this can render has both.
  const ref = useRef<HTMLElement>(null);

  /** Anchor the ripple's origin to the pointer, on entry and on exit. */
  const trackPointer = (event: React.PointerEvent<HTMLElement>) => {
    const element = ref.current;
    if (!element) return;
    const box = element.getBoundingClientRect();
    element.style.setProperty("--ripple-x", `${event.clientX - box.left}px`);
    element.style.setProperty("--ripple-y", `${event.clientY - box.top}px`);
  };

  const shared = {
    onPointerEnter: trackPointer,
    onPointerLeave: trackPointer,
    onClick,
    className: `btn-ripple btn-${variant} btn-${size} ${className}`,
  };

  const content = (
    <>
      <span aria-hidden="true" className="btn-wave" />
      <span className="btn-label">{children}</span>
    </>
  );

  if (href === undefined) {
    return (
      <button ref={ref as React.RefObject<HTMLButtonElement>} type={type} {...shared}>
        {content}
      </button>
    );
  }

  // In-page anchors stay plain <a>; the router has nothing to do with them.
  return href.startsWith("#") ? (
    <a ref={ref as React.RefObject<HTMLAnchorElement>} href={href} {...shared}>
      {content}
    </a>
  ) : (
    <Link ref={ref as React.RefObject<HTMLAnchorElement>} href={href} {...shared}>
      {content}
    </Link>
  );
}
