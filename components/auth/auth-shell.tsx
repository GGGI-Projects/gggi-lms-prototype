import Link from "next/link";
import type { ReactNode } from "react";
import { AuthAside, type AuthMode } from "@/components/auth/auth-aside";
import { AuthHeader } from "@/components/auth/auth-header";
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
 * The site's header sits ABOVE the split rather than the panel carrying its own
 * wordmark, so the mark is in the same place, at the same size, on the same
 * left edge as it is on the landing page. See `<AuthHeader>`.
 *
 * DELIBERATELY QUIET. The landing page has a seasonal clock, a rotating globe,
 * a marquee, scroll reveals, a cursor halo and a progress bar; none of them is
 * here. All of that exists to hold the attention of someone who has not decided
 * yet. This visitor has decided, and everything moving on screen is now
 * something between them and a filled-in form. The one concession is the
 * entrance below, which is CSS-only and over in under a second.
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
    // `--header-h` is re-pointed HERE rather than in each component, and that
    // is what keeps the header and the panel agreeing with each other: the bar
    // is `h-(--header-h)`, the panel sticks at `top-(--header-h)` and is
    // `100svh` minus the same value, so one number moves all three. It is
    // shorter than the landing page's 5.25rem because that height is sized for
    // a bar floating over a full-screen hero with four nav links in it; this
    // one holds a mark and a pill, above a form the visitor came here to fill
    // in. The rest of the site is untouched - the override stops at this div.
    <div className="flex flex-1 flex-col [--header-h:4.25rem]">
      <AuthHeader alt={alt} />

      <main className="flex-1 lg:grid lg:grid-cols-12">
        <AuthAside mode={mode} className="lg:col-span-5" />

        {/* Centred vertically only once there is room to spare - on a phone the
            form is taller than the viewport and `items-center` would just push
            the heading off the top. */}
        <div className="flex justify-center px-6 pb-20 pt-12 sm:px-10 lg:col-span-7 lg:items-center lg:px-14 lg:pt-0">
          {/* CSS entrance, not `motion`: it runs off the stylesheet, so the
              form is painted and usable before any JavaScript arrives, and the
              reduced-motion override in globals.css collapses it onto the
              finished state. */}
          <div className="animate-rise w-full max-w-xl lg:py-14">
            <p className={EYEBROW.onLight}>{eyebrow}</p>
            <h1 className={HEADING.section}>{heading}</h1>
            <p className={`mt-5 ${BODY.base}`}>{intro}</p>

            {children}

            {/* The header's pill, for the phones it does not fit on. Under the
                form rather than above it: on a screen this narrow the form is
                the page, and a link to the other account page belongs after
                the visitor has decided this one is not the one they wanted. */}
            <p className="mt-8 border-t border-surface-deep pt-8 text-center text-lg text-muted sm:hidden">
              {alt.prompt}{" "}
              <Link
                href={alt.href}
                className="link-wipe font-semibold text-primary"
              >
                {alt.label}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
