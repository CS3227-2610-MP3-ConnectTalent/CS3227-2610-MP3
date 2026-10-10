import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JOB_CATEGORIES } from "@/lib/job-categories";
import type { HRJob } from "@/lib/hr-jobs";

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
      <JobDescriptionFields job={job} />
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground"
      >
        Save draft
      </button>
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
