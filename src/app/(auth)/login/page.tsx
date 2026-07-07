import { AuthPageHeader } from "@/components/layout/auth/AuthPageHeader";
import { LoginForm } from "@/components/layout/auth/LoginForm";

export default function LoginPage() {
  return (
    <>
      <AuthPageHeader
        title="Login to your account"
        description="Continue into the workspace connected to your account."
      />
      <LoginForm />
    </>
  );
}
