export type ApplicationAttachment = {
  applicationId: string | null;
  revision: number | null;
};

export function reconcileApplicationAttachment(
  current: ApplicationAttachment,
  server: ApplicationAttachment,
): ApplicationAttachment {
  if (current.applicationId === server.applicationId) {
    if (current.revision === server.revision) return current;
    if (
      current.revision !== null &&
      (server.revision === null || server.revision < current.revision)
    ) {
      return current;
    }
  }

  return server;
}
export function hasStaleDisplayedFields(
  serverValue: string,
  serverDetails: {
    full_name?: string | null;
    phone?: string | null;
    portfolio_url?: string | null;
    education?: string | null;
    work_experience?: string | null;
  },
  displayedValues: Record<string, string>,
  displayedLetter: string,
): boolean {
  return (
    serverValue !== displayedLetter ||
    (serverDetails.full_name ?? "") !== displayedValues.full_name ||
    (serverDetails.phone ?? "") !== displayedValues.phone ||
    (serverDetails.portfolio_url ?? "") !== displayedValues.portfolio_url ||
    (serverDetails.education ?? "") !== displayedValues.education ||
    (serverDetails.work_experience ?? "") !== displayedValues.work_experience
  );
}
