import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JOB_CATEGORIES } from "@/lib/job-categories";
import type { HRJob } from "@/lib/hr-jobs";

export function JobEditor({ job, action }: { job?: HRJob; action: (formData: FormData) => Promise<void> }) {
  return <form action={action} className="space-y-5 rounded-lg border p-5">
    {job && <input type="hidden" name="jobId" value={job.id} />}
    <div className="space-y-2"><label htmlFor="job-title" className="font-medium">Job title</label>
      <Input id="job-title" name="title" defaultValue={job?.title} required maxLength={160} /></div>
    <div className="space-y-2"><label htmlFor="job-team" className="font-medium">Team</label>
      <Input id="job-team" name="team" defaultValue={job?.team} required maxLength={120} /></div>
    <div className="space-y-2"><label htmlFor="job-category" className="font-medium">Category</label>
      <select id="job-category" name="category" defaultValue={job?.category ?? ""} required className="w-full rounded-lg border bg-background p-2">
        <option value="" disabled>Choose category</option>
        {JOB_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
      </select></div>
    <div className="space-y-2"><label htmlFor="job-description" className="font-medium">Description</label>
      <Textarea id="job-description" name="description" defaultValue={job?.description} required maxLength={10000} rows={7} /></div>
    <div className="space-y-2"><label htmlFor="job-requirements" className="font-medium">Requirements</label>
      <Textarea id="job-requirements" name="requirements" defaultValue={job?.requirements} required maxLength={10000} rows={7} /></div>
    <button type="submit" className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground">Save draft</button>
  </form>;
}
