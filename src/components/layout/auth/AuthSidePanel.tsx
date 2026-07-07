import { AuthBrand } from "@/components/layout/auth/AuthBrand";
import { AuthFeatureTile } from "@/components/layout/auth/AuthFeatureTile";
import {
  AuthIntro,
  type AuthIntroCopy,
} from "@/components/layout/auth/AuthIntro";

const authFeatureTiles = [
  {
    title: "Role based",
    description: "Faculty and admin ready",
    className: "border-accent bg-accent-soft",
  },
  {
    title: "Protected",
    description: "RHF powered forms",
    className: "border-highlight bg-surface",
  },
] as const;

type AuthSidePanelProps = {
  intro: AuthIntroCopy;
};

export function AuthSidePanel({ intro }: AuthSidePanelProps) {
  return (
    <aside className="hidden lg:block">
      <AuthBrand className="mb-8" />
      <AuthIntro copy={intro} />

      <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
        {authFeatureTiles.map((tile) => (
          <AuthFeatureTile
            key={tile.title}
            title={tile.title}
            description={tile.description}
            className={tile.className}
          />
        ))}
      </div>
    </aside>
  );
}
