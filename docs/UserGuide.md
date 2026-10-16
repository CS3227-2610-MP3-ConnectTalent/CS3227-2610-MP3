---
title: User Guide
sidebar_label: User Guide
hide_title: true
---

# ConnectTalent User Guide

ConnectTalent is a careers portal for **one employer per deployment**. Applicants browse jobs and manage applications; HR publishes jobs and reviews submissions. AI assistance is optional and does not make hiring decisions.

## 1. Getting started

### 1.1 Access the website

- **Application:** [cs3227-mp3.vercel.app](https://cs3227-mp3.vercel.app/), supplied by the team for hosted access.
- **Product/documentation website:** [GitHub Pages](https://cs3227-2610-mp3-connecttalent.github.io/CS3227-2610-MP3/). This is not the application login page.
- **Local development:** usually [localhost:3000](http://localhost:3000); see [local setup](DeveloperGuide.md#2-getting-started).

Use a browser; no desktop installation is required. Local accounts do not automatically work on the hosted website.

Job details, **My profile** and **Manage jobs** have a **Back to open roles** link at the top. Applicants with an incomplete profile remain on **My profile** until they save the required details.

**Verification status, 12 October 2026:** instructions were checked against current `develop` source and specifications. Authenticated hosted workflows were not verified in this review; the team must smoke-test the deployment before evaluator use.

### 1.2 Create and verify an Applicant account

1. Choose **Create account**.
2. Enter email, a password of 8–72 characters and the same password in **Confirm password**.
3. Submit, then open the email verification link in the browser and on the host used for signup.
4. Complete **My profile**.

A password mismatch keeps the entered email available for correction. Eye controls show/hide passwords. Public signup creates an Applicant only. Local verification emails appear in [Mailpit](http://127.0.0.1:54324), not Gmail; hosted delivery depends on the team's email configuration.

### 1.3 Complete your profile

An incomplete signed-in Applicant is directed to **My profile** and cannot use other product pages until completion. Profile file upload, password recovery and Sign out remain available.

| Field                       | Rule                                                                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Full name                   | Required; at most 120 characters.                                                                                                         |
| Verified email              | Required; read-only, from verified Auth.                                                                                                  |
| Phone number                | Required; choose a country calling code and enter national digits. The complete international number contains 7–15 digits, excluding `+`. |
| Portfolio URL               | Optional; HTTP(S), no embedded credentials, at most 2,048 characters.                                                                     |
| Education / Work experience | Optional; at most 2,000 characters each.                                                                                                  |
| Résumé                      | Optional private PDF; see section 3.4.                                                                                                    |

Choose **Save profile** to unlock Careers and applications. Uploading a file does not save typed profile fields or complete onboarding. Phone validation checks format, not reachability.

### 1.4 Sign in, sign out and recover a password

Both roles use **Sign in**. Use **Sign out** in the header when finished; if an error appears, retry rather than assuming the session ended.

Server-backed sign-in, account and HR form actions show an action-specific loading label and disable that form's submit button while its request is pending. If validation or an action error appears, correct it and retry. Loading feedback does not mean the action succeeded; wait for the resulting page or message.

For recovery, choose **Forgot password?**, enter email, open the recovery message in the requesting browser, enter matching new passwords of 8–72 characters, then sign in again. The request acknowledgement is the same for registered and unregistered addresses. Invalid/expired links require another request. Recovery preserves your role; local messages appear in Mailpit.

## 2. Interface overview

| Visitor              | Account navigation                                                            |
| -------------------- | ----------------------------------------------------------------------------- |
| Guest                | Sign in and Create account; public browsing.                                  |
| Incomplete Applicant | My profile and Sign out; onboarding restrictions apply.                       |
| Complete Applicant   | My profile, My applications and Sign out; Careers and applications available. |
| HR                   | Dashboard, Application review, Manage jobs and Sign out.                      |

Categories are **Engineering, Human Resources, Legal, Sales and Other**. Cards include category text as well as color. Layouts adapt to narrow screens. Access is enforced on the server too; opening a direct URL does not grant another role's permissions.

## 3. Applicant workflow

### 3.1 Browse jobs

Guests can browse; signed-in Applicants complete their profile first. Open **Careers**, use category links to filter, and open a job to read title, team, description and requirements. Choose **Apply for this role** and sign in if necessary. Draft/closed jobs are hidden publicly. HR is not offered Applicant apply controls.

Use **Search open roles** to find a phrase in a job's title, team, description or requirements. Matching ignores case and repeated whitespace; the whole phrase must appear in one field. Search and category filters work together. Use up to 100 characters; punctuation is treated literally.

Results update after a short pause (300 ms). Press Enter or choose **Search** to apply immediately. **Clear search** removes only the phrase; **All roles** removes only the category. The address keeps both filters for sharing, refreshing and browser Back/Forward. Without JavaScript, choose **Search** to submit the form. If no roles match, try a different phrase or category; invalid searches show guidance without results.

While a search request is pending, **Search** shows **Searching…** and cannot be pressed again. You can still change the query, category or Clear. A delayed **View role**, **Apply for this role** or return-to-Careers link shows a small loading indicator beside that link; the destination and access rules stay the same. Fast navigation may finish before the indicator appears.

### 3.2 Complete and save an application

New forms prefill saved profile details without AI. Existing drafts take precedence; later profile edits do not overwrite them. The form includes contact details, optional portfolio/background, résumé and cover letter.

- **Save draft** persists a private record for later visits; HR cannot read it.
- Draft application fields may be incomplete, but your account profile must be complete.
- Submission requires full name, verified email, phone and a nonblank cover letter of at most **5,000 characters**.
- Draft editing/submission requires a published job. Closure stops those writes; history remains readable.
- There is at most **one active application per Applicant per job**. If you withdraw a submitted application, you can start a new draft and reapply while the job remains open.
- Validation feedback retains typed values. Saving or generating text does not submit.
- During a slow request, Save draft and Submit application identify the active operation and disable another submission. Résumé Upload, Replace, Remove, Use profile and Retry controls likewise show the active operation and prevent conflicting file actions until it finishes.

### 3.3 Optional AI drafting

Inside **Draft with AI**, enter up to **4,000 characters** of **Experience notes**, then choose **Generate draft**. The suggestion appears in a separate editable **AI draft preview**. Your current letter stays unchanged until you choose **Use this draft** or **Replace current cover letter**. Review all claims before adoption; **Discard suggestion** keeps your existing letter. Adoption changes the form only: **Save draft** or **Submit application** is still required. Notes are used for that request, not stored as application fields. This preview change is locally tested under #94; hosted verification is pending.

Structured profile/contact fields and files are not automatically sent to AI. Personal information you deliberately type in notes/letters may be included. If generation fails or is usage-limited, retain/edit the existing letter and continue manually.

### 3.4 Attach a résumé

The résumé section is below work experience and above AI drafting. Choose **Choose PDF résumé**, select the file, then **Upload résumé** and wait for the download link. **Save draft is not a prerequisite.**

- PDF only; maximum **1 MiB (1,048,576 bytes)**. The PDF must open without entering a password. Encrypted PDFs that open without a password are accepted; password-required or unreadable PDFs are rejected.
- Upload is optional. It may create a private draft for the file without saving other typed fields.
- Before submission, choose another PDF and press **Upload résumé** to replace the attachment. Choose **Delete résumé** to remove it; deletion asks for confirmation. Invalid replacements preserve the prior finalized attachment.
- After an upload failure, press **Upload résumé** again to retry the selected file while preserving typed text. If the outcome is uncertain, reload to inspect the saved attachment before making further changes.
- There is no permanent cancellation button. Downloads are private attachments, not public links or inline previews. Structural validation is not malware scanning.

**My profile** also allows optional private PDF upload. **Use profile résumé** explicitly copies it into the application. Later profile replacement/removal does not alter that copy. Files are not parsed for autofill or sent to AI.

### 3.5 Submit and view

Choose **Submit application** when final. HR receives the submitted details, letter, background and file. Submission freezes them: you cannot edit after submission, even while the job remains open. Contact HR about corrections; no correction workflow is provided in this version.

In **My applications**, choose **View application** to see your own record and current status. Submitted history and permitted downloads remain available after closure. Older submissions lacking fields display **Not provided**.

### 3.6 Withdraw

Open the individual submitted application and choose **Withdraw application**. **Keep application** cancels; **Confirm withdrawal** proceeds. The list itself has status/View only.

Withdrawal is permanent, works after closure and does not erase data/files. You cannot undo it or reapply to that job. Your submitted record remains readable as history.

## 4. HR workflow

### 4.1 HR access

There is no public HR signup or role switch. An administrator assigns HR to a verified dedicated account without Applicant applications. Ask the team for authorized evaluator access; this guide publishes no shared password. Developers can use the [local-only HR seed](DeveloperGuide.md#23-local-hr-account).

### 4.2 HR dashboard

Open **Dashboard** to see job totals by Draft, Published and Closed, submitted applications by review status, and a separate Withdrawn total. The per-job table includes jobs with no applications and closed jobs; choose a job title to open its details. Use **Manage jobs** or **Application review** to continue into the existing HR workflows. The dashboard is read-only and does not show applicant names, contact details, application text, HR notes or résumé information.

### 4.2 Manage jobs

1. Open **Manage jobs**, then **Create draft**.
2. Enter title, team, category, description and requirements; choose **Save draft**.
3. Reopen to edit, then explicitly **Publish job** when ready.
4. On a published job, choose **Close job** when applications should stop.

All fields are required. Title allows 160 characters, team 120, description/requirements 10,000 each. Drafts are hidden from Applicants. Published/closed content is fixed. Closed jobs cannot be reopened, republished or deleted. Closure retains existing applications and allowed history/review/download/withdrawal access.

### 4.3 Review applications

Open **Application review**, then a submission. HR sees submitted applications and withdrawn history, never unsubmitted drafts or mutable private Applicant profiles/profile files.

The detail contains submitted contacts/background, original/current letter sections, application résumé, private notes and status history. Current submissions are immutable; two letter sections do not enable editing.

- **Add a note** / **Add note**: add-only, at most 2,000 characters, with author/time. Applicants cannot see notes.
- **Change review status** / **Update status**: select **In review**, **Shortlisted** or **Rejected** as a separate human action.
- **Submitted** is initial-only. HR can change among the other three without a required reason.
- Reload after a stale-state rejection before retrying.

### 4.4 Optional AI summary

Choose **Summarize** or **Refresh summary** for advisory evidence, requirements not addressed and follow-up questions. Verify against the original letter and requirements. AI does not rank applicants or update status. Failure leaves letter/status unchanged.

Withdrawn submissions remain readable but cannot receive new notes, status changes or AI summaries. Existing notes/history and authorized file downloads remain available.

## 5. Lifecycle reference

| State                              | Meaning / next actions                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Job: Draft                         | HR edits or publishes; publicly hidden.                                                                    |
| Job: Published                     | Public, accepts drafts/submissions; HR may close. Content fixed.                                           |
| Job: Closed                        | Publicly hidden; no new submissions/draft writes. History retained.                                        |
| Application: Draft                 | Owner-only, editable while job published; HR cannot read it.                                               |
| Application: Submitted             | Frozen Applicant content shared with HR; initial review status Submitted.                                  |
| In review / Shortlisted / Rejected | Human-selected HR review status, visible to owner.                                                         |
| Application: Withdrawn             | Terminal retained history; overrides displayed review status. No undo/reapplication/further HR processing. |

Closing a job differs from withdrawing an application. Neither erases records or resets the one-application rule.

## 6. Privacy and evaluator testing

Applicants access their own records; HR accesses submitted snapshots and private review data. Use synthetic details/PDFs for tests. Do not share account credentials or upload another person's résumé.

AI is limited to three requests per user per rolling minute and 24 provider requests per deployment per rolling minute across both features. Wait after a limit message. Structured contact/background fields and files are excluded from automatic AI payloads; deliberately supplied notes/letters remain AI input.

For hosted smoke testing, use separate authorized Applicant/HR accounts: complete a profile; create/publish a synthetic job; save/upload/submit; review/note/change status; close; check history; withdraw; verify HR can read but cannot process the withdrawn record. Record the actual deployment and results. Source checks and earlier local tests do not prove this passed online.

## 7. Troubleshooting and FAQ

| Problem                               | What to do                                                                                                                                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No local verification email           | Open Mailpit on port 54324; local emails do not go to Gmail.                                                                                                                              |
| No hosted verification/recovery email | Check spam; ask the team to check delivery/redirects. Request a fresh expired link.                                                                                                       |
| Every tab returns to My profile       | Save required name and formatted phone. File upload alone is not completion.                                                                                                              |
| No HR navigation                      | Ask the administrator to check the role in the correct environment.                                                                                                                       |
| File exceeds 1 MiB                    | Choose a smaller PDF.                                                                                                                                                                     |
| PDF requires a password               | Upload a copy that opens without a password. The site does not accept PDF passwords.                                                                                                      |
| PDF could not be read                 | Export a new PDF and retry.                                                                                                                                                               |
| File type or filename rejected        | Select a `.pdf` file recognised as PDF; use a simple filename of at most 120 characters.                                                                                                  |
| File could not be received completely | Select the file again and retry.                                                                                                                                                          |
| PDF checking unavailable or timed out | Retry later. This is a server validation problem; the message does not mean your file is invalid. The failed upload does not replace your previous attachment or clear typed form fields. |
| Interrupted upload                    | Press Upload résumé again to retry the selected file; if uncertain, reload to check the attachment. Unsaved text is not automatically stored.                                             |
| Save/status rejected                  | Reload to inspect current revision, job and submission/withdrawal state.                                                                                                                  |
| Cannot edit submission                | Intentional: text/details/files freeze on submission.                                                                                                                                     |
| No Withdraw control                   | Open an individual submitted application; drafts/list do not offer it.                                                                                                                    |
| AI unavailable/limited                | Continue manually; wait after limits.                                                                                                                                                     |
| Local login fails online              | Local, Development and Production databases have separate accounts.                                                                                                                       |

See the [Developer Guide](DeveloperGuide.md) for setup/security/tests and [Reflections](Reflections.md) for individual work.
