import Link from "next/link";
import { PendingLinkStatus } from "@/components/pending-link-status";

export function BackToOpenRoles() {
  return (
    <Link
      href="/"
      className="inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
    >
      ← Back to open roles
      <PendingLinkStatus label="Opening roles…" />
    </Link>
  );
}
