"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { BRAND } from "@/lib/brand";
import { LeafMark } from "@/components/art/scenes";
import { ActionButton } from "@/components/ui/action-button";

const NAV = [
  { label: "Programmes", href: "#programmes" },
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
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
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
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-(--header-h) border-b transition-[background-color,border-color,backdrop-filter] duration-500 ${scrolled ? "backdrop-blur-md" : ""
          }`}
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
        <div className="px-fluid grid h-full w-full grid-cols-[auto_1fr_auto] items-center gap-6">
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
            <span className="font-display whitespace-nowrap text-[1.15rem] leading-none tracking-tight sm:text-[1.4rem]">
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
          <nav
            className="hidden items-center gap-9 justify-self-center lg:flex"
            aria-label="Primary"
            style={{ color: "var(--season-text, #eaf7f0)" }}
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="link-wipe text-[0.95rem] font-medium text-current"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 justify-self-end sm:gap-3">
            <ActionButton
              href={BRAND.routes.login}
              variant="outlined"
              className="hidden px-6 py-3 text-[0.9rem] font-semibold lg:inline-flex"
            >
              Sign in
            </ActionButton>
            <ActionButton
              href={BRAND.routes.signup}
              variant="filled"
              className="hidden px-6 py-3 text-[0.9rem] font-semibold sm:inline-flex"
            >
              Get started
            </ActionButton>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="grid size-10 place-items-center rounded-full lg:hidden"
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
                  className="border-b py-5 font-display text-3xl tracking-tight"
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
                className="w-full px-6 py-4 font-semibold"
              >
                Create a free account
              </ActionButton>
              <ActionButton
                href={BRAND.routes.login}
                variant="outlined"
                className="w-full px-6 py-4 font-medium"
              >
                Sign in
              </ActionButton>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
