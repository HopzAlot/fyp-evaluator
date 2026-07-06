import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthPageHeader } from "@/features/auth/components/AuthPageHeader";
import { AuthSwitchLink } from "@/features/auth/components/AuthSwitchLink";
import { FacultyLoginForm } from "@/features/auth/components/FacultyLoginForm";

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
