import Link from "next/link";

export function BackToOpenRoles() {
  return (
    <Link
      href="/"
      className="inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
    >
      ← Back to open roles
    </Link>
  );
}
