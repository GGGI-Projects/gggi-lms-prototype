import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BRAND } from "@/lib/brand";
import "./globals.css";

/**
 * One family for everything - headlines, numerals and body.
 *
 * Headings used to be set in a display serif. It read as decorative rather
 * than legible, so the page now runs on a single, plainly readable sans and
 * gets its hierarchy from size, weight and spacing instead of from a contrast
 * of typefaces.
 */
const inter = Inter({
  variable: "--font-inter",
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
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
        {/* Paper grain veil over the whole page. Purely decorative. */}
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
