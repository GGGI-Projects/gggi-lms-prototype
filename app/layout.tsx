import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { BRAND } from "@/lib/brand";
import { PERF_TIER_SCRIPT } from "@/lib/perf-tier";
import { PerfWatchdog } from "@/components/motion/perf-watchdog";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
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
 * the 65px hero headline and the oversized 01-05 module numerals hold
 * together as shapes rather than as rows of letters.
 *
 * Source Sans 3 carries body copy, labels and metadata. It is a text face
 * first - open apertures, narrower set width - so the long paragraphs in the
 * mission and FAQ sections stay comfortable at 17px, and it sets more words
 * per line than the display face would.
 *
 * Both are loaded variable, so the whole weight axis costs one file per family
 * rather than one file per weight.
 *
 * SELF-HOSTED, not `next/font/google`. That was the original setup, and
 * `next/font/google` still does the fetching-and-caching work for you - the
 * problem is it does it live, over the network, the first time each machine
 * builds (nothing is committed, `.next`'s cache is the only copy). A flaky
 * or firewalled connection to fonts.gstatic.com fails the whole build with
 * `Module not found` before a single page renders. These two files are the
 * exact same latin-subset, variable-weight woff2s Google would have served
 * (fetched once via the same `fonts.googleapis.com/css2` request the
 * `next/font/google` loader makes internally, weight ranges matched to what
 * was requested below), just committed to the repo instead of fetched at
 * build time - `next/font/local` still gets you the zero-layout-shift,
 * self-hosted-at-build behaviour, it just isn't the one doing the fetching.
 */
const hankenGrotesk = localFont({
  src: "./fonts/hanken-grotesk-latin-variable.woff2",
  weight: "100 900",
  variable: "--font-hanken",
  display: "swap",
});

const sourceSans = localFont({
  src: "./fonts/source-sans-3-latin-variable.woff2",
  weight: "200 900",
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} ${BRAND.suffix} - ${BRAND.slogan}`,
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
        {/*
          Picks the performance tier before anything paints. A plain inline
          script rather than `next/script`, deliberately: this has to run
          synchronously while the document is being parsed, so that the very
          first frame is already the right version of the page. As the first
          child of <body> it executes before any of the content below it is
          laid out, and it only sets one attribute on <html>. See lib/perf-tier.ts.
        */}
        <script dangerouslySetInnerHTML={{ __html: PERF_TIER_SCRIPT }} />
        <PerfWatchdog />
        <SmoothScroll />
        {children}
        {/* Paper grain veil over the whole page. Purely decorative - and the
            first thing the low tier drops, because a fixed full-viewport layer
            over a scrolling page is paid for on every scrolled frame. */}
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
