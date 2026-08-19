import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LeafMark } from "@/components/art/scenes";
import { ActionButton } from "@/components/ui/action-button";

/**
 * The account pages' header.
 *
 * GEOMETRICALLY IDENTICAL to `<SiteHeader>`, and that is the whole point: the
 * same `h-(--header-h)`, the same `px-fluid` gutter, the same 40px mark, the
 * same `font-display text-lg` wordmark and the same `btn-sm` pill on the right.
 * The landing page and these two routes are one site, and a header that sits at
 * a different height, on a different left edge, with a differently sized mark
 * is the single most obvious way to say otherwise - it is the one element a
 * visitor sees on every page, so any drift in it is drift they see twice.
 *
 * What legitimately differs is COLOUR, HEIGHT and CONTENT. The site header is
 * transparent over a dark, seasonally animated hero and reads the season
 * tokens; there is no hero here, so this one takes its colours from the page
 * palette, and it runs edge to edge with no rule under it - the dark panel
 * below already draws the line, and a hairline on top of that edge reads as a
 * seam. It is also shorter: `<AuthShell>` re-points `--header-h` for these
 * routes, and this header and the panel beneath it both follow from that one
 * value. And it carries no nav: those links point at anchors that do not exist
 * on these routes, and a form page should not offer eight ways to leave it. The
 * mark goes home, the pill goes to the other account page, and that is the lot.
 */
export function AuthHeader({
  alt,
}: {
  alt: { prompt: string; label: string; href: string };
}) {
  return (
    // Sticky rather than fixed - `fixed` would need the split below it to
    // reserve the height by hand, and there is no hero here to sit underneath.
    <header className="sticky top-0 z-50 h-(--header-h) bg-paper">
      <div className="px-fluid flex h-full w-full items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-ink"
          aria-label={`${BRAND.name} ${BRAND.suffix} - home`}
        >
          <span className="grid size-10 place-items-center rounded-full bg-primary text-paper transition-transform duration-500 ease-out-expo group-hover:-rotate-12">
            <LeafMark className="size-10" />
          </span>
          <span className="font-display whitespace-nowrap text-lg leading-none tracking-tight">
            {BRAND.name}
            {BRAND.suffix ? (
              <span className="text-muted"> {BRAND.suffix}</span>
            ) : null}
          </span>
        </Link>

        {/* Below `sm` the wordmark and a pill do not both fit on a 390px
            screen, so the pair moves to the foot of the form instead - see
            `<AuthShell>`. Hiding it is better than shrinking the mark: the
            mark is the thing that has to match the landing page. */}
        <div className="hidden items-center gap-4 sm:flex">
          <span className="hidden text-lg text-muted md:inline">
            {alt.prompt}
          </span>
          {/* `solid`, not `line`: this is the one action on the page besides
              the form's own submit, and an outlined pill next to a light
              ground was the quietest thing in the bar. `filled` would read the
              seasonal palette, which nothing on these routes drives - see the
              note on `.btn-solid` in globals.css. */}
          <ActionButton href={alt.href} variant="solid" size="xs">
            {alt.label}
          </ActionButton>
        </div>
      </div>
    </header>
  );
}
