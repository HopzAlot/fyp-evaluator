import { AuthBrand } from "@/components/layout/auth/AuthBrand";
import {
  AuthIntro,
  type AuthIntroCopy,
} from "@/components/layout/auth/AuthIntro";

type AuthSidePanelProps = {
  intro: AuthIntroCopy;
};

export function AuthSidePanel({ intro }: AuthSidePanelProps) {
  return (
    <aside className="hidden lg:block">
      <AuthBrand className="mb-8" />
      <AuthIntro copy={intro} />
    </aside>
  );
}
