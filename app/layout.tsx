import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Source_Sans_3 } from "next/font/google";
import { BRAND } from "@/lib/brand";
import "./globals.css";

/**
 * Two families: one that sets the headlines, one that carries the reading.
 *
 * Headings were originally a display serif, which read as decorative rather
 * than institutional; the page then ran on a single sans for everything, which
 * was legible but gave the hierarchy nothing to work with beyond size and
 * weight. This is the middle position - two sans faces close enough in
 * temperament that the page still reads as one document, different enough that
 * a heading is recognisably not body copy.
 *
 * Hanken Grotesk sets every heading, numeral and the wordmark. It is a
 * grotesque with tight, even spacing and a large x-height, which is what makes
 * the 65px hero headline and the oversized 01-05 programme numerals hold
 * together as shapes rather than as rows of letters.
 *
 * Source Sans 3 carries body copy, labels and metadata. It is a text face
 * first - open apertures, narrower set width - so the long paragraphs in the
 * mission and FAQ sections stay comfortable at 17px, and it sets more words
 * per line than the display face would.
 *
 * Both are loaded variable, so the whole weight axis costs one file per family
 * rather than one file per weight.
 */
const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} ${BRAND.suffix} - ${BRAND.tagline}`,
    template: `%s · ${BRAND.name} ${BRAND.suffix}`,
  },
  description: BRAND.description,
};

export const viewport: Viewport = {
  themeColor: "#fbf7ef",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
        {/* Paper grain veil over the whole page. Purely decorative. */}
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
