import Link from "next/link";
import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/app/auth/reset-password/reset-password-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ResetPassword() {
  const client = await createSupabaseServerClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user?.email_confirmed_at) redirect("/auth/forgot-password?error=link");

  return (
    <main className="mx-auto max-w-md space-y-6 px-5 py-12">
      <h1 className="text-3xl font-semibold">Set a new password</h1>
      <p>Choose a password with 8 to 72 characters for your account.</p>
      <ResetPasswordForm />
      <Link href="/auth/forgot-password" className="underline">Request another link</Link>
    </main>
  );
}
