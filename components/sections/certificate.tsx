import { BRAND } from "@/lib/brand";
import { ActionButton } from "@/components/ui/action-button";
import { PhotoSlot } from "@/components/art/scenes";
import { Reveal } from "@/components/motion/primitives";
import { BODY, EYEBROW, HEADING, META, SECTION } from "@/lib/theme";

const GUARANTEES = [
  "A unique reference number on every certificate",
  "Checkable by anyone you show it to",
  "Download as PDF, or share a link",
  "Yours permanently - one per module completed",
];

/**
 * The credential is the actual product here: people finish a module in
 * order to hold up proof. So the certificate gets its own section and its own
 * hero treatment rather than being a bullet point further down.
 *
 * The artwork is a PLACEHOLDER. The certificate itself has not been designed
 * yet, and a mocked-up one in the meantime is worse than an empty frame - it
 * invites the client to review a document nobody has drawn, and every hour
 * spent tuning its seal and its rules is an hour spent on something that will
 * be thrown away. The copy either side of it is real, so the section still
 * makes its argument.
 */
export function Certificate() {
  return (
    <section id="certificate" className={`bg-surface ${SECTION.y}`}>
      <div className="mx-auto grid max-w-editorial items-center gap-16 px-5 sm:px-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <Reveal>
            <p className={EYEBROW.accent}>The certificate</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className={HEADING.section}>
              Proof you can put in front of someone.
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className={`measure mt-6 ${BODY.base}`}>
              Complete every lecture and pass every quiz in a module, and the
              certificate issues straight away - carrying your name, the
              module, the date, and a reference number that can be checked
              against the register.
            </p>
          </Reveal>

          <ul className="mt-9 space-y-4">
            {GUARANTEES.map((item, i) => (
              <Reveal key={item} delay={0.2 + i * 0.07}>
                <li className={`flex items-start gap-3.5 ${BODY.base}`}>
                  <span className="mt-1.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-strong text-paper">
                    <CheckIcon className="size-3" />
                  </span>
                  {item}
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.5}>
            <div className="mt-9">
              <ActionButton
                href={BRAND.routes.signup}
                variant="solid"
                size="md"
                className="group"
              >
                Start your first module
                <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">
                  →
                </span>
              </ActionButton>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal delay={0.2}>
            <CertificatePlaceholder />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Swap point for the real thing.
 *
 * Put the artwork at `public/images/certificate.png` and pass it as `src`
 * below - `<PhotoSlot>` renders the image instead of this frame, and nothing
 * else in the section has to change. Sized 7:5, close to the landscape a
 * certificate is normally set in, so the column does not reflow when the real
 * one arrives.
 */
function CertificatePlaceholder() {
  return (
    <PhotoSlot
      alt="Example certificate"
      className="relative mx-auto aspect-7/5 w-full max-w-2xl overflow-hidden rounded-lg border border-dashed border-muted-light bg-paper-raised"
    >
      <div className="grid h-full place-items-center px-6 text-center">
        <div>
          <p className={EYEBROW.muted}>Certificate</p>
          <p className={`mt-3 ${META.base}`}>Artwork to come</p>
        </div>
      </div>
    </PhotoSlot>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="m2.5 6.5 2.5 2.5 4.5-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
