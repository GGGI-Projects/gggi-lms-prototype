"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { ActionButton } from "@/components/ui/action-button";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordField, SelectField, TextField } from "@/components/auth/fields";

/**
 * The sign-up form.
 *
 * FIVE fields, and every one of them earns its place: a name for the
 * certificate, an email to sign in with, a password, where the person works,
 * and consent. Everything else a form like this usually asks for - district,
 * department, phone number, NIC - is something the platform does not need in
 * order to teach anyone, and each one measurably costs completions.
 *
 * Google is offered FIRST, above the divider. Most people arriving here have a
 * Google account already, and burying the one-tap route under a form that takes
 * a minute to fill in is a choice made for the developer's convenience rather
 * than the visitor's.
 *
 * Nothing is wired up - see the note on `submitted` below.
 */
export function SignupForm() {
  // The prototype has no backend. Rather than silently doing nothing, the form
  // says so: a demo where the button appears broken invites the room to spend
  // the next five minutes on it instead of on the design.
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
      className="mt-10"
    >
      <GoogleButton />

      <div className="my-8 flex items-center gap-4">
        <span className="rule flex-1" />
        <span className="text-sm text-muted">or sign up with email</span>
        <span className="rule flex-1" />
      </div>

      <div className="space-y-6">
        <TextField
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Your name as it should appear on certificates"
        />

        <TextField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          hint="Used to sign in and to send your certificates. Nothing else."
        />

        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          meter
        />

        <SelectField
          label="Where you work"
          name="sector"
          options={SECTORS}
          optional
          hint="Helps us see which programmes to build next. It never affects what you can enrol in."
        />
      </div>

      {/* Consent is a checkbox the visitor ticks, never a pre-ticked box or an
          "by continuing you agree" line under the button. */}
      <label className="mt-8 flex cursor-pointer items-start gap-3.5 text-lg leading-relaxed text-ink-soft">
        <input type="checkbox" name="terms" required className="checkbox mt-1.5" />
        <span>
          I agree to the{" "}
          <Link href="#" className="link-wipe font-semibold text-primary">
            terms of use
          </Link>{" "}
          and the{" "}
          <Link href="#" className="link-wipe font-semibold text-primary">
            privacy notice
          </Link>
          .
        </span>
      </label>

      <div className="mt-9">
        <ActionButton type="submit" variant="solid" size="lg" className="group w-full">
          Create my free account
          <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
            →
          </span>
        </ActionButton>
      </div>

      {submitted ? (
        <p
          role="status"
          className="mt-5 rounded-sm border border-accent-600/40 bg-accent-pale px-5 py-4 text-lg leading-relaxed text-accent-strong"
        >
          This is a design prototype - no account was created and nothing was
          sent anywhere.
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-muted">
        Free forever · No card required · Open to anyone in {BRAND.country}
      </p>
    </form>
  );
}

/**
 * The audience groups from the landing page, in the same order, plus a way out
 * for anyone who is none of them. "Where you work" is asked as a single select
 * because it is a curriculum-planning question, not a profile.
 */
const SECTORS = [
  "Government or public sector",
  "Provincial or local authority",
  "Private sector",
  "NGO or development organisation",
  "University or school",
  "Something else",
] as const;
