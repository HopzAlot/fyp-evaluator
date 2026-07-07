import { AuthCard } from "@/components/layout/auth/AuthCard";
import { AuthPageHeader } from "@/components/layout/auth/AuthPageHeader";
import { AuthSwitchLink } from "@/components/layout/auth/AuthSwitchLink";
import { LoginForm } from "@/components/layout/auth/LoginForm";

export function LoginPage() {
  return (
    <AuthCard>
      <AuthPageHeader
        eyebrow="Login Portal"
        title="Login to your account"
        description="Continue into the workspace connected to your account."
      />
      <LoginForm />
      <AuthSwitchLink
        label="New faculty member?"
        href="/register"
        linkText="Register"
      />
    </AuthCard>
  );
}
