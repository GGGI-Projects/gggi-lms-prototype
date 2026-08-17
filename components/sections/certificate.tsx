import { BRAND } from "@/lib/brand";
import { ActionButton } from "@/components/ui/action-button";
import { CertificateSheet } from "@/components/student-portal/certificate-sheet";
import { Reveal } from "@/components/motion/primitives";
import { BODY, EYEBROW, HEADING, SECTION } from "@/lib/theme";

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
 * THE CERTIFICATE ITSELF, not a placeholder for it. This section used to show
 * a dashed empty frame, deliberately - see the note on `<CertificateSheet>`
 * for why an undesigned mock-up would have been worse than nothing at all.
 * That document now exists and is what the student portal actually issues, so
 * showing anything less here would be the section under-selling the one thing
 * it exists to sell. `EXAMPLE` below is invented - nobody by that name is
 * enrolled - but the document rendering it is the real component, not a
 * second drawing of one.
 */
const EXAMPLE = {
  name: "T. K. Fernando",
  moduleTitle: "Climate Vulnerability Assessment",
  reference: "GF-2026-CV-04521",
  issuedOn: "2026-06-18",
  lectures: 8,
  hours: 5,
};

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
            {/* Same max width and centring the placeholder used to carry, so
                this swap did not move anything else in the section. The
                shadow is new - the placeholder was a flat dashed box that
                needed no lift, but a real document sitting on the page reads
                better set slightly above it. */}
            <div className="mx-auto w-full max-w-2xl drop-shadow-xl">
              <CertificateSheet {...EXAMPLE} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
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
