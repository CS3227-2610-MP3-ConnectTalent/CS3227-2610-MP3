import Link from "next/link";

export default function JobNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold">Role not available</h1>
      <p className="mt-3 text-muted-foreground">This job may have closed or is no longer available.</p>
      <Link href="/" className="mt-6 w-fit font-medium underline underline-offset-4">Browse open roles</Link>
    </main>
  );
}
