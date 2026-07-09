export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-ink">
      <section className="w-full max-w-md rounded-lg border border-border bg-surface p-6 text-center shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase text-danger">
          Unauthorized
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          You do not have access to this page
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Your account role does not allow this action.
        </p>
      </section>
    </main>
  );
}
