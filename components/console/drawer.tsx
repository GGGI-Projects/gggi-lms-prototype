"use client";

import { useEffect, type ReactNode } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { setScrollLocked } from "@/components/motion/smooth-scroll";
import { CloseIcon } from "@/components/student-portal/icons";

/**
 * A panel that slides in from the right edge of the viewport.
 *
 * THE SAME DEVICE AS THE RAIL'S MOBILE DRAWER - a backdrop button, a
 * transform-driven panel, `inert` while closed - but for CONTENT rather than
 * navigation. A register's "add one" form belongs beside the register it adds
 * to, not on a second screen: closing the drawer is still looking at the same
 * table, one row longer than it just claimed to be.
 *
 * Always mounted and moved by transform, never conditionally rendered. Doing
 * it the obvious way - mounting the drawer on open - means the first click
 * pays for rendering the form before anything can slide, which is exactly the
 * lag a slide-in is supposed to hide. `inert` is what keeps a closed drawer's
 * fields out of the tab order and away from a screen reader; the transform
 * alone only hides it visually.
 *
 * THREE WIDTHS, mobile-first. Below the `sm` breakpoint every size is full
 * width - a capped panel on a 375px phone leaves a dead margin down one side
 * for no reason, when the backdrop behind it already reads as "there is a
 * page under this". The cap only starts doing anything once the viewport has
 * room to spare, and from there it holds a form to the measure that suits it:
 * `sm` for an everyday form (name, email, a field or two - the width every
 * drawer used before this existed), `md` for one with more to it, `lg` for
 * something that wants most of the screen - a table, a preview, a form wide
 * enough to run two columns of fields side by side.
 *
 * `lg` IS VIEWPORT-RELATIVE rather than a fixed cap, unlike the other two. A
 * flat rem value that reads as "most of the screen" on a laptop is a third of
 * an ultrawide monitor and overflows a tablet - `min(92vw, 80rem)` scales
 * with whatever screen it is opened on and only stops scaling once it would
 * otherwise become uncomfortably wide to read, past 1280px.
 *
 * EVERY DRAWER GETS A "CLOSE" BUTTON in a footer bar under the scrollable
 * body, in `.btn-mono` - the one variant with no palette role, because
 * dismissing a drawer is neither encouraged nor warned against. It exists
 * beside the header's icon-only `×` rather than instead of it: the icon is
 * for someone who already knows what it does, the labelled button is for
 * everyone else, and a control this basic should not require having used the
 * pattern before.
 */
const WIDTH = {
  sm: "sm:max-w-lg",
  md: "sm:max-w-4xl",
  lg: "sm:max-w-[min(92vw,80rem)]",
} as const;

export function Drawer({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** @default "md" */
  size?: keyof typeof WIDTH;
  /**
   * The drawer's own primary action, if it has one - "Save", "Send the
   * invitation". Rendered to the LEFT of Close, both right-aligned in a
   * footer bar below the scrollable body: the same corner every dialog's
   * default action sits in, so the last thing a keyboard user tabs past is
   * always the same distance from the edge.
   */
  footer?: ReactNode;
  children: ReactNode;
}) {
  // Escape closes it - the drawer covers the whole screen on a phone and the
  // only other way out is a 40px button in the corner.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Freeze the page behind the drawer while it is open - otherwise a wheel
  // over the visible strip of backdrop scrolls the register underneath at the
  // same time as the drawer's own body scrolls, which is the two-scrollbar
  // symptom this is fixing. Both mechanisms are needed, not one or the other:
  // `overflow: hidden` stops the browser's own scrolling, and
  // `setScrollLocked` stops Lenis, which keeps its own scroll position and
  // would otherwise carry on driving the page underneath the overlay. Same
  // device as the landing page's mobile menu.
  //
  // THIS IS ALSO WHY THE DRAWER'S OWN BODY NEEDS `data-lenis-prevent` BELOW.
  // Stopped Lenis does not politely step aside - its wheel handler calls
  // `event.preventDefault()` on every wheel event anywhere on the page while
  // `isStopped`, with no exception for an element that is not the page it
  // stopped. Without the attribute, freezing the background also freezes the
  // drawer's own scroll: the content is still there, only draggable by the
  // scrollbar itself, which is the exact bug this fixes.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    setScrollLocked(open);
    return () => {
      document.body.style.overflow = "";
      setScrollLocked(false);
    };
  }, [open]);

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      inert={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-primary-950/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"
          }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute inset-y-0 right-0 flex w-full ${WIDTH[size]} flex-col border-l border-surface-deep bg-paper shadow-lg transition-transform duration-400 ease-out-expo ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-surface-deep px-6 py-5 sm:px-8">
          <div className="min-w-0">
            <h2 className="font-display text-2xl tracking-tight text-ink">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-lg leading-relaxed text-ink-soft">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-10 shrink-0 place-items-center rounded-sm text-ink-soft transition-colors hover:bg-surface hover:text-ink"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        {/* `data-lenis-prevent` - see the note above the scroll-lock effect.
            Wheel and touch input starting anywhere in here is left to the
            browser's own scrolling rather than reaching Lenis at all, so a
            stopped Lenis (the whole page, frozen behind this drawer) has no
            way to catch it. */}
        <div
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8"
        >
          {children}
        </div>

        {/* Footer buttons stay RIGHT-ALIGNED as a group, never spread across
            the bar - a "Close" pinned to the left edge and a primary action
            pinned to the right reads as two unrelated controls that happen to
            share a row, not one decision with a way out of it. */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-surface-deep bg-paper px-6 py-4 sm:px-8">
          <ActionButton variant="mono" size="sm" onClick={onClose}>
            Close
          </ActionButton>
          {footer}
        </div>
      </div>
    </div>
  );
}
