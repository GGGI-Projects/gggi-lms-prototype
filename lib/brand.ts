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
 * `name` / `shortName` / `tagline` here and it propagates to the header, the
 * footer, page metadata, the certificate mock and every piece of copy.
 */
export const BRAND = {
  /** Full product name, used in the wordmark and page titles. */
  name: "GreenPath",
  /** Second word of the wordmark; set to "" for a single-word brand. */
  suffix: "Academy",
  /** Used where space is tight (mobile nav, favicon-adjacent contexts). */
  shortName: "GreenPath",
  /** One line. Shows in metadata and the footer. */
  tagline: "Foundations for Sri Lanka's climate and inclusion agenda",
  /** Longer description for <meta name="description">. */
  description:
    "Free, self-paced modules in climate vulnerability, adaptation planning, climate finance and gender-responsive governance - built for Sri Lanka's public sector, open to everyone. Earn a verifiable certificate of completion.",
  /** Country the first cohort runs in. */
  country: "Sri Lanka",
  /** Placeholder contact details for the prototype. */
  email: "hello@greenpath.lk",
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
