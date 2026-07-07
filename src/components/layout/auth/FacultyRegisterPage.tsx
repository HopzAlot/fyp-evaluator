import { AuthCard } from "@/components/layout/auth/AuthCard";
import { AuthPageHeader } from "@/components/layout/auth/AuthPageHeader";
import { AuthSwitchLink } from "@/components/layout/auth/AuthSwitchLink";
import { FacultyRegisterForm } from "@/components/layout/auth/FacultyRegisterForm";

export function FacultyRegisterPage() {
  return (
    <AuthCard size="lg">
      <AuthPageHeader
        title="Create faculty account"
        description="Add your profile details to start using the evaluator workspace."
      />
      <FacultyRegisterForm />
      <AuthSwitchLink
        label="Already registered?"
        href="/faculty/login"
        linkText="Login"
      />
    </AuthCard>
  );
}
