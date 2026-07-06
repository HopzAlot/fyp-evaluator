import { AuthBrand } from "@/features/auth/components/AuthBrand";
import { AuthFeatureTile } from "@/features/auth/components/AuthFeatureTile";
import { AuthIntro } from "@/features/auth/components/AuthIntro";

const authFeatureTiles = [
  {
    title: "Role based",
    description: "Faculty and admin ready",
    tone: "accent",
  },
  {
    title: "Protected",
    description: "RHF powered forms",
    tone: "highlight",
  },
] as const;

export function AuthSidePanel() {
  return (
    <aside className="hidden lg:block">
      <AuthBrand className="mb-8" />
      <AuthIntro />

      <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
        {authFeatureTiles.map((tile) => (
          <AuthFeatureTile
            key={tile.title}
            title={tile.title}
            description={tile.description}
            tone={tile.tone}
          />
        ))}
      </div>
    </aside>
  );
}
