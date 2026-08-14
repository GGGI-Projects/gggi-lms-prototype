import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";
import {
  BODY,
  CARD_TONES,
  CONTAINER,
  EYEBROW,
  HEADING,
  SECTION,
} from "@/lib/theme";

const PRINCIPLES = [
  {
    title: "Free, permanently",
    body: "No paid tier, no trial, nothing withheld behind an upgrade. Raising the country's baseline is the whole point.",
  },
  {
    title: "No prerequisites",
    body: "Written for capable people who were never trained in this subject, not for specialists who already were.",
  },
  {
    title: "Grounded locally",
    body: "Sri Lankan policy, Sri Lankan case studies, Sri Lankan constraints. Not a generic course with the country name swapped in.",
  },
];

/**
 * The "why this exists" beat.
 *
 * This section is deliberately the quietest thing on the page: flat surface,
 * no pattern, no gradient, no artwork. It follows a dark animated hero and a
 * band of moving colour, and a reader who is never given a plain surface to
 * rest on stops reading. Everything that gives it interest is structural -
 * the claim set against the argument, ink against ink-soft, three raised
 * cards - rather than painted behind the text.
 */
export function Mission() {
  return (
    <section className={`bg-surface ${SECTION.y}`}>
      <div className={CONTAINER}>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className={EYEBROW.onLight}>Why this exists</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className={`${HEADING.section}`}>
                Policy is moving faster than training.
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-8 h-px w-24 bg-accent-strong" />
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:pt-3">
            {/* The opening paragraph is set at full-strength ink and the one
                after it at ink-soft. That is the whole hierarchy - it used to
                be a size step as well, and colour alone turns out to be enough
                to tell the eye where to start. */}
            <Reveal delay={0.1}>
              <p className={`measure-wide ${BODY.lead}`}>
                Sri Lanka has committed to a national adaptation plan, a
                low-carbon transport transition, restored forests and mangroves,
                and a circular approach to waste. Those commitments land on the
                desks of officers who were never trained in any of them.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className={`measure-wide mt-6 ${BODY.base}`}>
                Until now there has been no open, no-cost place to learn the
                fundamentals - the vocabulary, the mechanisms, and the questions
                worth asking before a decision is signed. That is the gap this
                platform closes, and nothing more: it teaches foundations well,
                rather than teaching everything badly.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Same card as the audience section, deliberately.
            This was one ruled panel divided by hairlines, on the argument that
            a specification sheet is the register this reader works in. That
            still holds in isolation - but the page now sets out three related
            facts in a row TWICE, here and under "Who it's for", and doing it
            two different ways made two identical jobs look like two different
            components. One pattern, used twice, is the stronger version of the
            same argument.

            Same hues too, from the shared `CARD_TONES` in lib/theme.ts - the
            two rows are close enough on the page that different hues, or the
            same hues in a different order, would read as a mistake. */}
        <Stagger className="mt-16 grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((principle, i) => (
            <StaggerItem key={principle.title} className="h-full">
              <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-surface-deep bg-paper-raised p-7 transition-colors duration-500 hover:border-muted-light">
                {/* Hover wash rising from the base of the card. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-surface/80 transition-[height] duration-600 ease-out-expo group-hover:h-full"
                />

                {/* Artwork, not a label - see the note on the same numeral in
                    the audience section for why this sits off the type scale. */}
                <span
                  aria-hidden="true"
                  className={`text-figure relative ${CARD_TONES[i].text}`}
                >
                  0{i + 1}
                </span>

                <h3 className={`relative mt-4 ${HEADING.card}`}>
                  {principle.title}
                </h3>
                <p className={`relative mt-3 ${BODY.base}`}>
                  {principle.body}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
