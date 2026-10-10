"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResumeMetadata } from "@/lib/application-resumes";
export function ResumePanel({ applicationId, revision, editable, resume, jobId, profileMode = false, profileResume, onChange, onPending }: {
  applicationId: string | null; revision: number | null; editable: boolean; resume: ResumeMetadata | null;
  jobId?: string; profileMode?: boolean; profileResume?: ResumeMetadata | null;
  onChange?: (result: { applicationId?: string; revision?: number }) => void; onPending?: (pending: boolean) => void;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadFailed, setUploadFailed] = useState(false);
  const [attachment, setAttachment] = useState(resume);
  async function change(intent: "upload" | "remove" | "profile", retry = false) {
    if ((!profileMode && !jobId && !applicationId) || (intent === "upload" && !file)) { setMessage("Choose a PDF résumé."); return; }
    const requestOperation = retry || intent === "profile" ? crypto.randomUUID() : operation;
    if (retry) setOperation(requestOperation);
    setPending(true); onPending?.(true); setMessage(""); setUploadFailed(false);
    try {
      const endpoint = profileMode ? "/api/profile/resume" : jobId ? `/api/jobs/${jobId}/resume` : `/api/applications/${applicationId}/resume`;
      const response = await fetch(endpoint, { method: "POST", headers: {
        "x-resume-intent": intent, "x-application-revision": String(revision ?? ""),
        "x-profile-resume": (profileMode ? attachment?.id : profileResume?.id) ?? "",
        "x-resume-operation": requestOperation, "x-resume-retry": String(retry),
        ...(intent === "upload" && file ? { "content-type": file.type, "x-resume-filename": encodeURIComponent(file.name), "x-resume-operation": requestOperation, "x-resume-retry": String(retry) } : {}),
      }, body: intent === "upload" ? file : undefined });
      const data = await response.json();
      if ("resume" in data) setAttachment(data.resume);
      onChange?.(data);
      setUploadFailed(intent === "upload" && !response.ok);
      setMessage(response.ok ? "Résumé change saved. Review the attachment below." : data.error || "Résumé change could not be saved.");
    } catch { setUploadFailed(intent === "upload"); setMessage("We could not confirm the change. Reload to check your saved résumé."); }
    finally { setPending(false); onPending?.(false); router.refresh(); }
  }
  return <section className="space-y-3 rounded-xl border p-5" aria-labelledby="resume-heading">
    <h2 id="resume-heading" className="text-xl font-semibold">Résumé (optional)</h2>
    {attachment ? <p className="break-all"><a href={profileMode ? "/api/profile/resume" : `/api/applications/${applicationId}/resume`} className="underline">Download résumé: {attachment.filename}</a> ({Math.ceil(attachment.byte_size / 1024)} KiB)</p> : <p>No résumé attached.</p>}
    {editable && <>
      <p className="text-sm">PDF only, up to 1 MiB. {profileMode ? "Uploading does not save other profile fields." : "Upload without saving your form. Submission locks your attachment."} Files are private and are not sent to AI.</p>
      <label className="block">Choose PDF résumé<input type="file" accept=".pdf,application/pdf" disabled={pending}
        onChange={event => { setFile(event.target.files?.[0] ?? null); setOperation(crypto.randomUUID()); setUploadFailed(false); setMessage(""); }} className="mt-2 block w-full min-w-0 rounded-lg border p-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" /></label>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={pending || !file} onClick={() => void change("upload")} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">{attachment ? "Replace résumé" : "Upload résumé"}</button>
        {attachment && <button type="button" disabled={pending} onClick={() => void change("remove")} className="rounded-lg border px-4 py-2">Remove résumé</button>}
        {!profileMode && profileResume && <button type="button" disabled={pending} onClick={() => void change("profile")} className="rounded-lg border px-4 py-2">Use profile résumé</button>}
        {uploadFailed && file && <button type="button" disabled={pending} onClick={() => void change("upload", true)} className="rounded-lg border px-4 py-2 disabled:opacity-50">Retry upload</button>}
      </div>
    </>}
    {message && <p role="status">{message}</p>}
    {pending && <p role="status">Saving résumé…</p>}
  </section>;
}
