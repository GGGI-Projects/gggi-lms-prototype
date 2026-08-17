import qrcode from "qrcode-generator";

/**
 * A QR code, drawn as inline SVG rather than an image.
 *
 * Same reasoning as every other mark in `components/art` - no network
 * request, crisp at any size, and it inherits `currentColor` so it sits in
 * whatever ink colour the document around it uses instead of shipping as a
 * fixed black-and-white bitmap. It is a plain server component: the encoding
 * happens once, on the server, and only the finished squares reach the
 * browser.
 *
 * Error correction is fixed at "M" (recovers ~15% of the matrix) - enough to
 * survive a certificate that has been printed, folded and scanned at an
 * angle, without the coarser, harder-to-read modules "H" would draw for a
 * link this short.
 */
export function QrCode({
  value,
  className,
}: {
  /** The text or URL to encode. */
  value: string;
  className?: string;
}) {
  const qr = qrcode(0, "M");
  qr.addData(value);
  qr.make();

  const count = qr.getModuleCount();
  // A one-module quiet zone all round - the margin a scanner needs to lock
  // onto the pattern, folded into the viewBox rather than left to whoever
  // places this component to remember as outer padding.
  const size = count + 2;

  const modules: string[] = [];
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) {
        modules.push(`M${col + 1},${row + 1}h1v1h-1z`);
      }
    }
  }

  return (
    <svg
      role="img"
      aria-label={`QR code linking to ${value}`}
      className={className}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
    >
      {/* One path for every dark module, not one <rect> each - a ~30x30
          matrix is 500+ modules, and a single path node parses and paints
          as one shape instead of hundreds. */}
      <path d={modules.join(" ")} fill="currentColor" />
    </svg>
  );
}
