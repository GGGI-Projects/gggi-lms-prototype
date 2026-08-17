import { BRAND } from "@/lib/brand";
import { LeafMark } from "@/components/art/scenes";
import { QrCode } from "@/components/ui/qr-code";
import { certificateVerifyUrl } from "@/lib/qr";
import { formatDateLong } from "@/lib/portal";

/**
 * The certificate itself.
 *
 * SHOWN IN TWO PLACES NOW: here in the portal, where it is a RECORD the
 * learner opens, and on the landing page's certificate section, where it is
 * an ILLUSTRATION OF A PROMISE shown to someone who has not signed up yet.
 * The landing page used to draw a deliberate empty frame instead - a
 * mocked-up certificate invites the client to review a document nobody has
 * designed, and every hour spent on its seal is an hour spent on something
 * that gets thrown away. That reasoning does not survive THIS component
 * existing: once the real document is designed and is what the portal
 * actually issues, drawing a second, fake one for the landing page would be
 * the exact mistake the empty frame was there to avoid, in the other
 * direction - the promise and the product would no longer match.
 *
 * So it is drawn - and drawn PLAINLY. No guilloche, no gold foil, no ribbon,
 * no invented crest. It uses the platform's own type and palette and nothing
 * else, which means it reads as this product's document and can be restyled
 * later without any of the surrounding page moving. What it must get right is
 * not decoration but the four things a certificate is actually read for: whose
 * it is, what it is for, when it was issued, and the reference that lets
 * somebody check it.
 *
 * The QR CODE in the footer encodes that same reference as a verify link,
 * for the person checking the certificate rather than the person it belongs
 * to - typed references are for comparing two copies by eye or reading one
 * out over the phone; a QR is for a stranger on the other end of a printout
 * who just wants to open the check page without keying anything in. Nothing
 * behind the link is wired up in this prototype - see the note on `lib/qr.ts`.
 *
 * `.print-sheet` is what the print rules in globals.css key off - this element
 * is the only thing on the page that reaches paper.
 */
export function CertificateSheet({
  name,
  moduleTitle,
  reference,
  issuedOn,
  lectures,
  hours,
}: {
  name: string;
  moduleTitle: string;
  reference: string;
  issuedOn: string;
  lectures: number;
  hours: number;
}) {
  return (
    // NOT `aspect-7/5` below `sm`. That fixes the box's height to its width,
    // and this document does not get shorter just because the phone showing
    // it is narrow - a landscape 7:5 box that wide is barely 250px tall,
    // nowhere near enough for six lines of certificate under the padding,
    // and the excess was silently lost to `overflow-hidden` rather than
    // pushing the box taller. The aspect ratio is worth having once there is
    // enough width for it to imply a sane height instead - from `sm` up.
    <article className="print-sheet relative isolate w-full overflow-hidden rounded-md border border-surface-deep bg-paper-raised sm:aspect-7/5">
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

      {/* `gap-8` stands in for `justify-between` below `sm`: with no fixed
          height to distribute across, `justify-between` has no extra space
          to spend and the three blocks would sit flush against each other. */}
      <div className="flex flex-col items-center justify-between gap-8 px-8 py-9 text-center sm:h-full sm:gap-0 sm:px-14 sm:py-12">
        <header className="flex flex-col items-center">
          <span className="grid size-10 place-items-center rounded-full bg-primary text-paper">
            <LeafMark className="size-7" />
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
            has completed all {lectures} lectures and passed every quiz of
          </p>
          <p className="font-display mt-2 text-xl leading-snug tracking-tight text-primary text-balance sm:text-2xl">
            {moduleTitle}
          </p>
          <p className="mt-3 text-sm text-muted">
            {hours} hours of material · Issued {formatDateLong(issuedOn)}
          </p>
        </div>

        {/* Stacked below `sm`, not squeezed into one row - the reference and
            the brand block both want more width than a phone-width card has
            to give both at once, and the loser was `truncate`-ing the one
            piece of text on the page that must not lose characters. */}
        <footer className="flex w-full flex-col items-start gap-5 text-left sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-end gap-3 sm:gap-4">
            {/* Beside the reference, at the reference block's own height -
                not stacked under its own caption, which is what pushed the
                footer taller than the certificate's fixed aspect ratio has
                room for. A QR code next to a "Reference" label reads as
                "another way to check this" without needing to say so. */}
            <QrCode
              value={certificateVerifyUrl(reference)}
              className="size-11 shrink-0 text-ink sm:size-13"
            />
            <div className="min-w-0">
              <p className="text-sm text-muted">Reference</p>
              {/* Tabular figures: a reference number is read a character at
                  a time and compared against another copy of itself. */}
              <p className="font-display mt-1 truncate text-lg tracking-tight tabular-nums text-ink">
                {reference}
              </p>
            </div>
          </div>

          <div className="w-full text-right sm:w-auto sm:shrink-0">
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
