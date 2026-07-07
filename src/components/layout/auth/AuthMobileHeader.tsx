import { AuthBrand } from "@/components/layout/auth/AuthBrand";
import { AuthIntro } from "@/components/layout/auth/AuthIntro";

export function AuthMobileHeader() {
  return (
    <header className="mx-auto w-full max-w-3xl lg:hidden">
      <AuthBrand />
      <AuthIntro compact />
    </header>
  );
}
