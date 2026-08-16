import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to ${BRAND.name} ${BRAND.suffix} to pick your modules up where you left them and download your certificates.`,
};

/** Sign-in. The frame is `<AuthShell>`; this route owns only its own words. */
export default function LoginPage() {
  return (
    <AuthShell
      mode="login"
      eyebrow="Sign in"
      heading="Pick up where you left off."
      intro="Your progress, your enrolments and your certificates are all held against your account."
      alt={{
        prompt: "No account yet?",
        label: "Create free account",
        href: BRAND.routes.signup,
      }}
    >
      <LoginForm />
    </AuthShell>
  );
}
