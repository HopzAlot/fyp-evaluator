export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <header className="mx-auto w-full max-w-3xl lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-base font-semibold text-white">
              FE
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">FYP Evaluator</p>
              <p className="text-sm text-muted">Academic assessment portal</p>
            </div>
          </div>
          <p className="mt-5 text-sm font-semibold uppercase text-accent">
            Faculty Workspace
          </p>
          <h1 className="mt-2 max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">
            Structured project evaluation for cleaner academic workflows.
          </h1>
        </header>

        <aside className="hidden lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-base font-semibold text-white">
              FE
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">FYP Evaluator</p>
              <p className="text-sm text-muted">Academic assessment portal</p>
            </div>
          </div>

          <div className="max-w-md">
            <p className="mb-4 text-sm font-semibold uppercase text-accent">
              Faculty Workspace
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink">
              Structured project evaluation for cleaner academic workflows.
            </h1>
            <p className="mt-5 text-base leading-7 text-muted">
              Register faculty profiles, manage secure access, and keep the
              evaluation experience focused from the first screen.
            </p>
          </div>

          <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
            <div className="border-l-2 border-accent bg-accent-soft px-4 py-3">
              <p className="text-sm font-semibold text-ink">Role based</p>
              <p className="mt-1 text-sm text-muted">Faculty and admin ready</p>
            </div>
            <div className="border-l-2 border-highlight bg-surface px-4 py-3">
              <p className="text-sm font-semibold text-ink">Protected</p>
              <p className="mt-1 text-sm text-muted">RHF powered forms</p>
            </div>
          </div>
        </aside>

        <div className="flex w-full justify-center">{children}</div>
      </div>
    </main>
  );
}
