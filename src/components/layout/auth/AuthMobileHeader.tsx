import { AuthBrand } from "@/components/layout/auth/AuthBrand";
import {
  AuthIntro,
  type AuthIntroCopy,
} from "@/components/layout/auth/AuthIntro";

type AuthMobileHeaderProps = {
  intro: AuthIntroCopy;
};

export function AuthMobileHeader({ intro }: AuthMobileHeaderProps) {
  return (
    <header className="mx-auto w-full max-w-3xl lg:hidden">
      <AuthBrand />
      <AuthIntro compact copy={intro} />
    </header>
  );
}
