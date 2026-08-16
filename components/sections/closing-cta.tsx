import { BRAND } from "@/lib/brand";
import { ActionButton } from "@/components/ui/action-button";
import { TOTALS } from "@/content/site";
import { RibbonScene } from "@/components/art/scenes";
import { Reveal } from "@/components/motion/primitives";
import { BODY, EYEBROW, HEADING, META } from "@/lib/theme";

/**
 * Closing call to action. Everything above has been argument; this is the ask,
 * so it carries a single button and no competing links.
 */
export function ClosingCta() {
  return (
    <section className="relative isolate overflow-hidden bg-primary-900 pt-24 sm:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[42rem] -translate-x-1/2 rounded-full bg-primary-600/25 blur-[120px]"
      />

      <div className="mx-auto max-w-3xl px-5 pb-32 text-center sm:px-8 sm:pb-40">
        <Reveal>
          <p className={EYEBROW.onDark}>Start today</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className={HEADING.sectionOnDark}>
            {TOTALS.lectures} lectures. No cost. One certificate at the end of
            each.
          </h2>
        </Reveal>
        <Reveal delay={0.16}>
          <p className={`mx-auto mt-6 max-w-xl ${BODY.leadOnDark}`}>
            Creating an account takes about a minute, and you can be part-way
            through your first lecture before the kettle boils.
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-11 flex justify-center">
            {/* The one solid button on the page below the hero. Everything
                between here and the header is outlined, so the final ask is
                the only thing that looks like the primary action. */}
            <ActionButton
              href={BRAND.routes.signup}
              variant="solid"
              size="lg"
              className="group shadow-[0_18px_50px_-16px_var(--color-accent)]"
            >
              Create your free account
              <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
                →
              </span>
            </ActionButton>
          </div>
        </Reveal>

        <Reveal delay={0.32}>
          <p className={`mt-6 ${META.base} text-primary-500`}>
            Free forever · No card required · Open to anyone in {BRAND.country}
          </p>
        </Reveal>
      </div>

      {/* Full-bleed landscape ribbon anchoring the base of the page. */}
      <RibbonScene
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-56 w-full sm:h-72"
      />
    </section>
  );
}
