# Design: #42 presentation system

## Visual direction

Light canvas (#f5f5f8), charcoal header, white surfaces, dark text and one purple/indigo action accent. Use pale mint/lilac/peach/blue category panels with sufficiently dark text; category is also labelled, never communicated by color alone. Use a system font stack with stronger title/body hierarchy, restrained shadows and generous whitespace. No dark-mode toggle is added.

Public listings: compact title/intro above a two-part layout. Left category sidebar includes All roles and existing five category links with a clear active state. Right area shows actual openings count and responsive cards with category, title, team, description excerpt and a visible detail affordance. Entire cards link to existing details; no nested interactive controls. Do not imply personalized recommendation/ranking. Empty/invalid filters remain clear and recoverable.

Details/forms: a consistent constrained content area, breadcrumb/back links, clear headings, white sections and an action panel. Auth forms remain compact; Applicant form keeps contact/letter sections and separate AI assistance. HR has denser list/review views and explicit separate note/status actions; layout ownership remains role-specific.

## Architecture and boundaries

Change CSS theme tokens and focused presentation components/classes. AccountNavigation retains its server-derived state. Keep auth/data modules, SQL, AI service/route projections, server action contracts, form names/revisions and database policies unchanged. New wrappers must accept explicit children/visual props; no role-switching mega-component or generic data layer. No secrets/private data in screenshots or logs; use synthetic users.

Shared global tokens affect every route, so verify contrast, focus and alert visibility across auth, Applicant and HR pages. Respect semantic landmarks and heading order. Mobile nav wraps; tables can use a labelled bounded scroll container where required without overflowing the page. Existing label text/selectors should remain stable unless an accessibility improvement requires a recorded test update.

## Rollout and rollback

No migration or configuration required. Revert presentation changes to restore baseline; data and server contracts remain intact. Hosted previews/release remain team operations. New requirement decisions discovered while implementing return to approval; do not silently add controls/features from the screenshot.
