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
  const [revisionApplicationId, setRevisionApplicationId] = useState<
    string | null
  >(null);
  if (applicationId !== initialApplicationId) {
    setApplicationId(initialApplicationId);
    const newlyCreatedApplication =
      applicationId === null &&
      initialApplicationId !== null &&
      revisionApplicationId === initialApplicationId;
    const keepLocalRevision =
      newlyCreatedApplication &&
      revision !== null &&
      (initialRevision === null || revision >= initialRevision);
    setRevision(keepLocalRevision ? revision : initialRevision);
    setRevisionApplicationId(keepLocalRevision ? initialApplicationId : null);
  } else if (
    initialRevision !== null &&
    (revision === null || initialRevision > revision)
  ) {
    setRevision(initialRevision);
  }
  return {
    revision,
    setRevision: (value: number, forApplicationId?: string) => {
      setRevision(value);
      setRevisionApplicationId(forApplicationId ?? null);
    },
  };
}
