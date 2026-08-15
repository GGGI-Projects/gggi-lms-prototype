"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { SIGNUP_EMAIL_KEY } from "@/lib/auth";
import { ActionButton } from "@/components/ui/action-button";
import { EYEBROW, HEADING } from "@/lib/theme";

/** Seconds the resend button stays disabled after it fires. Long enough that
 *  a second click reads as impatience rather than a form that ate the first
 *  one; short enough that nobody is stuck watching a countdown. */
const RESEND_COOLDOWN = 30;

/**
 * The screen between "Create my free account" and an active one.
 *
 * A CLIENT COMPONENT, and the whole page is one because the one thing it
 * needs - which address the link went to - only exists in `sessionStorage`,
 * set by `<SignupForm>` on the way out. See the note on `SIGNUP_EMAIL_KEY`.
 *
 * Arriving here with nothing in storage (a bookmark, a refresh after the tab
 * was closed and reopened, someone typing the URL directly) is not an error
 * state - it is just a visitor who did not just come from the form. The copy
 * below degrades to "the address you signed up with" rather than showing a
 * blank or throwing up a warning, because the one thing this page must never
 * do is look broken to someone who did nothing wrong.
 */
export function VerifyEmailPanel() {
  // `sessionStorage` is an external store the server can't see, so it is read
  // through `useSyncExternalStore` rather than an effect + `setState`: the
  // server snapshot (`null`) is what gets rendered on the first paint, and
  // the client reads the real value on the very same pass instead of
  // painting the fallback copy first and swapping it in a beat later.
  const email = useSyncExternalStore(
    subscribeToNothing,
    getStoredEmail,
    getServerEmail,
  );
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [cooldown, setCooldown] = useState(0);

  // One ticking interval for the whole cooldown, cleared on unmount and
  // whenever it reaches zero - not one `setTimeout` per second.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      setCooldown((seconds) => seconds - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  // The "sending…" state is its own timeout, held separately from the
  // cooldown's interval so the two can be reasoned about on their own.
  const sendingTimeout = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(sendingTimeout.current), []);

  const resend = () => {
    if (status === "sending" || cooldown > 0) return;
    setStatus("sending");
    sendingTimeout.current = window.setTimeout(() => {
      setStatus("sent");
      setCooldown(RESEND_COOLDOWN);
    }, 700);
  };

  return (
    <div className="animate-rise w-full max-w-lg text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-paper">
        <MailIcon className="size-7" />
      </span>

      <p className={`${EYEBROW.onLight} mt-7`}>Verify your email</p>
      <h1 className={HEADING.section}>Check your inbox</h1>

      <p className="mt-5 text-lg leading-relaxed text-ink-soft">
        We&apos;ve sent a verification link to{" "}
        {email ? (
          <span className="font-semibold text-ink">{email}</span>
        ) : (
          "the address you signed up with"
        )}
        . Open it to activate your account - the link is valid for 24 hours.
      </p>

      <div className="mt-9 flex flex-col items-center gap-4">
        <ActionButton
          type="button"
          variant="solid"
          size="lg"
          onClick={resend}
          className="w-full sm:w-auto sm:min-w-72"
        >
          {status === "sending"
            ? "Sending…"
            : cooldown > 0
              ? `Resend email (${formatCooldown(cooldown)})`
              : status === "sent"
                ? "Send it again"
                : "Resend verification email"}
        </ActionButton>

        <p className="text-sm text-muted">
          Wrong address?{" "}
          <Link
            href={BRAND.routes.signup}
            className="link-wipe font-semibold text-primary"
          >
            Go back and edit it
          </Link>
        </p>
      </div>

      {status === "sent" ? (
        <p
          role="status"
          className="mt-8 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
        >
          This is a design prototype - no email was actually sent. A real
          account would get a fresh link now, and the button above will
          unlock again in {formatCooldown(RESEND_COOLDOWN)}.
        </p>
      ) : null}
    </div>
  );
}

/** The address never changes while this page is open, so there is nothing to
 *  subscribe to - `useSyncExternalStore` still requires the function. */
function subscribeToNothing() {
  return () => {};
}

function getStoredEmail() {
  try {
    return window.sessionStorage.getItem(SIGNUP_EMAIL_KEY);
  } catch {
    // Private browsing and a handful of locked-down browsers throw on
    // storage access rather than returning null - the generic copy in the
    // panel covers this the same way it covers a missing key.
    return null;
  }
}

/** What the server renders, since it has no `sessionStorage` to read. */
function getServerEmail() {
  return null;
}

/** `1:05`-style, not `65s` - the shape a countdown reads fastest at a glance. */
function formatCooldown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}
