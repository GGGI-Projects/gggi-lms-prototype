/**
 * What the certificate's QR code points at.
 *
 * ONE PLACE, same reason as everything else in `lib/`: the URL shape is
 * built from `BRAND.email`'s domain rather than a second hardcoded string, so
 * renaming the brand in `lib/brand.ts` cannot leave the certificate pointing
 * at a stale domain nobody remembered to update here too.
 *
 * There is no `/verify/[reference]` route behind this link yet. That sets
 * aside README's "no dead ends" rule for one link on one document, on
 * purpose, rather than build a verification page now that would have to be
 * thrown away the moment a real register exists to query - a QR code with
 * nothing live behind it is still worth showing, because it is a real
 * question ("what happens when this is scanned?") a reviewer can now ask
 * with something concrete on screen, instead of imagining the feature from a
 * bullet point. Wiring the route up is a small, later change: this function
 * is the one place that would need to agree with it.
 */
import { BRAND } from "@/lib/brand";

export function certificateVerifyUrl(reference: string): string {
  const domain = BRAND.email.split("@")[1] ?? "example.com";
  return `https://${domain}/verify/${reference}`;
}
