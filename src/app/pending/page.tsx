export default function PendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-ink">
      <section className="w-full max-w-md rounded-lg border border-border bg-surface p-6 text-center shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase text-accent">
          Account pending
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Your faculty account is inactive
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          An admin needs to activate your account before you can access the
          faculty workspace.
        </p>
      </section>
    </main>
  );
}
