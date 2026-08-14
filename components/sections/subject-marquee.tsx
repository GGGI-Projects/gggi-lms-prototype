import { SUBJECT_MARQUEE } from "@/content/site";
import { PauseOffscreen } from "@/components/motion/viewport";

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
    // `bg-paper`, not `bg-paper-raised`. A white pill on a white band has
    // nothing to be white AGAINST - fill and ground were the same colour, and
    // only the shadow said a pill was there at all. Paper is one step down,
    // which is all the separation a glass edge needs, and the pills keep the
    // pure white. It cannot go further and take `surface`: Mission sits
    // immediately below on exactly that, and the band would stop being a band.
    <section
      aria-label="Subject areas covered"
      className="relative isolate overflow-hidden border-y border-surface-deep bg-paper py-9 sm:py-12"
    >
      {/* Nothing behind the pills. The contour lines that were here read as
          waves rather than as texture, so the band is plain again.
          The pills still read as glass without them - the lit top edge, the
          shaded underside and the drop in `.chip` carry that on their own.
          That flat band is also why `.chip` no longer carries a
          `backdrop-filter`: with nothing left to refract it was twenty
          per-frame backdrop blurs buying nothing. */}
      {/* Both tracks stop while the band is off screen. Two rows of chips
          translating continuously is cheap to look at and not cheap to run,
          and it was running for the entire time a visitor spent on the seven
          sections below it. */}
      <PauseOffscreen className="flex flex-col gap-3.5">
        <Track subjects={SUBJECT_MARQUEE} />
        {/* Reversed order as well as reversed direction, so the two rows never
            sit hue-against-hue in a column as they pass. */}
        <Track reverse subjects={[...SUBJECT_MARQUEE].reverse()} />
      </PauseOffscreen>
    </section>
  );
}
