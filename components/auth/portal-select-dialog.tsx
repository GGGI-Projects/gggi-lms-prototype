"use client";

import { useEffect, useRef, type ComponentType } from "react";
import Link from "next/link";
import { ROLE_LABEL, ROLE_SUMMARY, type StaffRole } from "@/lib/permissions";
import { VIEWPOINTS } from "@/components/console/nav";
import { InstructorIcon, ShieldIcon, TeamIcon } from "@/components/console/icons";
import { ChevronRightIcon } from "@/components/student-portal/icons";
import { EYEBROW, HEADING } from "@/lib/theme";

/** Same three glyphs the console already uses for these roles elsewhere - the
 *  rail's restricted-page notes and the viewpoint switcher's own list. */
const PORTAL_ICON: Record<StaffRole, ComponentType<{ className?: string }>> = {
  "super-admin": ShieldIcon,
  admin: TeamIcon,
  instructor: InstructorIcon,
};

/**
 * "Which portal?" - offered the moment a staff sign-in is accepted.
 *
 * A NATIVE `<dialog>`, the same device as the quiz's result screen - see the
 * long note on `ResultDialog` in `quiz-runner.tsx` for why: the browser owns
 * the focus trap, the Escape key and the backdrop, which a hand-rolled
 * overlay gets wrong in a different way every time it is rebuilt.
 *
 * WHY THIS EXISTS AT ALL: one email can hold more than one role - the same
 * person is sometimes the super administrator on this platform AND an
 * instructor for a module they wrote themselves. A sign-in cannot know
 * which hat the visitor wants to wear next, so it asks, once, right after the
 * password is accepted rather than guessing and making them find the switcher
 * buried in the rail afterwards.
 *
 * ALL THREE ROLES, ALWAYS - see the note on `VIEWPOINTS`. A real account would
 * only ever offer the roles it actually holds; this prototype has no session
 * to read that from, so it says so rather than pretending the list is
 * personal. The rail's own viewpoint switcher is the same honesty, in the
 * same place in the design.
 */
export function PortalSelectDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="portal-select-heading"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="modal-panel w-[min(36rem,calc(100vw-2rem))] overflow-y-auto rounded-sm border border-surface-deep bg-paper"
    >
      {/* Centred header block, sized and spaced like `<VerifyEmailPanel>` -
          the icon-in-a-circle, the eyebrow, the display heading, the 18px
          lead paragraph - so the two "you just did one thing, here is the
          next" screens in the account flow read as the same product rather
          than a page and a smaller, denser dialog bolted on beside it. */}
      <div className="px-7 pt-9 pb-8 text-center sm:px-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-paper">
          <PortalsIcon className="size-7" />
        </span>

        <p className={`${EYEBROW.onLight} mt-7`}>Signed in</p>
        <h2 id="portal-select-heading" className={HEADING.section}>
          Which portal?
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          This account can open more than one. Pick where to start - the
          console keeps a switcher for the rest, once you are in.
        </p>

        <ul className="mt-9 space-y-2.5 text-left">
          {VIEWPOINTS.map((viewpoint) => {
            const Icon = PORTAL_ICON[viewpoint.role];
            return (
              <li key={viewpoint.role}>
                <Link
                  href={viewpoint.home}
                  className="group flex items-start gap-4 rounded-sm border border-surface-deep px-5 py-4 transition-colors duration-300 hover:border-primary hover:bg-tint-mist"
                >
                  <span className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-full bg-tint-mist text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-paper">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold text-ink">
                      {ROLE_LABEL[viewpoint.role]}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-muted">
                      {ROLE_SUMMARY[viewpoint.role]}
                    </span>
                  </span>
                  <ChevronRightIcon className="mt-2 size-4 shrink-0 text-muted transition-colors duration-300 group-hover:text-primary" />
                </Link>
              </li>
            );
          })}
        </ul>

        <p
          role="status"
          className="mt-8 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
        >
          This is a design prototype - no password was actually checked, and
          a real account would only ever list the roles it holds.
        </p>
      </div>
    </dialog>
  );
}

/** Three overlapping tiles - "more than one place to land," the same idea
 *  `<VerifyEmailPanel>`'s envelope gives its own single-purpose screen. */
function PortalsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="8" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}
