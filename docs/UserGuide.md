# User Guide

Status: job browsing, Applicant applications, HR review and password recovery are in `develop`. HR job management is locally accepted on `feat/8-hr-job-management`. Applicant SoCLaaS drafting and HR summaries are implemented on `feat/7-10-soclaas-ai`; independent review, student acceptance and PR closeout remain pending. This branch is not a deployed release.

## Access

Follow the local Supabase and environment setup in the root `README.md`, then run `corepack pnpm dev` and open <http://localhost:3000>. The demo uses neutral branding and does not require a company name. Use `localhost` consistently during signup and confirmation, since browser sessions are tied to that host.

The home page shows published jobs. Use the category links to filter the list, then select a job card to see its title, team, description, and requirements. The local seed has published jobs in Engineering, Human Resources, and Sales, plus a draft Legal job and a closed Other job; the latter two are hidden from public browsing. No public app deployment or test accounts are available yet.

To apply, select a published job and choose **Apply for this role**. Create an Applicant account with email, a password of at least eight characters, and the same password in **Confirm password**. A mismatch is rejected before signup, shows an error and keeps the entered email for correction. The eye controls on signup and sign-in reveal or hide passwords without submitting the form. Open the verification email before signing in. With local Supabase, confirmation messages appear in the [local mail viewer](http://127.0.0.1:54324) and are **not sent to Gmail**. A signed-in Applicant can save one private cover-letter draft per job and return to it later. Before submission, Applicants may edit the letter and optionally generate a SoCLaaS draft from up to 4,000 characters of experience notes. The generated text only fills the editable field; it does not save or submit the application. Check dates, skills and achievements before saving or submitting. The **Submit application** button submits explicitly. Cover letters have a 5,000-character limit. Submission freezes the letter. Contact HR to request a correction. **My applications** lists the signed-in Applicant's own drafts and submissions.

The local stack must have `auth.email.enable_confirmations = true` in `supabase/config.toml`; restart Supabase after changing it. No public app deployment or shared peer-test account is available yet.

## Application details on the #39 branch

The application form includes **Full name**, read-only **Verified email**, **Phone (optional)** and **Portfolio URL (optional)** alongside the cover letter. Full name is required to submit, with a 120-character limit. Phone allows up to 40 characters; portfolio allows up to 2,048 characters and must be an HTTP(S) address without embedded credentials. Empty optional fields are allowed. **Save draft** keeps incomplete details private and lets you resume them later while the job remains open. Validation errors keep your typed values so you can correct them.

**Submit application** shares the details and letter with HR and locks them. The recorded email comes from your verified account. Your application detail shows the submitted information, including after job closure. HR can see contact details only for submitted applications; it cannot edit them. Older submissions without these fields show **Not provided**. AI assistance uses the existing notes/letter and job requirements; it does not automatically receive these structured contact fields. Information you choose to type into notes or the letter remains part of that allowed AI input.

This feature is implemented and independently reviewed locally on `feat/application-form-details`; local acceptance with recorded limits and pending hosted rollout are recorded in the [#39 packet](../workflow/archive/2026-10-09-application-form-details/record.md). Hosted migration needs a coordinated cutover; local availability does not imply a deployed release.

## Forgot password

From **Sign in**, choose **Forgot password?** and enter your account email. The page gives the same acknowledgement whether an account exists or not. In local development, open the reset message at <http://127.0.0.1:54324> and follow its link in the same browser. Enter and confirm a new password of 8 to 72 characters. After the update, sign in with the new password. An invalid or expired link sends you back to request another. This works for Applicant and HR accounts and does not change their roles. Hosted recovery depends on configured email delivery and the recovery callback URL in Supabase Auth.

## HR review in `develop`

After an administrator promotes a verified, dedicated account to HR, sign in through the same **Sign in** page. The HR account opens **Application review** at `/hr/applications`. The list contains submitted applications only. Open an application to compare original and current cover letters, read private HR notes and status history, add a note of at most 2,000 characters, or change status through the separate **Update status** action. Status starts at **Submitted**; HR may select **In review**, **Shortlisted** or **Rejected** and change among those three later. A stale status form asks you to reload. Submitted applications remain reviewable after job closure. HR may also request a SoCLaaS summary of the submitted letter and published requirements; its evidence, missing-requirement and follow-up sections appear beside the original. Verify the summary against the letter. It does not rank or recommend applicants and cannot change status. Applicants see their own current status under **My applications**, without HR notes or status history.

Public signup always creates an Applicant. There is no HR signup or role-switching control. A team administrator must provision hosted HR as described in the Developer Guide. For local teammate testing, the README describes a local-only synthetic HR seed command; it does not auto-login or provide a shared grader account. The HR review pages require the issue #9 database migration; a preview using the shared Development Supabase project may be unavailable until the team applies that reviewed migration. SoCLaaS requires server-side configuration as described in the root README; without it, the AI actions show a safe unavailable state.

## HR job management on this branch

After signing in as HR, choose **Manage jobs** from **Application review**, or open `/hr/jobs`. Choose **Create draft**, fill in the job title, team, category, description and requirements, then **Save draft**. You can reopen and edit a draft. Draft jobs stay hidden from public browsing. On the draft detail page, **Publish job** is a separate action that makes the fixed job visible and accepts applications. Published content cannot be edited. **Close job** is a separate action on a published job; the job then disappears from public browsing and stops accepting applications or edits to submitted cover letters. Applicants and HR can still read existing applications under their normal access rules. Closed jobs remain visible to HR and cannot be republished in this version. There is no job deletion or reopening action.

Local testing requires the #8 migration in addition to the earlier migrations. This feature has been checked locally; shared Development Supabase migration, preview testing and release are pending team operations.

## Planned roles

- **Applicant:** browse published openings, verify an account, save a private text draft, optionally generate a cover-letter draft before submission, submit and view an application. Submitted letters are frozen; correction requests go to HR.
- **HR:** review submitted applications, write private notes, request a bounded SoCLaaS summary, and change status through a separate explicit action; manage jobs locally on this branch.

Both AI features are advisory. Applicants submit their own final text; HR makes every hiring decision.
