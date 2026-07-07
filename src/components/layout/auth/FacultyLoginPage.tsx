import { AuthCard } from "@/components/layout/auth/AuthCard";
import { AuthPageHeader } from "@/components/layout/auth/AuthPageHeader";
import { AuthSwitchLink } from "@/components/layout/auth/AuthSwitchLink";
import { FacultyLoginForm } from "@/components/layout/auth/FacultyLoginForm";

export function FacultyLoginPage() {
  return (
    <AuthCard>
      <AuthPageHeader
        title="Login to your account"
        description="Continue to your evaluation workspace."
      />
      <FacultyLoginForm />
      <AuthSwitchLink
        label="New faculty member?"
        href="/faculty/register"
        linkText="Register"
      />
    </AuthCard>
  );
}
