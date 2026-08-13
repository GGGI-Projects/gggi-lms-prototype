import { Reveal } from "@/components/motion/primitives";
import { GatewayIcon, OpenLockIcon, PinIcon } from "@/components/art/icons";

/**
 * Each icon restates its heading rather than decorating it - an open padlock
 * for free, an open gateway for no barrier to entry, a pin for written-here.
 *
 * They deliberately do NOT take a colour each. Three different hues on three
 * adjacent panels is the single loudest thing that makes an institutional page
 * read as a consumer one; one dark teal across all three reads as a document.
 */
const PRINCIPLES = [
  {
    icon: OpenLockIcon,
    title: "Free, permanently",
    body: "No paid tier, no trial, nothing withheld behind an upgrade. Raising the country's baseline is the whole point.",
  },
  {
    icon: GatewayIcon,
    title: "No prerequisites",
    body: "Written for capable people who were never trained in this subject, not for specialists who already were.",
  },
  {
    icon: PinIcon,
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
 * the claim set against the argument, one step of type hierarchy, three
 * raised cards - rather than painted behind the text.
 */
export function Mission() {
  return (
    <section className="bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-editorial px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="label-eyebrow text-primary">Why this exists</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="font-display text-display-xl mt-6 text-balance text-primary">
                Policy is moving faster than training.
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="mt-8 h-px w-24 bg-accent-strong" />
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:pt-3">
            {/* The opening paragraph is set larger than the one after it. One
                step of hierarchy is enough to tell the eye where to start. */}
            <Reveal delay={0.1}>
              <p className="measure-wide text-xl leading-relaxed text-ink">
                Sri Lanka has committed to a national adaptation plan, a
                low-carbon transport transition, restored forests and mangroves,
                and a circular approach to waste. Those commitments land on the
                desks of officers who were never trained in any of them.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="measure-wide mt-6 text-lg leading-relaxed text-ink-soft">
                Until now there has been no open, no-cost place to learn the
                fundamentals - the vocabulary, the mechanisms, and the questions
                worth asking before a decision is signed. That is the gap this
                platform closes, and nothing more: it teaches foundations well,
                rather than teaching everything badly.
              </p>
            </Reveal>
          </div>
        </div>

        {/* One ruled panel, not three floating cards.
            Three separate rounded blocks drifting on a tinted background is a
            consumer-app pattern; a single bordered panel divided by hairlines
            is how a specification sheet or a policy document sets out three
            related facts, and that is the register this audience works in.
            The 22px `rounded-lg` went with it - at that radius on a block this
            small the corner is the loudest thing in the composition. */}
        <div className="mt-16 overflow-hidden rounded-sm border border-surface-deep bg-paper-raised">
          <div className="grid lg:grid-cols-3">
            {PRINCIPLES.map((principle, i) => (
              <Reveal
                key={principle.title}
                delay={0.24 + i * 0.08}
                className={
                  i > 0
                    ? "border-t border-surface-deep lg:border-t-0 lg:border-l"
                    : undefined
                }
              >
                <div className="h-full px-8 py-9">
                  <principle.icon className="size-7 text-primary" />
                  <h3 className="font-display mt-5 text-base tracking-tight text-ink">
                    {principle.title}
                  </h3>
                  {/* `text-md` is not a Tailwind size - it generated nothing,
                      so this was already rendering at the base 1rem. */}
                  <p className="mt-2 text-[0.925rem] leading-relaxed text-muted">
                    {principle.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
