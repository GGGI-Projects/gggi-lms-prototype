import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { AuthHeader } from "@/components/auth/auth-header";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";

export const metadata: Metadata = {
  title: "Verify your email",
  description: `Confirm your email address to activate your free ${BRAND.name} ${BRAND.suffix} account.`,
};

/**
 * The waiting room between sign-up and a usable account.
 *
 * Reuses `<AuthHeader>` rather than growing its own bar, for the same reason
 * `<AuthShell>` does: the wordmark has to sit at the same height, on the same
 * left edge, at the same size everywhere it appears, and a second header is
 * the fastest way to lose that.
 *
 * It does NOT reuse `<AuthShell>` itself, though. That component's dark aside
 * makes the case for creating an account - free, no card, cancel any time -
 * to someone who is about to fill in a form. That argument is already won
 * here; a visitor on this screen has just made the account. Repeating the
 * sales copy back at them while they wait for an email reads as not having
 * noticed they already said yes, so this route is a single centred column
 * instead - closer to the quiet, one-purpose feel of a confirmation dialog.
 */
export default function VerifyEmailPage() {
  return (
    <div className="flex flex-1 flex-col [--header-h:4.25rem]">
      <AuthHeader
        alt={{
          prompt: "Verified already?",
          label: "Sign in",
          href: BRAND.routes.login,
        }}
      />

      {/* Centred on every breakpoint, unlike `<AuthShell>`'s `lg:items-center` -
          that form can run taller than a phone viewport, this short
          confirmation panel never does. */}
      <main className="flex flex-1 items-center justify-center px-6 py-16 sm:px-10">
        <div className="flex w-full max-w-lg flex-col items-center">
          <VerifyEmailPanel />

          {/* The header's pill, for the phones it does not fit on - same
              fallback `<AuthShell>` uses under the form. */}
          <p className="mt-8 w-full border-t border-surface-deep pt-8 text-center text-lg text-muted sm:hidden">
            Verified already?{" "}
            <Link
              href={BRAND.routes.login}
              className="link-wipe font-semibold text-primary"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
