import { FacultyPasswordForm } from "@/components/layout/faculty/FacultyPasswordForm";
import { FacultyProfileForm } from "@/components/layout/faculty/FacultyProfileForm";

export default function FacultyPage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Faculty information
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Update your faculty profile details used across the evaluator.
        </p>
      </section>

      <FacultyProfileForm />
      <FacultyPasswordForm />
    </div>
  );
}
