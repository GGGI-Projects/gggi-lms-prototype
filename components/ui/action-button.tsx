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
  form,
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
   * Wires a `type="submit"` button to a `<form>` elsewhere in the tree by id -
   * the native HTML mechanism for a submit control that does not live inside
   * the form it submits, which is what a drawer's footer needs: the fields
   * scroll in the body, the button stays put below them. Ignored when `href`
   * is set, same as `type`.
   */
  form?: string;
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
   * colours cannot simply be reused down the page. `warn` and `info` are
   * `solid`'s clay and marine counterparts - a button that suspends, deletes,
   * withdraws or archives something is not the same colour as one that
   * exports or generates data, and neither is the same colour as an
   * everyday "go" action. `mono` carries no role at all - ink on paper,
   * for a control like "Close" that is neither an instruction nor a warning.
   * See the notes on `.btn-warn`, `.btn-info` and `.btn-mono`.
   */
  variant?: "filled" | "outlined" | "solid" | "line" | "warn" | "info" | "mono";
  /**
   * `xs` through `lg` are one Body-step type size at four paddings - see the
   * note on `.btn-sm` in globals.css for why the label never shrinks below
   * it. `table` is the one exception: a compact pill, type included, for an
   * action that lives inside a table row rather than on the page - see the
   * note on `.btn-table`.
   */
  size?: "xs" | "sm" | "md" | "lg" | "table";
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
      <button
        ref={ref as React.RefObject<HTMLButtonElement>}
        type={type}
        form={form}
        {...shared}
      >
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
