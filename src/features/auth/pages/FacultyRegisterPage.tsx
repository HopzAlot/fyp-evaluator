import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthPageHeader } from "@/features/auth/components/AuthPageHeader";
import { AuthSwitchLink } from "@/features/auth/components/AuthSwitchLink";
import { FacultyRegisterForm } from "@/features/auth/components/FacultyRegisterForm";

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
