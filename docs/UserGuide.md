# User Guide

Status: job browsing, Applicant applications, HR review and signup password usability are merged into `develop` through PR #22. HR job posting and AI features remain planned. Shared Development Supabase migration and hosted validation are still pending; this is not a deployed release guide.

## Access

Follow the local Supabase and environment setup in the root `README.md`, then run `corepack pnpm dev` and open <http://localhost:3000>. The demo uses neutral branding and does not require a company name. Use `localhost` consistently during signup and confirmation, since browser sessions are tied to that host.

The home page shows published jobs. Use the category links to filter the list, then select a job card to see its title, team, description, and requirements. The local seed has published jobs in Engineering, Human Resources, and Sales, plus a draft Legal job and a closed Other job; the latter two are hidden from public browsing. No public app deployment or test accounts are available yet.

To apply, select a published job and choose **Apply for this role**. Create an Applicant account with email, a password of at least eight characters, and the same password in **Confirm password**. A mismatch is rejected before signup, shows an error and keeps the entered email for correction. The eye controls on signup and sign-in reveal or hide passwords without submitting the form. Open the verification email before signing in. With local Supabase, confirmation messages appear in the [local mail viewer](http://127.0.0.1:54324) and are **not sent to Gmail**. A signed-in Applicant can save one private cover-letter draft per job and return to it later. The **Submit application** button submits explicitly. Cover letters have a 5,000-character limit. A submitted letter can be edited while its job stays published; the original submission remains visible on the application page. When the job closes, the application remains readable and editing stops. **My applications** lists the signed-in Applicant's own drafts and submissions.

The local stack must have `auth.email.enable_confirmations = true` in `supabase/config.toml`; restart Supabase after changing it. No public app deployment or shared peer-test account is available yet.

## HR review in `develop`

After an administrator promotes a verified, dedicated account to HR, sign in through the same **Sign in** page. The HR account opens **Application review** at `/hr/applications`. The list contains submitted applications only. Open an application to compare original and current cover letters, read private HR notes and status history, add a note of at most 2,000 characters, or change status through the separate **Update status** action. Status starts at **Submitted**; HR may select **In review**, **Shortlisted** or **Rejected** and change among those three later. A stale status form asks you to reload. Submitted applications remain reviewable after job closure. Applicants see their own current status under **My applications**, without HR notes or status history.

Public signup always creates an Applicant. There is no HR signup or role-switching control. A team administrator must provision hosted HR as described in the Developer Guide. For local teammate testing, the README describes a local-only synthetic HR seed command; it does not auto-login or provide a shared grader account. The HR review pages require the issue #9 database migration; a preview using the shared Development Supabase project may be unavailable until the team applies that reviewed migration. HR AI summaries and HR job management remain separate features.

## Planned roles

- **Applicant:** browse published openings, verify an account, save a private text draft, submit and view an application, and edit the letter until the job closes. SoCLaaS cover-letter drafting is planned.
- **HR:** review submitted applications, write private notes and change status in `develop`. Job listing management and a SoCLaaS summary remain planned.

Both AI features are advisory. Applicants submit their own final text; HR makes every hiring decision.
