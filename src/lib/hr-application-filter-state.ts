import type { HRApplicationFilterParams } from "@/lib/hr-application-search";

export function areHRApplicationFilterParamsEqual(
  left: HRApplicationFilterParams,
  right: HRApplicationFilterParams,
): boolean {
  return (
    left.q === right.q &&
    left.invalidSearch === right.invalidSearch &&
    left.job === right.job &&
    left.status === right.status &&
    left.withdrawal === right.withdrawal &&
    left.sort === right.sort &&
    left.page === right.page &&
    left.pageSize === right.pageSize
  );
}

export function mergeHRApplicationFilterParams(
  current: HRApplicationFilterParams,
  updates: Partial<HRApplicationFilterParams>,
): HRApplicationFilterParams {
  return {
    ...current,
    ...updates,
    page: updates.page ?? 1,
  };
}

export function shouldSyncHRApplicationFilterParams(
  initialParams: HRApplicationFilterParams,
  currentParams: HRApplicationFilterParams | null,
  isPending: boolean,
): boolean {
  return (
    !isPending &&
    currentParams !== null &&
    areHRApplicationFilterParamsEqual(initialParams, currentParams)
  );
}
