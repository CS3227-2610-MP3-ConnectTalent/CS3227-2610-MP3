# Spec delta: accounts and roles

- Issue: [#36](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/36). Owner: Paul Cheng. Status: approved for implementation.
- Canonical: [accounts-and-roles](../../../specs/accounts-and-roles.md).
- Baseline: ProductSpec v1.1 / `dd5e613`; proposed accepted version v1.2.
- Dependencies: ACC-002/003 and SEC-001/002; their authorization rules remain authoritative.
- Implementation approval: Paul Cheng, 2026-10-09, “Approve as written” for the named complete packet. Separate acceptance: Paul Cheng, 2026-10-09, “Accept with recorded limits”. Canonical ACC-005 synced to v1.2 before archive.

## ADDED

### ACC-005: Account navigation and sign out

Before: no explicit requirement for consistent account navigation or logout placement.

After: Public job browsing/detail pages and protected Applicant/HR pages MUST provide consistent account navigation. Guests MUST have Sign in and Create account links without protected role dashboards. Verified Applicants MUST have an Applicant label, My applications link and Sign out action. Verified HR MUST have an HR label, Application review and Manage jobs links and Sign out action, without Applicant dashboard or apply controls. Role display MUST derive from the server-verified current user and database profile, never user-editable metadata. Navigation MUST NOT replace server or database authorization. Authenticated accounts without a verified supported role MUST have a generic account indication and sign out, without role-specific links. Authentication/profile lookup failures MUST NOT expose privileged role controls. A successful sign out MUST return to guest navigation and require authentication for subsequent protected requests. A failed sign out MUST give generic retry feedback and MUST NOT claim success. No password, key or private application information may appear in navigation or error feedback.

- Given a guest browsing an opening, when navigation renders, then account access links appear and no role dashboard appears (nav36-AC-01).
- Given a verified Applicant or HR account, when public or protected product pages render, then only that role's links and its label appear, with Sign out (nav36-AC-02/03).
- Given HR browsing a published job, when job detail renders, then no Applicant apply control appears (nav36-AC-03).
- Given a signed-in user, when sign out succeeds, then guest navigation appears and protected routes require login; when the provider reports failure, then generic retry feedback appears without a success claim (nav36-AC-04).
- Given an unverified account, missing/unknown role, failed role query or forged user metadata, when navigation renders, then no unsupported role controls appear (nav36-AC-05).

## MODIFIED

None.

## REMOVED

None.

Canonical sync completed after separate human acceptance; clause and scenario equivalence verified before archive.
