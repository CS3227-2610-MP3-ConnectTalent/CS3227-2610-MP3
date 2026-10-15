import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JOB_CATEGORIES } from "@/lib/job-categories";
import type { HRJob } from "@/lib/hr-jobs";
import { PendingSubmitButton } from "@/components/pending-submit-button";

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
}

export function JobEditor({
  job,
  action,
}: {
  job?: HRJob;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="space-y-5 rounded-lg border p-5">
      {job && <input type="hidden" name="jobId" value={job.id} />}
      <JobIdentityFields job={job} />
      <JobCategoryField job={job} />
      <JobScheduleFields job={job} />
      <JobDescriptionFields job={job} />
      <PendingSubmitButton
        label="Save draft"
        pendingLabel="Saving draft…"
        className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground"
      />
    </form>
  );
}

function JobIdentityFields({ job }: { job?: HRJob }) {
  return (
    <>
      <JobShortTextField
        id="job-title"
        name="title"
        label="Job title"
        value={job?.title}
        maxLength={160}
      />
      <JobShortTextField
        id="job-team"
        name="team"
        label="Team"
        value={job?.team}
        maxLength={120}
      />
    </>
  );
}

function JobShortTextField({
  id,
  name,
  label,
  value,
  maxLength,
}: {
  id: string;
  name: string;
  label: string;
  value?: string;
  maxLength: number;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <Input
        id={id}
        name={name}
        defaultValue={value}
        required
        maxLength={maxLength}
      />
    </div>
  );
}

function JobCategoryField({ job }: { job?: HRJob }) {
  return (
    <div className="space-y-2">
      <label htmlFor="job-category" className="font-medium">
        Category
      </label>
      <select
        id="job-category"
        name="category"
        defaultValue={job?.category ?? ""}
        required
        className="w-full rounded-lg border bg-background p-2"
      >
        <option value="" disabled>
          Choose category
        </option>
        {JOB_CATEGORIES.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function JobScheduleFields({ job }: { job?: HRJob }) {
  return (
    <fieldset className="space-y-4 rounded-lg border p-4">
      <legend className="px-1 font-medium">Schedule (optional)</legend>
      <div className="space-y-2">
        <label htmlFor="job-opens-at" className="font-medium">
          Scheduled opening time
        </label>
        <Input
          id="job-opens-at"
          name="opensAt"
          type="datetime-local"
          defaultValue={toDatetimeLocal(job?.opens_at)}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to open applications immediately when published.
        </p>
      </div>
      <div className="space-y-2">
        <label htmlFor="job-closes-at" className="font-medium">
          Scheduled closing time
        </label>
        <Input
          id="job-closes-at"
          name="closesAt"
          type="datetime-local"
          defaultValue={toDatetimeLocal(job?.closes_at)}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to keep the job open until closed manually.
        </p>
      </div>
    </fieldset>
  );
}

function JobDescriptionFields({ job }: { job?: HRJob }) {
  return (
    <>
      <JobLongTextField
        id="job-description"
        name="description"
        label="Description"
        value={job?.description}
      />
      <JobLongTextField
        id="job-requirements"
        name="requirements"
        label="Requirements"
        value={job?.requirements}
      />
    </>
  );
}

function JobLongTextField({
  id,
  name,
  label,
  value,
}: {
  id: string;
  name: string;
  label: string;
  value?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <Textarea
        id={id}
        name={name}
        defaultValue={value}
        required
        maxLength={10000}
        rows={7}
      />
    </div>
  );
}
