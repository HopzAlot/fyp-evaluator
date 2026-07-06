import { AuthBrand } from "@/features/auth/components/AuthBrand";
import { AuthIntro } from "@/features/auth/components/AuthIntro";

export function AuthMobileHeader() {
  return (
    <header className="mx-auto w-full max-w-3xl lg:hidden">
      <AuthBrand />
      <AuthIntro compact />
    </header>
  );
}
