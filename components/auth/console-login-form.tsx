"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { ActionButton } from "@/components/ui/action-button";
import { PasswordField, TextField } from "@/components/auth/fields";
import { PortalSelectDialog } from "@/components/auth/portal-select-dialog";

/**
 * The staff sign-in form.
 *
 * TWO fields, and no Google button. A staff account is provisioned by an
 * administrator rather than self-served - see `manageAdmins` and
 * `manageLecturers` in `lib/permissions.ts` - so there is nothing here for
 * a visitor to create, and one-tap Google would suggest otherwise.
 *
 * Nothing is wired up - see the note on `submitted` below. Where this
 * differs from `<LoginForm>`'s equivalent: accepting the password does not
 * navigate anywhere by itself. It opens `<PortalSelectDialog>` instead - see
 * the note there for why a portal has to be chosen before there is anywhere
 * to send a staff sign-in.
 */
export function ConsoleLoginForm() {
  const [submitted, setSubmitted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    const id = window.setTimeout(() => setDialogOpen(true), 700);
    return () => window.clearTimeout(id);
  }, [submitted]);

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (submitted) return;
          setSubmitted(true);
        }}
        className="mt-10"
      >
        <div className="space-y-6">
          <TextField
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@organisation.org"
          />

          <PasswordField
            label="Password"
            name="password"
            autoComplete="current-password"
          />
        </div>

        <div className="mt-9">
          <ActionButton type="submit" variant="solid" size="lg" className="group w-full">
            {submitted ? "Signing in…" : "Sign in"}
            <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
              →
            </span>
          </ActionButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Staff accounts are set up by an administrator. Lost your password?{" "}
        <a
          href={`mailto:${BRAND.email}`}
          className="link-wipe font-semibold text-primary"
        >
          Ask them to reset it
        </a>
        .
      </p>

      <PortalSelectDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          // Closing without picking a portal is a change of mind, not a
          // completed sign-in - the form goes back to offering "Sign in"
          // rather than being stuck on "Signing in…" with nowhere to go.
          setSubmitted(false);
        }}
      />
    </>
  );
}
