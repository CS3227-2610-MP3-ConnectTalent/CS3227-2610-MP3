import { isPortfolioUrl } from "@/lib/application-details";
export function ApplicationContactDetails({ full_name, submitted_email, phone, portfolio_url, education, work_experience }: {
  full_name: string | null; submitted_email: string | null; phone: string | null; portfolio_url: string | null; education?: string | null; work_experience?: string | null;
}) {
  return <section className="space-y-3 rounded-xl border bg-white p-5" aria-labelledby="contact-details-heading">
    <h2 id="contact-details-heading" className="text-xl font-semibold">Applicant details</h2>
    <dl className="grid gap-3 sm:grid-cols-[9rem_1fr]">
      <dt className="font-medium">Full name</dt><dd>{full_name || "Not provided"}</dd>
      <dt className="font-medium">Verified email</dt><dd className="break-all">{submitted_email || "Not provided"}</dd>
      <dt className="font-medium">Phone</dt><dd>{phone || "Not provided"}</dd>
      <dt className="font-medium">Portfolio</dt><dd className="break-all">{portfolio_url && isPortfolioUrl(portfolio_url)
        ? <a href={portfolio_url} target="_blank" rel="noopener noreferrer" className="underline">{portfolio_url}</a>
        : "Not provided"}</dd>
      {education !== undefined && <><dt className="font-medium">Education</dt><dd className="whitespace-pre-wrap break-words">{education || 'Not provided'}</dd></>}
      {work_experience !== undefined && <><dt className="font-medium">Work experience</dt><dd className="whitespace-pre-wrap break-words">{work_experience || 'Not provided'}</dd></>}
    </dl>
  </section>;
}
