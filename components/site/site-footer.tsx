import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LeafMark } from "@/components/art/scenes";

const COLUMNS = [
  {
    heading: "Platform",
    links: [
      { label: "Modules", href: "#modules" },
      { label: "How it works", href: "#how-it-works" },
      { label: "The certificate", href: "#certificate" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Create an account", href: BRAND.routes.signup },
      { label: "Sign in", href: BRAND.routes.login },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Questions", href: "#faq" },
      { label: BRAND.email, href: `mailto:${BRAND.email}` },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-primary-800 bg-primary-950 text-tint">
      {/* `px-fluid`, not the editorial container.
       *
       * The footer used to be `mx-auto max-w-editorial px-5 sm:px-8`, which
       * put its wordmark 144px from the left at 1440 while the header's sat at
       * 86px - the same mark, at the top and bottom of the same page, on two
       * different left edges. At 1920 the gap was 269px.
       *
       * The page runs on TWO rails and this is the frame's, not the column's:
       * the header, the hero and now the footer are full-bleed on `px-fluid`,
       * and everything between them is editorial content on `CONTAINER`. So
       * the footer is deliberately WIDER than the sections above it - it is
       * the bottom edge of the frame, and it lines up with the top edge. */}
      <div className="px-fluid py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5"
              aria-label={`${BRAND.name} ${BRAND.suffix} - home`}
            >
              <span className="grid size-9 place-items-center rounded-full bg-tint-mist text-primary">
                <LeafMark className="size-6" />
              </span>
              <span className="font-display text-lg leading-none tracking-tight text-paper">
                {BRAND.name}
                {BRAND.suffix ? (
                  <span className="text-primary-500"> {BRAND.suffix}</span>
                ) : null}
              </span>
            </Link>
            <p className="measure mt-5 text-lg leading-relaxed">
              {BRAND.slogan}. Free, self-paced, and open to anyone - no cost at
              any stage, and no revenue expected from it.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <h2 className="label-eyebrow text-primary-500">{column.heading}</h2>
                {/* Padding on the link rather than gap on the list: it turns
                    a 17px-tall tap target into 33px without changing how far
                    apart the labels look. Footer links are the ones people
                    reach for one-handed on a phone. */}
                <ul className="mt-4 space-y-0.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="link-wipe inline-flex py-2 text-lg transition-colors hover:text-paper"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-primary-800 pt-8 text-sm text-primary-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.name} {BRAND.suffix}. Made for{" "}
            {BRAND.country}.
          </p>
          <p>
            Available in English. Sinhala and Tamil versions in preparation.
          </p>
        </div>
      </div>
    </footer>
  );
}
