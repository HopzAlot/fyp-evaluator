import { AuthMobileHeader } from "@/components/layout/auth/AuthMobileHeader";
import { AuthSidePanel } from "@/components/layout/auth/AuthSidePanel";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <AuthMobileHeader />
        <AuthSidePanel />
        <div className="flex w-full justify-center">{children}</div>
      </div>
    </main>
  );
}
