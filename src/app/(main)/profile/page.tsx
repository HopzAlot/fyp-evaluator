import { ProfileDetails } from "@/components/layout/main/ProfileDetails";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Your faculty profile information.
        </p>
      </section>

      <ProfileDetails />
    </div>
  );
}
