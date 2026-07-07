import { AuthPageHeader } from "@/components/layout/auth/AuthPageHeader";
import { FacultyRegisterForm } from "@/components/layout/auth/FacultyRegisterForm";

export default function RegisterPage() {
  return (
    <>
      <AuthPageHeader
        title="Create faculty account"
        description="Add your profile details to start using the evaluator workspace."
      />
      <FacultyRegisterForm />
    </>
  );
}
