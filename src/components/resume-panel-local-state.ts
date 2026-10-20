import { useState } from "react";
import type { ResumePanelProps } from "./resume-panel-state";

export function useResumeActionAttachment(
  initialResume: ResumePanelProps["resume"],
) {
  const [attachment, setAttachment] = useState(initialResume);
  const [previousResume, setPreviousResume] = useState(initialResume);
  let currentAttachment = attachment;
  if (initialResume !== previousResume) {
    setPreviousResume(initialResume);
    setAttachment(initialResume);
    currentAttachment = initialResume;
  }
  return { attachment: currentAttachment, setAttachment };
}

export function useResumeActionRevision(
  initialApplicationId: string | null,
  initialRevision: number | null,
) {
  const [applicationId, setApplicationId] = useState(initialApplicationId);
  const [revision, setRevision] = useState(initialRevision);
  if (applicationId !== initialApplicationId) {
    setApplicationId(initialApplicationId);
    const newlyCreatedApplication =
      applicationId === null && initialApplicationId !== null;
    setRevision(
      newlyCreatedApplication &&
        revision !== null &&
        (initialRevision === null || revision > initialRevision)
        ? revision
        : initialRevision,
    );
  } else if (
    initialRevision !== null &&
    (revision === null || initialRevision > revision)
  ) {
    setRevision(initialRevision);
  }
  return { revision, setRevision };
}
