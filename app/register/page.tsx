import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Apply for access",
  description: `Apply for a free ${BRAND.name} ${BRAND.suffix} account. Your province's registrar reviews it before you can sign in. No cost, no prerequisites.`,
};

/** Registration. The frame is `<AuthShell>`; this route owns only its own
 *  words. */
export default function RegisterPage() {
  return (
    <AuthShell
      mode="register"
      eyebrow="Free account"
      heading="Apply, and your province takes it from there."
      intro="About a minute to fill in. Your province's registrar reviews every application before sign-in works - most are decided quickly."
      alt={{
        prompt: "Already approved?",
        label: "Sign in",
        href: BRAND.routes.login,
      }}
    >
      <RegisterForm />
    </AuthShell>
  );
}
