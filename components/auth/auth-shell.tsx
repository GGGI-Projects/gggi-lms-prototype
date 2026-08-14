import Link from "next/link";
import type { ReactNode } from "react";
import { AuthAside, type AuthMode } from "@/components/auth/auth-aside";
import { BODY, EYEBROW, HEADING } from "@/lib/theme";

/**
 * The frame both account pages sit in.
 *
 * A SPLIT, not a card floating on a page. The landing page spends nine sections
 * arguing that this is free and open to anyone; a lone form on a white screen
 * throws all of that away at the exact moment the visitor is deciding whether
 * to hand over an email address. The dark half carries the short version of the
 * argument, and it is the same dark ground, the same ribbon and the same
 * palette the page ends on - so this reads as the next room, not another site.
 *
 * DELIBERATELY QUIET. The landing page has a seasonal clock, a rotating globe,
 * a marquee, scroll reveals, a cursor halo and a progress bar; none of them is
 * here. All of that exists to hold the attention of someone who has not decided
 * yet. This visitor has decided, and everything moving on screen is now
 * something between them and a filled-in form. The one concession is the
 * entrance below, which is CSS-only and over in under a second.
 *
 * No `<SiteHeader>`, for the same reason: its nav points at anchors that do not
 * exist on these routes, and a form page should not offer eight ways to leave
 * it. The wordmark in the panel and the two links above the form are the whole
 * navigation.
 *
 * It exists as a component rather than as two similar route files because the
 * two pages have to stay the same page. Sign-up and sign-in sitting side by
 * side with a 4px difference in gutter or a heading half a step apart is the
 * kind of drift nobody sees in review and everybody feels in use.
 */
export function AuthShell({
  mode,
  eyebrow,
  heading,
  intro,
  /** The other account page - always offered, never buried at the bottom. */
  alt,
  children,
}: {
  mode: AuthMode;
  eyebrow: string;
  heading: string;
  intro: string;
  alt: { prompt: string; label: string; href: string };
  children: ReactNode;
}) {
  return (
    <main className="flex-1 lg:grid lg:grid-cols-12">
      <AuthAside mode={mode} className="lg:col-span-5" />

      <div className="flex flex-col lg:col-span-7">
        {/* The page's only navigation, so it is set at the Body step like the
            header's links on the landing page - not Small. Both of these are
            things you act on rather than captions about something else. */}
        <div className="flex items-center justify-between gap-4 px-6 py-6 text-lg sm:px-10 lg:px-14">
          <Link
            href="/"
            className="link-wipe inline-flex items-center gap-2 font-medium text-muted transition-colors hover:text-ink"
          >
            <span aria-hidden="true">←</span>
            Back to home
          </Link>
          {/* The sentence stays muted and only the link is emphasised: two
              full-strength phrases either side of the row would compete with
              the heading directly beneath them.

              At the Body step the prompt and the link together do not fit
              beside "Back to home" on a 390px screen, so the prompt is dropped
              below `sm` - the link alone still says where it goes. */}
          <p className="text-muted">
            <span className="hidden sm:inline">{alt.prompt} </span>
            <Link
              href={alt.href}
              className="link-wipe font-semibold text-primary"
            >
              {alt.label}
            </Link>
          </p>
        </div>

        {/* Centred vertically only once there is room to spare - on a phone the
            form is taller than the viewport and `items-center` would just push
            the heading off the top. */}
        <div className="flex flex-1 justify-center px-6 pb-20 sm:px-10 lg:items-center lg:px-14">
          {/* CSS entrance, not `motion`: it runs off the stylesheet, so the
              form is painted and usable before any JavaScript arrives, and the
              reduced-motion override in globals.css collapses it onto the
              finished state. */}
          <div className="animate-rise w-full max-w-xl py-6 lg:py-14">
            <p className={EYEBROW.onLight}>{eyebrow}</p>
            <h1 className={HEADING.section}>{heading}</h1>
            <p className={`mt-5 ${BODY.base}`}>{intro}</p>

            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
