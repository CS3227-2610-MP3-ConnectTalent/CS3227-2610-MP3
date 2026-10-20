export type ApplicationFormInstance = {
  jobId: string;
  lastApplicationId: string | null;
  generation: number;
  locallyCreatedApplicationId: string | null;
};

export function createApplicationFormInstance(
  jobId: string,
  applicationId: string | null,
): ApplicationFormInstance {
  return {
    jobId,
    lastApplicationId: applicationId,
    generation: 0,
    locallyCreatedApplicationId: null,
  };
}

export function hasPersistedApplicationFields(
  details?: {
    full_name?: string | null;
    phone?: string | null;
    portfolio_url?: string | null;
    education?: string | null;
    work_experience?: string | null;
  } | null,
  value?: string | null,
): boolean {
  if (typeof value === "string" && value.trim().length > 0) return true;
  if (!details) return false;
  return Boolean(
    (details.full_name && details.full_name.trim().length > 0) ||
    (details.phone && details.phone.trim().length > 0) ||
    (details.portfolio_url && details.portfolio_url.trim().length > 0) ||
    (details.education && details.education.trim().length > 0) ||
    (details.work_experience && details.work_experience.trim().length > 0),
  );
}

export function reconcileApplicationFormInstance(
  instance: ApplicationFormInstance,
  jobId: string,
  applicationId: string | null,
  hasServerFields = false,
) {
  if (instance.jobId === jobId && instance.lastApplicationId === applicationId)
    return instance;

  const jobChanged = instance.jobId !== jobId;
  const receivedLocalApplication =
    !jobChanged &&
    applicationId !== null &&
    instance.lastApplicationId === null &&
    (instance.locallyCreatedApplicationId === applicationId ||
      !hasServerFields);
  return {
    jobId,
    lastApplicationId: applicationId,
    generation: instance.generation + (receivedLocalApplication ? 0 : 1),
    locallyCreatedApplicationId: null,
  };
}
