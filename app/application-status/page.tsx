import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { AuthHeader } from "@/components/auth/auth-header";
import { ApplicationStatusPanel } from "@/components/auth/application-status-panel";

export const metadata: Metadata = {
  title: "Application status",
  description: `Check the status of your ${BRAND.name} ${BRAND.suffix} registration application.`,
};

/**
 * The waiting room between applying and a usable account.
 *
 * SAME SHAPE AS THE OLD `/verify-email` PAGE IT REPLACES - a single centred
 * column under `<AuthHeader>`, not `<AuthShell>`'s two-column sales pitch.
 * That argument (free, no card, cancel any time) is already won by the time
 * someone is standing here; what is left to say is what happens next, and a
 * two-column dark aside repeating the pitch back at somebody waiting on a
 * human reviewer would read as not having noticed they already applied.
 */
export default function ApplicationStatusPage() {
  return (
    <div className="flex flex-1 flex-col [--header-h:4.25rem]">
      <AuthHeader
        alt={{
          prompt: "Approved already?",
          label: "Sign in",
          href: BRAND.routes.login,
        }}
      />

      <main className="flex flex-1 items-center justify-center px-6 py-16 sm:px-10">
        <div className="flex w-full max-w-lg flex-col items-center">
          <ApplicationStatusPanel />

          <p className="mt-8 w-full border-t border-surface-deep pt-8 text-center text-lg text-muted sm:hidden">
            Approved already?{" "}
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
