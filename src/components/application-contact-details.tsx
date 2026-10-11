import { isPortfolioUrl } from "@/lib/application-details";

type ContactDetails = {
  full_name: string | null;
  submitted_email: string | null;
  phone: string | null;
  portfolio_url: string | null;
  education?: string | null;
  work_experience?: string | null;
};

export function ApplicationContactDetails(details: ContactDetails) {
  return (
    <section
      className="space-y-3 rounded-xl border bg-white p-5"
      aria-labelledby="contact-details-heading"
    >
      <h2 id="contact-details-heading" className="text-xl font-semibold">
        Applicant details
      </h2>
      <dl className="grid gap-3 sm:grid-cols-[9rem_1fr]">
        <IdentityDetails details={details} />
        <BackgroundDetails details={details} />
      </dl>
    </section>
  );
}

function IdentityDetails({ details }: { details: ContactDetails }) {
  return (
    <>
      <dt className="font-medium">Full name</dt>
      <dd>{details.full_name || "Not provided"}</dd>
      <dt className="font-medium">Verified email</dt>
      <dd className="break-all">{details.submitted_email || "Not provided"}</dd>
      <dt className="font-medium">Phone</dt>
      <dd>{details.phone || "Not provided"}</dd>
      <dt className="font-medium">Portfolio</dt>
      <dd className="break-all">
        <PortfolioLink value={details.portfolio_url} />
      </dd>
    </>
  );
}

function PortfolioLink({ value }: { value: string | null }) {
  if (!value || !isPortfolioUrl(value)) return <>Not provided</>;
  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="underline"
    >
      {value}
    </a>
  );
}

function BackgroundDetails({ details }: { details: ContactDetails }) {
  return (
    <>
      {details.education !== undefined && (
        <DetailRow label="Education" value={details.education} />
      )}
      {details.work_experience !== undefined && (
        <DetailRow label="Work experience" value={details.work_experience} />
      )}
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <>
      <dt className="font-medium">{label}</dt>
      <dd className="whitespace-pre-wrap break-words">
        {value || "Not provided"}
      </dd>
    </>
  );
}
