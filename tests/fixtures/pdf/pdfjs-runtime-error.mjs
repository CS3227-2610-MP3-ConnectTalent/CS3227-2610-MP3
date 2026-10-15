export class PasswordException extends Error {}
export class InvalidPDFException extends Error {}
export class UnknownErrorException extends Error {}

export function getDocument() {
  return {
    promise: Promise.reject(
      new UnknownErrorException("synthetic parser runtime failure"),
    ),
    destroy: async () => {},
  };
}
