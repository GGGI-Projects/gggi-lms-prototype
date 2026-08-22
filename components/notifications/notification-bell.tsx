"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BellIcon } from "@/components/student-portal/icons";
import { MailIcon, MegaphoneIcon } from "@/components/console/icons";
import { NewTag } from "@/components/notifications/filled-tag";
import { META } from "@/lib/theme";
import type { NotificationSummary } from "@/lib/comms";

const PREVIEW_LIMIT = 5;

/**
 * The bell, everywhere it appears - the admin and lecturer topbar, the
 * student topbar. ONE COMPONENT, not three, because a preview panel with a
 * dot for unread items is not actually role-specific; only the feed behind
 * it is, and that is computed server-side and handed in as plain, already
 * summarised data (see `summariseFeed` in `lib/comms.ts`).
 *
 * A click used to jump straight to a page (the console's bell) or do
 * nothing at all (the portal's, which had no page behind it - see the note
 * that used to sit where this component's import now does). Every row here
 * opens the SAME notifications page rather than a per-item destination:
 * this is a preview, not a second way of reading each item in full - "See
 * all" is the one door into the real page, and every row leads to the same
 * one so a click anywhere in the panel does something reasonable.
 */
export function NotificationBell({
  items,
  seeAllHref,
}: {
  items: NotificationSummary[];
  seeAllHref: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hasAttention = items.some((item) => item.unread);
  const preview = items.slice(0, PREVIEW_LIMIT);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label={
          hasAttention ? "Notifications - new items waiting" : "Notifications"
        }
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative grid size-10 place-items-center rounded-sm text-ink-soft transition-colors hover:bg-surface hover:text-ink"
      >
        <BellIcon className="size-5" />
        {hasAttention ? (
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 size-2 rounded-full bg-accent ring-2 ring-paper"
          />
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-sm border border-surface-deep bg-paper shadow-lg"
        >
          <div className="border-b border-surface-deep px-4 py-3">
            <h2 className="text-lg font-semibold text-ink">Notifications</h2>
          </div>

          {preview.length ? (
            <ul className="max-h-[22rem] overflow-y-auto">
              {preview.map((item) => (
                <li
                  key={`${item.kind}-${item.id}`}
                  className="border-b border-surface-deep last:border-b-0"
                >
                  <Link
                    href={seeAllHref}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface"
                  >
                    <span
                      className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${
                        item.kind === "announcement"
                          ? "bg-accent-pale text-accent-strong"
                          : "bg-marine-pale text-marine"
                      }`}
                    >
                      {item.kind === "announcement" ? (
                        <MegaphoneIcon className="size-4" />
                      ) : (
                        <MailIcon className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-base font-semibold text-ink">
                          {item.headline}
                        </span>
                        {item.unread ? <NewTag /> : null}
                      </span>
                      <span className={`mt-0.5 block truncate ${META.base}`}>
                        {item.snippet}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`px-4 py-6 text-center ${META.base}`}>
              Nothing yet.
            </p>
          )}

          <Link
            href={seeAllHref}
            onClick={() => setOpen(false)}
            className="block border-t border-surface-deep px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-surface"
          >
            See all
          </Link>
        </div>
      ) : null}
    </div>
  );
}
