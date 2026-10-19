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
