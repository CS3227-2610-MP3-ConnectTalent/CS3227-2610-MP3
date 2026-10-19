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

export function reconcileApplicationFormInstance(
  instance: ApplicationFormInstance,
  jobId: string,
  applicationId: string | null,
) {
  if (instance.jobId === jobId && instance.lastApplicationId === applicationId)
    return instance;

  const jobChanged = instance.jobId !== jobId;
  const receivedLocalApplication =
    !jobChanged &&
    applicationId !== null &&
    instance.lastApplicationId === null &&
    instance.locallyCreatedApplicationId === applicationId;
  return {
    jobId,
    lastApplicationId: applicationId,
    generation: instance.generation + (receivedLocalApplication ? 0 : 1),
    locallyCreatedApplicationId: null,
  };
}
