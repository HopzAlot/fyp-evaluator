import { AuthPageHeader } from "@/components/layout/auth/AuthPageHeader";
import { AuthSwitchLink } from "@/components/layout/auth/AuthSwitchLink";
import { LoginForm } from "@/components/layout/auth/LoginForm";

export function LoginPage() {
  return (
    <>
      <AuthPageHeader
        title="Login to your account"
        description="Continue into the workspace connected to your account."
      />
      <LoginForm />
      <AuthSwitchLink
        label="New faculty member?"
        href="/register"
        linkText="Register"
      />
    </>
  );
}
