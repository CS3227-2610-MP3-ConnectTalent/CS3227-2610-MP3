import { requireApplicant } from "@/lib/auth";
import { getApplicantProfile } from "@/lib/applicant-profile";
import { ProfileForm } from "@/components/profile-form";
export const dynamic = "force-dynamic";
export default async function ProfilePage() {
  const { user } = await requireApplicant();
  const profile = await getApplicantProfile();
  return (
    <main className="mx-auto max-w-3xl space-y-5 px-5 py-10">
      <h1 className="text-3xl font-semibold">My profile</h1>
      <p>
        Save details to prefill new applications. Existing drafts and submitted
        applications will stay unchanged. Your profile is private.
      </p>
      <ProfileForm profile={profile} email={user.email ?? ""} />
    </main>
  );
}
