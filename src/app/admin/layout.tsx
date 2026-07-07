export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-ink sm:px-6 lg:px-8">
      {children}
    </main>
  );
}
