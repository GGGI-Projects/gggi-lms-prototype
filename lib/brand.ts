/**
 * ============================================================================
 * BRAND - single source of truth for the platform's identity.
 * ============================================================================
 *
 * The platform is deliberately UNBRANDED with respect to GGGI. Nothing in this
 * file, or anywhere in the app, should reference GGGI, its logo, or its colors.
 * It reads as a standalone product.
 *
 * The name below is a PLACEHOLDER. When the client settles on a name, change
 * `name` / `shortName` / `slogan` here and it propagates to the header, the
 * footer, page metadata, the certificate mock and every piece of copy.
 */
export const BRAND = {
  /** Full product name, used in the wordmark and page titles. */
  name: "GreenFin",
  /** Second word of the wordmark; set to "" for a single-word brand. */
  suffix: "Academy",
  /** Used where space is tight (mobile nav, favicon-adjacent contexts). */
  shortName: "GreenFin",
  /** One line. Shows in the page title and the footer. */
  slogan: "Streamlining corporate sustainable finance",
  /** Longer description for <meta name="description">. */
  description:
    "Free, self-paced modules in climate finance, climate vulnerability, adaptation planning and gender-responsive governance - built for Sri Lanka's corporate sustainability and finance teams, open to everyone. Earn a verifiable certificate of completion.",
  /** Country the first cohort runs in. */
  country: "Sri Lanka",
  /** Placeholder contact details for the prototype. */
  email: "hello@greenfin.lk",
  /** Prototype only - no real routes behind these yet. */
  routes: {
    signup: "/signup",
    login: "/login",
    verifyEmail: "/verify-email",
    consoleLogin: "/console/login",
    modules: "#modules",
    dashboard: "/dashboard",
  },
} as const;
