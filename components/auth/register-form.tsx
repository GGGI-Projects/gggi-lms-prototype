"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/brand";
import {
  REGISTRATION_EMAIL_KEY,
  REGISTRATION_NAME_KEY,
  REGISTRATION_PROVINCE_KEY,
} from "@/lib/auth";
import { NATIONAL_LEARNER, PROVINCES } from "@/content/laws";
import { ActionButton } from "@/components/ui/action-button";
import { PasswordField, SelectField, TextField } from "@/components/auth/fields";

/**
 * The registration form.
 *
 * SIX FIELDS NOW, NOT FIVE (see docs/SRS.md FR-AUTH-010) - Province joins
 * name, email, password, "where you work" and consent, because it decides
 * something the platform genuinely needs: which Provincial Registrar reviews
 * this application, and later, which laws sit first on this learner's own
 * Laws tab. It is asked here, once, and read twice for those two different
 * reasons rather than being asked twice.
 *
 * NO GOOGLE BUTTON. It sat here once, above a divider, before the ministry
 * pivot removed it outright (FR-AUTH-030) - not deferred, not hidden behind a
 * flag, gone, because there is no "one tap" version of an application a human
 * reviewer has to read.
 *
 * SUBMITTING DOES NOT CREATE AN ACCOUNT. It creates a pending application -
 * see the status page this hands off to, and the note on `submitted` below.
 */
export function RegisterForm() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  // What the applicant typed, kept only long enough to hand to the
  // application-status page - see the three keys in `lib/auth.ts`.
  const details = useRef({ name: "", email: "", province: "" });

  useEffect(() => {
    if (!submitted) return;
    const id = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(REGISTRATION_NAME_KEY, details.current.name);
        window.sessionStorage.setItem(REGISTRATION_EMAIL_KEY, details.current.email);
        window.sessionStorage.setItem(
          REGISTRATION_PROVINCE_KEY,
          details.current.province,
        );
      } catch {
        // Storage can be unavailable (private browsing, locked-down
        // browsers) - the status page falls back to generic copy.
      }
      router.push(BRAND.routes.applicationStatus);
    }, 900);
    return () => window.clearTimeout(id);
  }, [submitted, router]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        details.current = {
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          province: String(data.get("province") ?? ""),
        };
        setSubmitted(true);
      }}
      className="mt-10"
    >
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
          hint="Used to sign in, and to tell you the outcome of your application."
        />

        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          meter
        />

        <SelectField
          label="Province"
          name="province"
          options={[...PROVINCES, NATIONAL_LEARNER]}
          hint="Routes your application to that province's registrar, and later orders your own Laws tab. Choose National / Head Office if you are not based in a specific province."
        />

        <SelectField
          label="Where you work"
          name="sector"
          options={SECTORS}
          optional
          hint="Helps us see which modules to build next. It never affects what you can enrol in."
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
          Submit my application
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
          This is a design prototype - nothing was submitted anywhere. Taking
          you to the application-status page next, the way a real submission
          would.
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-muted">
        Free forever · No card required · Reviewed by your province
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
