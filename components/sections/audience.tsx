import { AUDIENCES } from "@/content/site";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import {
  BODY,
  CARD_TONES,
  CONTAINER,
  EYEBROW,
  HEADING,
  SECTION,
} from "@/lib/theme";

/**
 * Who the platform is for. The public sector is the reason it exists, but
 * enrolment is genuinely open - so the three groups are given equal visual
 * weight rather than making the public feel like an afterthought.
 */
export function Audience() {
  return (
    <section className={`bg-paper ${SECTION.y}`}>
      <div className={CONTAINER}>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <p className={EYEBROW.onLight}>Who it&rsquo;s for</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className={HEADING.section}>
                Built for the public sector. Open to everyone.
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <Reveal delay={0.16}>
              <p className={`measure ${BODY.base}`}>
                There is no approval step, no departmental sponsorship and no
                eligibility check. If you want to learn the material, you can.
              </p>
            </Reveal>
          </div>
        </div>

        <Stagger className="mt-16 grid gap-6 md:grid-cols-3">
          {AUDIENCES.map((audience, i) => (
            <StaggerItem key={audience.title} className="h-full">
              <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-surface-deep bg-paper-raised p-7 transition-colors duration-500 hover:border-muted-light">
                {/* Hover wash rising from the base of the card. Neutral, so
                    the card's own hue stays the only colour on it. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-surface/80 transition-[height] duration-600 ease-out-expo group-hover:h-full"
                />

                {/* A NUMERAL, not a label - the same move the programmes list
                    makes, at a size that suits a card rather than a full-width
                    row. That is why it is off the four-step text scale and why
                    that is not a leak: it is `aria-hidden`, it carries no
                    information (the cards are not ranked and read fine in any
                    order), and it is doing the job an illustration would. Text
                    a reader is meant to read stays on the scale; artwork that
                    happens to be made of glyphs does not.

                    The size is `.text-figure` in globals.css, shared with the
                    mission cards and the hero's four totals, so the page has
                    one measurement for "a number set as a graphic" instead of
                    three. It carries NO colour - the hue comes from
                    `CARD_TONES` - because two `text-*` utilities on one element
                    are resolved by their order in the compiled stylesheet, not
                    by the order they appear here, and a size class that also
                    set a colour would win or lose against the hue by accident.
                    Used alone, without `font-display`: the class sets the
                    family, weight and tracking itself. */}
                <span
                  aria-hidden="true"
                  className={`text-figure relative ${CARD_TONES[i].text}`}
                >
                  0{i + 1}
                </span>

                <h3 className={`relative mt-4 ${HEADING.card}`}>
                  {audience.title}
                </h3>
                <p className={`relative mt-3 ${BODY.base}`}>
                  {audience.body}
                </p>

                {/* `BODY`, not `META`. These are three things a reader is
                    meant to check themselves against - "is this me?" is the
                    whole job of this section - so they are reading copy, and
                    the rule separating them from the paragraph above is what
                    marks them as a list. `META` is for labels ABOUT content
                    (counts, levels, captions); using it here set the one thing
                    people actually scan at the smallest size on the card. */}
                <ul className="relative mt-6 space-y-2.5 border-t border-surface-deep pt-5">
                  {audience.points.map((point) => (
                    <li
                      key={point}
                      className={`flex items-start gap-3 ${BODY.base}`}
                    >
                      {/* Dot centred on the first line: a 29px line box round a
                          6px dot leaves ~11.6px above it. */}
                      <span
                        className={`mt-3 size-1.5 shrink-0 rounded-full ${CARD_TONES[i].dot}`}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
