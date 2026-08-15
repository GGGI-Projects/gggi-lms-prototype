import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { AuthHeader } from "@/components/auth/auth-header";
import { ConsoleLoginForm } from "@/components/auth/console-login-form";
import { BODY, EYEBROW, HEADING } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Staff sign in",
  description: `Sign in to the ${BRAND.name} ${BRAND.suffix} console with the email and password your administrator set up for you.`,
};

/**
 * The door administrators and instructors use - not the one on `/login`.
 *
 * Reuses `<AuthHeader>` for the wordmark, same as every other account route,
 * but does NOT reuse `<AuthShell>`. That shell's dark aside argues for
 * creating a free learner account - no card, no prerequisite, cancel any
 * time - and none of that is true of a staff seat, which somebody else on the
 * team had to create first. A single narrow column, closer to
 * `/verify-email`'s, says "this is a different kind of door" without having
 * to say it in a sentence.
 */
export default function ConsoleLoginPage() {
  return (
    <div className="flex flex-1 flex-col [--header-h:4.25rem]">
      <AuthHeader
        alt={{
          prompt: "Not staff?",
          label: "Student sign in",
          href: BRAND.routes.login,
        }}
      />

      <main className="flex flex-1 justify-center px-6 py-16 sm:px-10 lg:items-center lg:py-0">
        <div className="animate-rise w-full max-w-md lg:py-14">
          <p className={EYEBROW.onLight}>Staff and instructors</p>
          <h1 className={HEADING.section}>Sign in to the console</h1>
          <p className={`mt-5 ${BODY.base}`}>
            Use the email and password your administrator set up for you.
          </p>

          <ConsoleLoginForm />

          {/* The header's pill, for the phones it does not fit on - same
              fallback `<AuthShell>` uses under the form. */}
          <p className="mt-8 border-t border-surface-deep pt-8 text-center text-lg text-muted sm:hidden">
            Not staff?{" "}
            <Link
              href={BRAND.routes.login}
              className="link-wipe font-semibold text-primary"
            >
              Student sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
