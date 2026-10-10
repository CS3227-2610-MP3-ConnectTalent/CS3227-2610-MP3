import type { ResumeMetadata } from "@/lib/application-resumes";

export type ResumePanelProps = {
  applicationId: string | null;
  revision: number | null;
  editable: boolean;
  resume: ResumeMetadata | null;
  jobId?: string;
  profileMode?: boolean;
  profileResume?: ResumeMetadata | null;
  onChange?: (result: { applicationId?: string; revision?: number }) => void;
  onPending?: (pending: boolean) => void;
};

export type ResumeIntent = "upload" | "remove" | "profile";
