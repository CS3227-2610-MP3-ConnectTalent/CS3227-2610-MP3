# User Guide

Status: job browsing and Applicant account/application flow implemented locally on the issue #6 branch (7 October 2026). HR and AI features remain planned; this branch is not a deployed release.

## Access

Follow the local Supabase and environment setup in the root `README.md`, then run `corepack pnpm dev` and open <http://localhost:3000>. The demo uses neutral branding and does not require a company name. Use `localhost` consistently during signup and confirmation, since browser sessions are tied to that host.

The home page shows published jobs. Use the category links to filter the list, then select a job card to see its title, team, description, and requirements. The local seed has published jobs in Engineering, Human Resources, and Sales, plus a draft Legal job and a closed Other job; the latter two are hidden from public browsing. No public app deployment or test accounts are available yet.

To apply, select a published job and choose **Apply for this role**. Create an Applicant account with email, a password of at least eight characters, and the same password in **Confirm password**. A mismatch is rejected before signup. Open the verification email before signing in. With local Supabase, confirmation messages appear in the [local mail viewer](http://127.0.0.1:54324) and are **not sent to Gmail**. A signed-in Applicant can save one private cover-letter draft per job and return to it later. The **Submit application** button submits explicitly. Cover letters have a 5,000-character limit. A submitted letter can be edited while its job stays published; the original submission remains visible on the application page. When the job closes, the application remains readable and editing stops. **My applications** lists the signed-in Applicant's own drafts and submissions.

The local stack must have `auth.email.enable_confirmations = true` in `supabase/config.toml`; restart Supabase after changing it. No public app deployment or shared peer-test account is available yet. HR review, HR posting UI, and AI features are not available in this branch.

## Planned roles

- **Applicant:** browse published openings, verify an account, save a private text draft, submit and view an application, and edit the letter until the job closes. SoCLaaS cover-letter drafting is planned.
- **HR:** create and manage this company's job listings, publish or close them, review applications, write private notes, change application status, and optionally request a SoCLaaS summary of a cover letter against the selected job's requirements.

Both AI features are advisory. Applicants submit their own final text; HR makes every hiring decision.
