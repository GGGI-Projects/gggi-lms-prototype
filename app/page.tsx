import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Hero } from "@/components/sections/hero";
import { SubjectMarquee } from "@/components/sections/subject-marquee";
import { Mission } from "@/components/sections/mission";
import { Programmes } from "@/components/sections/programmes";
import { Journey } from "@/components/sections/journey";
import { Certificate } from "@/components/sections/certificate";
import { Audience } from "@/components/sections/audience";
import { Faq } from "@/components/sections/faq";
import { ClosingCta } from "@/components/sections/closing-cta";
import { CursorGlow, ScrollProgress } from "@/components/motion/primitives";
import { SeasonProvider } from "@/components/hero/season-provider";

/**
 * Landing page.
 *
 * Section order is a deliberate argument: what this is (hero) → what it covers
 * (marquee) → why it exists (mission) → what you get (programmes) → how it
 * works (journey) → what you walk away with (certificate) → whether it is for
 * you (audience) → what is still worrying you (FAQ) → the ask (CTA).
 */
export default function Home() {
  return (
    // Owns the seasonal clock. It has to sit above both the header and the
    // hero, because they are siblings and the season tokens inherit downward.
    <SeasonProvider>
      <ScrollProgress />
      <CursorGlow />
      <SiteHeader />

      <main className="flex-1">
        <Hero />
        <SubjectMarquee />
        <Mission />
        <Programmes />
        <Journey />
        <Certificate />
        <Audience />
        <Faq />
        <ClosingCta />
      </main>

      <SiteFooter />
    </SeasonProvider>
  );
}
