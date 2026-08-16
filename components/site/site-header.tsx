"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { BRAND } from "@/lib/brand";
import { LeafMark } from "@/components/art/scenes";
import { ActionButton } from "@/components/ui/action-button";
import { setScrollLocked } from "@/components/motion/smooth-scroll";

const NAV = [
  { label: "Modules", href: "#modules" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Certificate", href: "#certificate" },
  { label: "Questions", href: "#faq" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  // Freeze the page behind the mobile menu while it is open.
  //
  // Both mechanisms are needed, not one or the other: `overflow: hidden` stops
  // the browser's own scrolling, and `setScrollLocked` stops Lenis, which keeps
  // its own scroll position and would otherwise carry on driving the page
  // underneath the overlay.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    setScrollLocked(menuOpen);
    return () => {
      document.body.style.overflow = "";
      setScrollLocked(false);
    };
  }, [menuOpen]);

  // Close on Escape, so the overlay is not a keyboard trap.
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    // One of the two elements that carry the seasonal clock - the hero section
    // is the other. It is a wrapper rather than the `<header>` itself because
    // the mobile menu is a sibling of the header, not a child, and it reads the
    // season tokens too. Both children are `fixed`, so this div has no size and
    // costs the layout nothing. See `.season-clock` in globals.css.
    <div className="season-clock">
      {/* NO `backdrop-blur`.
          The scrolled bar was `backdrop-blur-md`, and it was one of the most
          expensive things on the page for what it showed. Two reasons it had to
          go. First, it showed almost nothing: the background below is a 92%
          opaque mix, so only 8% of the backdrop was ever visible to be blurred.
          Second, that background reads `--season-ground`, which the year
          animation changes on every frame - so the blur could never be cached
          and the compositor re-blurred a full-width strip sixty times a second,
          for the whole time the bar was on screen.
          `backdrop-filter` is out of the transition list for the same reason. */}
      <header
        className="fixed inset-x-0 top-0 z-50 h-(--header-h) border-b transition-[background-color,border-color] duration-500"
        style={{
          // Once past the hero the page is light, so the bar settles rather
          // than continuing to change hue over pale content.
          backgroundColor: scrolled
            ? "color-mix(in oklab, var(--season-ground, #0b2b24) 92%, transparent)"
            : "transparent",
          borderColor: scrolled
            ? "color-mix(in oklab, var(--season-text, #eaf7f0) 14%, transparent)"
            : "transparent",
        }}
      >
        <div className="px-fluid grid h-full w-full grid-cols-[auto_1fr_auto] items-center gap-4 xl:gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            style={{ color: "var(--season-text, #eaf7f0)" }}
            aria-label={`${BRAND.name} ${BRAND.suffix} - home`}
          >
            <span
              className="grid size-9 place-items-center rounded-full transition-transform duration-500 ease-out-expo group-hover:-rotate-12"
              style={{
                backgroundColor: "var(--season-accent, #5fe0a8)",
                color: "var(--season-ground, #0b2b24)",
              }}
            >
              <LeafMark className="size-5" />
            </span>
            {/* Exactly the footer's wordmark - `font-display text-lg
                leading-none tracking-tight`. It was 18.4px stepping up to
                22.4px, so the same mark was three sizes on one page depending
                on where you saw it, and the top of the page and the bottom of
                it disagreed about how big the brand is. The `sm:` step went
                with it: the footer does not grow at that breakpoint either. */}
            <span className="font-display whitespace-nowrap text-lg leading-none tracking-tight">
              {BRAND.name}
              {BRAND.suffix ? (
                <span style={{ color: "var(--season-text-muted, #9dc4b4)" }}>
                  {" "}
                  {BRAND.suffix}
                </span>
              ) : null}
            </span>
          </Link>

          {/* Colour is set once, here, and inherited by every link. Setting it
              per-link invites exactly one of them to drift out of step. */}
          {/* `gap-4` until xl, not a flat `gap-9`.
              Everything in this bar is now the Body step - wordmark, links and
              both button labels - and at 1024, the width where the nav first
              appears, that is 31px more than the 901px of available width can
              hold. The gap is where the room comes from: three gaps at 16px
              instead of 24 frees 24px, and the header grid's own gap frees
              another 16, which covers the type with a little to spare. Only
              the band that is tight is narrowed; 1280 up is untouched. */}
          <nav
            className="hidden items-center gap-4 justify-self-center lg:flex xl:gap-9"
            aria-label="Primary"
            style={{ color: "var(--season-text, #eaf7f0)" }}
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                /* Body step, the size the footer's links use. `font-medium`
                   stays where the footer's are plain: these sit over a moving,
                   photographic hero rather than a flat dark ground, and the
                   extra weight is what keeps them legible as the sky changes
                   underneath them. Weight, not size. */
                className="link-wipe whitespace-nowrap text-lg font-medium text-current"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 justify-self-end sm:gap-3">
            <ActionButton
              href={BRAND.routes.login}
              variant="outlined"
              size="sm"
              className="hidden lg:inline-flex"
            >
              Sign in
            </ActionButton>
            <ActionButton
              href={BRAND.routes.signup}
              variant="filled"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Get started
            </ActionButton>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="grid size-11 place-items-center rounded-full lg:hidden"
              style={{
                border:
                  "1px solid color-mix(in oklab, var(--season-text, #eaf7f0) 20%, transparent)",
                backgroundColor:
                  "color-mix(in oklab, var(--season-ground, #0b2b24) 60%, transparent)",
              }}
            >
              <span className="sr-only">
                {menuOpen ? "Close menu" : "Open menu"}
              </span>
              <span className="relative block h-3 w-4.5">
                <motion.span
                  animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
                  className="absolute inset-x-0 top-0 h-[1.5px]"
                  style={{ backgroundColor: "var(--season-text, #eaf7f0)" }}
                />
                <motion.span
                  animate={
                    menuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }
                  }
                  transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
                  className="absolute inset-x-0 bottom-0 h-[1.5px]"
                  style={{ backgroundColor: "var(--season-text, #eaf7f0)" }}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col justify-between px-6 pb-10 pt-[calc(var(--header-h)+2rem)] lg:hidden"
            style={{ backgroundColor: "var(--season-ground, #0b2b24)" }}
          >
            <nav className="flex flex-col" aria-label="Mobile">
              {NAV.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.08 + i * 0.07,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  /* Title step. This was 30px - a size nothing else on the
                     page used. The py-5 is what makes these a comfortable tap
                     target, not the point size. */
                  className="border-b py-5 font-display text-2xl tracking-tight"
                  style={{
                    color: "var(--season-text, #eaf7f0)",
                    borderColor:
                      "color-mix(in oklab, var(--season-text, #eaf7f0) 16%, transparent)",
                  }}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col gap-3"
            >
              <ActionButton
                href={BRAND.routes.signup}
                variant="filled"
                size="md"
                className="w-full"
              >
                Create a free account
              </ActionButton>
              <ActionButton
                href={BRAND.routes.login}
                variant="outlined"
                size="md"
                className="w-full"
              >
                Sign in
              </ActionButton>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
