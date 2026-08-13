import { AUDIENCES } from "@/content/site";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/primitives";

/**
 * Who the platform is for. The public sector is the reason it exists, but
 * enrolment is genuinely open - so the three groups are given equal visual
 * weight rather than making the public feel like an afterthought.
 */
export function Audience() {
  return (
    <section className="bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-editorial px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="label-eyebrow text-primary">Who it&rsquo;s for</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="font-display text-display-lg mt-5 text-balance text-ink">
                Built for the public sector. Open to everyone.
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:pb-2">
            <Reveal delay={0.16}>
              <p className="measure text-base leading-relaxed text-ink-soft">
                There is no approval step, no departmental sponsorship and no
                eligibility check. If you want to learn the material, you can.
              </p>
            </Reveal>
          </div>
        </div>

        <Stagger className="mt-16 grid gap-6 md:grid-cols-3">
          {AUDIENCES.map((audience, i) => (
            <StaggerItem key={audience.title} className="h-full">
              <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-surface-deep bg-paper-raised p-7 transition-colors duration-500 hover:border-tint">
                {/* Hover wash rising from the base of the card. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-tint-mist/70 transition-[height] duration-600 ease-out-expo group-hover:h-full"
                />

                <span
                  aria-hidden="true"
                  className="relative font-display text-sm text-primary-600"
                >
                  0{i + 1}
                </span>

                <h3 className="relative mt-5 font-display text-2xl tracking-tight text-ink">
                  {audience.title}
                </h3>
                <p className="relative mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
                  {audience.body}
                </p>

                <ul className="relative mt-6 space-y-2.5 border-t border-surface-deep pt-5">
                  {audience.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-[0.875rem] text-muted"
                    >
                      <span className="mt-[0.5rem] size-1 shrink-0 rounded-full bg-tint" />
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
