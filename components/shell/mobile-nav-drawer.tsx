"use client";

import type { ReactNode } from "react";
import { CloseIcon } from "@/components/student-portal/icons";

/**
 * The rail again, on a phone - identical in the console and the portal down
 * to the class names, which is why it lives here rather than in either: a
 * backdrop, a panel slid in by transform, and a close button. `inert` keeps
 * a closed drawer's links out of the tab order and away from a screen
 * reader - `-translate-x-full` alone only hides it visually and leaves its
 * links focusable off the left edge of the page. The rail markup itself
 * stays with the caller, since that is the one part that differs.
 */
export function MobileNavDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** The rail, rendered with `className="relative flex w-full"`. */
  children: ReactNode;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
      inert={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-primary-950/60 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-y-0 left-0 flex w-[19rem] max-w-[86%] transition-transform duration-400 ease-out-expo ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {children}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="absolute right-3 top-4 grid size-10 place-items-center rounded-sm text-tint transition-colors hover:bg-primary-900 hover:text-paper"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
