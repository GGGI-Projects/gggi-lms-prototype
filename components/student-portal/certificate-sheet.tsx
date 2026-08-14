import { BRAND } from "@/lib/brand";
import { LeafMark } from "@/components/art/scenes";
import { formatDateLong } from "@/lib/portal";

/**
 * The certificate itself.
 *
 * WHY THIS IS DRAWN HERE AND NOT ON THE LANDING PAGE. The landing page shows a
 * deliberate empty frame (`<CertificatePlaceholder>`) because there the
 * certificate is an ILLUSTRATION OF A PROMISE - putting invented artwork in
 * front of the client invites them to review a document nobody has designed,
 * and every hour spent on its seal is an hour spent on something that gets
 * thrown away. That reasoning does not survive the move into the portal: here
 * the certificate is a RECORD the learner opens, and a dashed empty box on the
 * page they came to see is a broken screen rather than an honest one.
 *
 * So it is drawn - and drawn PLAINLY. No guilloche, no gold foil, no ribbon,
 * no invented crest. It uses the platform's own type and palette and nothing
 * else, which means it reads as this product's document and can be restyled
 * later without any of the surrounding page moving. What it must get right is
 * not decoration but the four things a certificate is actually read for: whose
 * it is, what it is for, when it was issued, and the reference that lets
 * somebody check it.
 *
 * `.print-sheet` is what the print rules in globals.css key off - this element
 * is the only thing on the page that reaches paper.
 */
export function CertificateSheet({
  name,
  programmeTitle,
  reference,
  issuedOn,
  modules,
  hours,
}: {
  name: string;
  programmeTitle: string;
  reference: string;
  issuedOn: string;
  modules: number;
  hours: number;
}) {
  return (
    <article className="print-sheet relative isolate aspect-7/5 w-full overflow-hidden rounded-md border border-surface-deep bg-paper-raised">
      {/* A double rule inset from the edge - the one piece of ornament, and it
          is a rule rather than a border so the two weights read as drawn
          rather than as a thick frame. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 border border-surface-deep sm:inset-6"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-5 border border-accent/40 sm:inset-7"
      />

      <div className="flex h-full flex-col items-center justify-between px-8 py-9 text-center sm:px-14 sm:py-12">
        <header className="flex flex-col items-center">
          <span className="grid size-10 place-items-center rounded-full bg-primary text-paper">
            <LeafMark className="size-6" />
          </span>
          <p className="font-display mt-3 text-lg leading-none tracking-tight text-ink">
            {BRAND.name}
            {BRAND.suffix ? (
              <span className="text-muted"> {BRAND.suffix}</span>
            ) : null}
          </p>
          <p className="label-eyebrow mt-5 text-accent-strong">
            Certificate of completion
          </p>
        </header>

        <div className="min-w-0">
          <p className="text-sm text-muted">This certifies that</p>
          {/* The name is the largest thing on the document. A certificate is
              read by the person it belongs to first and by everyone else
              second. */}
          <p className="font-display mt-2 text-3xl leading-tight tracking-tight text-ink text-balance sm:text-4xl">
            {name}
          </p>

          <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
            has completed all {modules} modules and passed every quiz of
          </p>
          <p className="font-display mt-2 text-xl leading-snug tracking-tight text-primary text-balance sm:text-2xl">
            {programmeTitle}
          </p>
          <p className="mt-3 text-sm text-muted">
            {hours} hours of material · Issued {formatDateLong(issuedOn)}
          </p>
        </div>

        <footer className="flex w-full items-end justify-between gap-6 text-left">
          <div className="min-w-0">
            <p className="text-sm text-muted">Reference</p>
            {/* Tabular figures: a reference number is read a character at a
                time and compared against another copy of itself. */}
            <p className="font-display mt-1 truncate text-lg tracking-tight tabular-nums text-ink">
              {reference}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="font-display text-lg leading-none tracking-tight text-ink">
              {BRAND.name} {BRAND.suffix}
            </p>
            <p className="mt-1 text-sm text-muted">{BRAND.country}</p>
          </div>
        </footer>
      </div>
    </article>
  );
}
