"use client";

import { useSyncExternalStore } from "react";
import { useState } from "react";
import { BRAND } from "@/lib/brand";
import {
  REGISTRATION_EMAIL_KEY,
  REGISTRATION_NAME_KEY,
  REGISTRATION_PROVINCE_KEY,
} from "@/lib/auth";
import { NATIONAL_LEARNER } from "@/content/laws";
import { ActionButton } from "@/components/ui/action-button";
import { EYEBROW, HEADING } from "@/lib/theme";

/**
 * The screen between "Submit my application" and a usable account.
 *
 * REPLACES THE OLD EMAIL-CONFIRMATION SCREEN OUTRIGHT (FR-AUTH-050) - a human
 * reviewer already stands between an application and sign-in, so a second,
 * automated identity check ahead of that review would be a redundant hurdle,
 * not an extra safeguard. There is nothing to resend here.
 *
 * A CLIENT COMPONENT reading `sessionStorage`, same device as the old
 * `<VerifyEmailPanel>` it replaces - see the note there in git history, and
 * the one on the three keys in `lib/auth.ts`. Arriving with nothing stored
 * (a bookmark, a refresh after the tab closed, someone typing the URL
 * directly) is not an error state, and the copy degrades to generic
 * pronouns rather than looking broken.
 *
 * THE VIEW SWITCHER AT THE TOP IS A PROTOTYPE DEVICE, clearly labelled as
 * one - this build has no backend to actually decide whether an application
 * is pending, rejected or approved, so the only honest way to show the
 * client every state FR-AUTH-050/FR-AUTH-025/FR-REG-020 describe is to let
 * the screen preview all three on demand, the same spirit as the admin
 * console's own role-viewpoint switcher.
 */
export function ApplicationStatusPanel() {
  const name = useSyncExternalStore(
    subscribeToNothing,
    () => readStored(REGISTRATION_NAME_KEY),
    getServerSnapshot,
  );
  const email = useSyncExternalStore(
    subscribeToNothing,
    () => readStored(REGISTRATION_EMAIL_KEY),
    getServerSnapshot,
  );
  const province = useSyncExternalStore(
    subscribeToNothing,
    () => readStored(REGISTRATION_PROVINCE_KEY),
    getServerSnapshot,
  );
  const [view, setView] = useState<"pending" | "rejected" | "approved">("pending");

  const reviewer =
    province === NATIONAL_LEARNER
      ? "the Super Administrator"
      : province
        ? `the ${province} Provincial Registrar`
        : "your province's registrar";

  return (
    <div className="animate-rise w-full max-w-lg text-center">
      {view === "pending" ? (
        <PendingView name={name} email={email} reviewer={reviewer} />
      ) : view === "rejected" ? (
        <RejectedView email={email} province={province} />
      ) : (
        <ApprovedView name={name} />
      )}

      {/* The demo-only preview switcher - see the note above. */}
      <div className="mt-12 rounded-sm border border-dashed border-muted-light bg-paper-raised px-6 py-5 text-left">
        <p className="text-sm font-semibold text-ink">
          Design prototype - preview every outcome
        </p>
        <p className="mt-1 text-sm text-muted">
          There is no backend behind this screen to decide a real outcome, so
          switch between the three a real review can end in.
        </p>
        <div role="group" aria-label="Preview application outcome" className="mt-4 flex flex-wrap gap-2">
          {(
            [
              { value: "pending", label: "Pending" },
              { value: "rejected", label: "Rejected" },
              { value: "approved", label: "Approved" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setView(option.value)}
              aria-pressed={view === option.value}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-300 ${
                view === option.value
                  ? "border-primary bg-primary text-paper"
                  : "border-surface-deep bg-paper text-ink-soft hover:border-muted-light hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- views */

function PendingView({
  name,
  email,
  reviewer,
}: {
  name: string | null;
  email: string | null;
  reviewer: string;
}) {
  return (
    <>
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-paper">
        <ClockIcon className="size-7" />
      </span>

      <p className={`${EYEBROW.onLight} mt-7`}>Application received</p>
      <h1 className={HEADING.section}>Thanks - your application is in.</h1>

      <p className="mt-5 text-lg leading-relaxed text-ink-soft">
        {name ? (
          <>
            <span className="font-semibold text-ink">{name}</span>&rsquo;s
            application has
          </>
        ) : (
          "It has"
        )}{" "}
        gone to {reviewer} for review
        {email ? (
          <>
            {" "}
            - we&rsquo;ll email{" "}
            <span className="font-semibold text-ink">{email}</span> the
            moment there&rsquo;s a decision
          </>
        ) : null}
        . Most applications are decided quickly. There is no confirmation
        link to find or click - a human reviews this next, not an inbox.
      </p>

      <div className="mt-9">
        <ActionButton
          href={BRAND.routes.login}
          variant="solid"
          size="lg"
          className="w-full sm:w-auto sm:min-w-72"
        >
          Check back later - sign in
        </ActionButton>
      </div>
    </>
  );
}

function RejectedView({
  email,
  province,
}: {
  email: string | null;
  province: string | null;
}) {
  const [resubmitted, setResubmitted] = useState(false);

  return (
    <>
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-clay text-paper">
        <AlertIcon className="size-7" />
      </span>

      <p className={`${EYEBROW.onLight} mt-7`}>Not approved yet</p>
      <h1 className={HEADING.section}>Your application needs a fix.</h1>

      <p className="mt-5 text-lg leading-relaxed text-ink-soft">
        {province
          ? `The ${province === "National / Head Office" ? "Super Administrator" : `${province} Provincial Registrar`} left a reason: `
          : "The reviewer left a reason: "}
        <span className="font-semibold text-ink">
          &ldquo;Work email address could not be confirmed as a ministry
          address - please reapply from your official email.&rdquo;
        </span>
      </p>

      <p className="mt-4 text-lg leading-relaxed text-ink-soft">
        This is not final. Edit any field - including your province - and
        send it again; it reopens the same application rather than starting a
        new one.
      </p>

      <div className="mt-9 flex flex-col items-center gap-4">
        <ActionButton
          href={BRAND.routes.register}
          variant="solid"
          size="lg"
          className="w-full sm:w-auto sm:min-w-72"
        >
          Edit and resubmit
        </ActionButton>

        <button
          type="button"
          onClick={() => setResubmitted(true)}
          className="text-sm font-semibold text-primary"
        >
          Or resubmit as-is, unchanged
        </button>
      </div>

      {resubmitted ? (
        <p
          role="status"
          className="mt-6 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
        >
          Prototype - nothing was resubmitted{email ? ` for ${email}` : ""}. A
          real resend would reopen this exact application as pending again.
        </p>
      ) : null}
    </>
  );
}

function ApprovedView({ name }: { name: string | null }) {
  return (
    <>
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-paper">
        <CheckIcon className="size-7" />
      </span>

      <p className={`${EYEBROW.onLight} mt-7`}>Application approved</p>
      <h1 className={HEADING.section}>You&rsquo;re approved.</h1>

      <p className="mt-5 text-lg leading-relaxed text-ink-soft">
        {name ? (
          <>
            Welcome, <span className="font-semibold text-ink">{name}</span>.
            Sign
          </>
        ) : (
          "Sign"
        )}{" "}
        in with the email and password you registered with - your account is
        active, no further steps needed.
      </p>

      <div className="mt-9">
        <ActionButton
          href={BRAND.routes.login}
          variant="solid"
          size="lg"
          className="w-full sm:w-auto sm:min-w-72"
        >
          Sign in and start
        </ActionButton>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ store */

function subscribeToNothing() {
  return () => {};
}

function readStored(key: string): string | null {
  try {
    const value = window.sessionStorage.getItem(key);
    return value ? value : null;
  } catch {
    return null;
  }
}

/** What the server renders, since it has no `sessionStorage` to read. */
function getServerSnapshot() {
  return null;
}

/* ------------------------------------------------------------------ icons */

function ClockIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
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
      <path d="M12 3.5 2.5 20.5h19Z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17.5" r="0.15" fill="currentColor" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
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
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}
