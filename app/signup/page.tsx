import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create your account",
  description: `Create a free ${BRAND.name} ${BRAND.suffix} account and start a module today. No cost, no prerequisites, open to anyone in ${BRAND.country}.`,
};

/** Sign-up. The frame is `<AuthShell>`; this route owns only its own words. */
export default function SignupPage() {
  return (
    <AuthShell
      mode="signup"
      eyebrow="Free account"
      heading="Start your first module today."
      intro="About a minute to set up. You can be part-way through a lecture before the kettle boils."
      alt={{
        prompt: "Already have an account?",
        label: "Sign in",
        href: BRAND.routes.login,
      }}
    >
      <SignupForm />
    </AuthShell>
  );
}
