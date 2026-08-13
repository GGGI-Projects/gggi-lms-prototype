import { SUBJECT_MARQUEE } from "@/content/site";

/**
 * Two bands of subject areas travelling in opposite directions, sitting
 * between the hero and the editorial section. It does the job a logo wall
 * usually does - establishing scope at a glance - without borrowing anyone's
 * brand marks.
 *
 * Pure CSS animation, so no client JS is shipped for it. Each track is
 * rendered twice and translated -50%, which makes the loop seamless.
 */

function Track({
  reverse = false,
  subjects,
}: {
  reverse?: boolean;
  subjects: typeof SUBJECT_MARQUEE;
}) {
  return (
    <div className="marquee-fade overflow-hidden">
      <div
        className={`flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"
          }`}
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex items-center"
            // The second copy exists only to close the loop, and the reverse
            // row is the same list again - neither should be read aloud.
            aria-hidden={copy === 1 || reverse || undefined}
          >
            {subjects.map((subject) => (
              <li key={subject.label} className="px-2.5">
                <span className={`chip tone-${subject.tone}`}>
                  <span aria-hidden="true" className="chip-dot" />
                  {subject.label}
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function SubjectMarquee() {
  return (
    <section
      aria-label="Subject areas covered"
      className="relative isolate overflow-hidden border-y border-surface-deep bg-paper-raised py-9 sm:py-12"
    >
      {/* A field of soft colour in the five subject hues.
          This is not decoration the chips sit on top of - it is what makes
          them glass. `backdrop-filter` has nothing to blur or saturate over a
          flat surface, so on plain white the whole treatment renders as a
          plain white pill. The blobs are what the chips pick up as they pass. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: [
            "radial-gradient(58% 130% at 4% 20%, color-mix(in oklab, var(--color-tint) 85%, transparent), transparent 70%)",
            "radial-gradient(46% 120% at 27% 88%, color-mix(in oklab, var(--color-marine) 40%, transparent), transparent 70%)",
            "radial-gradient(44% 120% at 50% 6%, color-mix(in oklab, var(--color-plum) 34%, transparent), transparent 70%)",
            "radial-gradient(48% 125% at 73% 92%, color-mix(in oklab, var(--color-clay) 38%, transparent), transparent 70%)",
            "radial-gradient(62% 135% at 98% 22%, color-mix(in oklab, var(--color-accent) 72%, transparent), transparent 70%)",
            "linear-gradient(90deg, var(--color-tint-pale), var(--color-accent-soft))",
          ].join(","),
        }}
      />

      <div className="flex flex-col gap-3.5">
        <Track subjects={SUBJECT_MARQUEE} />
        {/* Reversed order as well as reversed direction, so the two rows never
            sit hue-against-hue in a column as they pass. */}
        <Track reverse subjects={[...SUBJECT_MARQUEE].reverse()} />
      </div>
    </section>
  );
}
