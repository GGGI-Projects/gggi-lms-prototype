import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LeafMark } from "@/components/art/scenes";

const COLUMNS = [
  {
    heading: "Platform",
    links: [
      { label: "Programmes", href: "#programmes" },
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
      <div className="mx-auto max-w-editorial px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5"
              aria-label={`${BRAND.name} ${BRAND.suffix} - home`}
            >
              <span className="grid size-9 place-items-center rounded-full bg-tint-mist text-primary">
                <LeafMark className="size-5" />
              </span>
              <span className="font-display text-[1.15rem] leading-none tracking-tight text-paper">
                {BRAND.name}
                {BRAND.suffix ? (
                  <span className="text-primary-500"> {BRAND.suffix}</span>
                ) : null}
              </span>
            </Link>
            <p className="measure mt-5 text-[0.95rem] leading-relaxed">
              {BRAND.tagline}. Free, self-paced, and open to anyone - no cost at
              any stage, and no revenue expected from it.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <h2 className="label-eyebrow text-primary-500">{column.heading}</h2>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="link-wipe text-[0.9rem] transition-colors hover:text-paper"
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

        <div className="mt-16 flex flex-col gap-4 border-t border-primary-800 pt-8 text-[0.8rem] text-primary-500 sm:flex-row sm:items-center sm:justify-between">
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
