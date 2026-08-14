"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { ActionButton } from "@/components/ui/action-button";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordField, TextField } from "@/components/auth/fields";

/**
 * The sign-in form.
 *
 * TWO fields, and it must never grow a third. Sign-in is not a place to ask
 * anything - every question here is asked of someone who has already answered
 * it once and is now standing outside their own account.
 *
 * Same order as sign-up, deliberately: Google first, then the divider, then
 * email. Someone who created their account with the Google button will look for
 * it in the place they last saw it, and finding the email fields there instead
 * is how a person ends up locked out of an account they can see.
 *
 * Nothing is wired up - see the note on `submitted` below.
 */
export function LoginForm() {
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
        <span className="text-sm text-muted">or sign in with email</span>
        <span className="rule flex-1" />
      </div>

      <div className="space-y-6">
        <TextField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />

        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          action={
            <Link href="#" className="link-wipe text-sm font-semibold text-primary">
              Forgot password?
            </Link>
          }
        />
      </div>

      <label className="mt-8 flex cursor-pointer items-center gap-3.5 text-lg text-ink-soft">
        <input type="checkbox" name="remember" defaultChecked className="checkbox" />
        Keep me signed in on this device
      </label>

      <div className="mt-9">
        <ActionButton type="submit" variant="solid" size="lg" className="group w-full">
          Sign in
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
          This is a design prototype - no account was signed in and nothing was
          sent anywhere.
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-muted">
        Trouble getting in? Write to{" "}
        <a href={`mailto:${BRAND.email}`} className="link-wipe font-semibold text-primary">
          {BRAND.email}
        </a>
      </p>
    </form>
  );
}
