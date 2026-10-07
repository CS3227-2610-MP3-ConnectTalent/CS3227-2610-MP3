import { updateApplication } from "@/app/applications/actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ApplicationForm({
  jobId, value, revision, submitted,
}: { jobId: string; value: string; revision: number | null; submitted: boolean }) {
  return <form action={updateApplication.bind(null, jobId)} className="mt-8 space-y-5">
    <input type="hidden" name="revision" value={revision ?? ""} />
    <div className="space-y-2">
      <Label htmlFor="cover_letter">Cover letter</Label>
      <Textarea id="cover_letter" name="cover_letter" defaultValue={value} maxLength={5000}
        rows={12} aria-describedby="letter-help" required={submitted} />
      <p id="letter-help" className="text-sm text-muted-foreground">Maximum 5,000 characters. Your saved draft is private. Submitting is a separate action.</p>
    </div>
    {submitted ? <button name="intent" value="edit" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Save letter changes</button> :
      <div className="flex flex-wrap gap-3">
        <button name="intent" value="save" className="rounded-lg border px-4 py-2">Save draft</button>
        <button name="intent" value="submit" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Submit application</button>
      </div>}
  </form>;
}
