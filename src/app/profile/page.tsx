import { requireApplicant } from "@/lib/auth";
import { getApplicantProfile } from "@/lib/applicant-profile";
import { ProfileForm } from "@/components/profile-form";
import { getProfileResume } from "@/lib/profile-resumes";
export const dynamic = "force-dynamic";
export default async function ProfilePage() {
  const { user } = await requireApplicant({ allowIncomplete: true });
  const profile = await getApplicantProfile();
  const resume = await getProfileResume();
  return <main className="mx-auto max-w-3xl space-y-5 px-5 py-10">
    <h1 className="text-3xl font-semibold">My profile</h1>
    <p>Complete your name and phone number to continue. Your verified email and saved details prefill new applications. Your profile is private.</p>
    <ProfileForm profile={profile} email={user.email ?? ""} resume={resume} />
  </main>;
}
