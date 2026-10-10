"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResumeMetadata } from "@/lib/application-resumes";
export function ResumePanel({ applicationId, revision, editable, resume }: {
  applicationId: string | null; revision: number | null; editable: boolean; resume: ResumeMetadata | null;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function change(intent: "upload" | "remove" | "cancel") {
    if (!applicationId || (intent === "upload" && !file)) { setMessage("Choose a PDF after saving your draft."); return; }
    setPending(true); setMessage("");
    try {
      const response = await fetch(`/api/applications/${applicationId}/resume`, { method: "POST", headers: {
        "x-resume-intent": intent, "x-application-revision": String(revision ?? ""),
        ...(intent === "upload" && file ? { "content-type": file.type, "x-resume-filename": encodeURIComponent(file.name), "x-resume-operation": operation } : {}),
      }, body: intent === "upload" ? file : undefined });
      const data = await response.json();
      setMessage(response.ok ? "Résumé change saved. Review the attachment below." : data.error || "Résumé change could not be saved.");
    } catch { setMessage("We could not confirm the change. Reload to check your saved résumé."); }
    finally { setPending(false); router.refresh(); }
  }
  return <section className="space-y-3 rounded-xl border p-5" aria-labelledby="resume-heading">
    <h2 id="resume-heading" className="text-xl font-semibold">Résumé (optional)</h2>
    {resume ? <p className="break-all"><a href={`/api/applications/${applicationId}/resume`} className="underline">Download résumé: {resume.filename}</a> ({Math.ceil(resume.byte_size / 1024)} KiB)</p> : <p>No résumé attached.</p>}
    {editable && <>
      <p className="text-sm">PDF only, up to 1 MiB. Save your draft first. Submission locks your attachment. Files are private and are not sent to AI.</p>
      <label className="block">Choose PDF résumé<input type="file" accept=".pdf,application/pdf" disabled={pending || !applicationId}
        onChange={event => { setFile(event.target.files?.[0] ?? null); setOperation(crypto.randomUUID()); }} className="mt-2 block w-full min-w-0" /></label>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={pending || !applicationId || !file} onClick={() => void change("upload")} className="rounded-lg border px-4 py-2">{resume ? "Replace résumé" : "Upload résumé"}</button>
        {resume && <button type="button" disabled={pending} onClick={() => void change("remove")} className="rounded-lg border px-4 py-2">Remove résumé</button>}
        <button type="button" disabled={pending || !applicationId} onClick={() => void change("cancel")} className="rounded-lg border px-4 py-2">Cancel interrupted upload</button>
      </div>
    </>}
    {message && <p role="status">{message}</p>}
    {pending && <p role="status">Saving résumé…</p>}
  </section>;
}
